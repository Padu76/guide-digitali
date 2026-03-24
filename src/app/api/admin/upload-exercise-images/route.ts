// E:\guide-digitali\src\app\api\admin\upload-exercise-images\route.ts
// Carica foto esercizi su Supabase Storage — supporta foto Andrea (locale) e GitHub

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { EXERCISE_LIBRARY } from '@/lib/exercise-library';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PHOTOS_DIR = 'E:\\foto esercizi Andrea';

async function uploadToStorage(storagePath: string, buffer: Buffer | ArrayBuffer, contentType: string): Promise<boolean> {
  const { error } = await supabase.storage.from('guide-pdfs').upload(storagePath, buffer, { contentType, upsert: true });
  return !error;
}

export async function POST(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('guide_admin_auth');
    if (authCookie?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { exercises } = await request.json();
    const results: Record<string, { url: string; url_end?: string; name_it: string }> = {};

    for (const exerciseId of exercises) {
      const exercise = EXERCISE_LIBRARY.find(e => e.id === exerciseId);
      if (!exercise) {
        console.log(`Esercizio non trovato in libreria: ${exerciseId}`);
        continue;
      }

      const safeId = exerciseId.replace(/\s+/g, '-');
      const startPath = `guide-images/exercises/${safeId}-start.jpg`;
      const endPath = `guide-images/exercises/${safeId}-end.jpg`;

      let startOk = false;
      let endOk = false;

      if (exercise.source === 'andrea') {
        // Foto locali di Andrea
        try {
          const startFile = path.join(PHOTOS_DIR, exercise.photos.start);
          const endFile = path.join(PHOTOS_DIR, exercise.photos.end);

          if (fs.existsSync(startFile)) {
            startOk = await uploadToStorage(startPath, fs.readFileSync(startFile), 'image/jpeg');
          }
          if (fs.existsSync(endFile)) {
            endOk = await uploadToStorage(endPath, fs.readFileSync(endFile), 'image/jpeg');
          }
        } catch {
          // Su Vercel: controlla se gia su Supabase
          const { data: list } = await supabase.storage.from('guide-pdfs').list('guide-images/exercises', { search: safeId });
          if (list && list.length > 0) { startOk = true; endOk = true; }
        }
      } else if (exercise.source === 'github') {
        // Scarica da GitHub e carica su Supabase
        try {
          const startRes = await fetch(exercise.photos.start, { signal: AbortSignal.timeout(15000) });
          if (startRes.ok) {
            const buf = await startRes.arrayBuffer();
            startOk = await uploadToStorage(startPath, buf, 'image/jpeg');
          }
        } catch (e) { console.error(`GitHub fetch start ${exerciseId}:`, e); }

        try {
          const endRes = await fetch(exercise.photos.end, { signal: AbortSignal.timeout(15000) });
          if (endRes.ok) {
            const buf = await endRes.arrayBuffer();
            endOk = await uploadToStorage(endPath, buf, 'image/jpeg');
          }
        } catch (e) { console.error(`GitHub fetch end ${exerciseId}:`, e); }
      }

      // Se non caricato, controlla se esiste gia nel bucket
      if (!startOk) {
        const { data: list } = await supabase.storage.from('guide-pdfs').list('guide-images/exercises', { search: `${safeId}-start` });
        if (list && list.length > 0) startOk = true;
      }

      if (startOk) {
        const { data: startUrl } = supabase.storage.from('guide-pdfs').getPublicUrl(startPath);
        const { data: endUrl } = supabase.storage.from('guide-pdfs').getPublicUrl(endPath);

        results[exerciseId] = {
          url: startUrl.publicUrl,
          url_end: endOk ? endUrl.publicUrl : undefined,
          name_it: exercise.nameIt || exercise.name,
        };
      } else {
        console.log(`Nessuna immagine per: ${exerciseId}`);
      }
    }

    return NextResponse.json({ success: true, exercises: results });
  } catch (error: unknown) {
    console.error('Errore upload esercizi:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Errore' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get('guide_admin_auth');
  if (authCookie?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  return NextResponse.json({
    total: EXERCISE_LIBRARY.length,
    andrea: EXERCISE_LIBRARY.filter(e => e.source === 'andrea').length,
    github: EXERCISE_LIBRARY.filter(e => e.source === 'github').length,
  });
}
