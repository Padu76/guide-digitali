// E:\guide-digitali\src\app\api\admin\upload-exercise\route.ts
// Carica le 2 foto (0.jpg + 1.jpg) di un esercizio su Supabase Storage

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const EXERCISES_PATH = 'E:/free-exercise-db-main/exercises';

export async function POST(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('guide_admin_auth');
    if (authCookie?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { exerciseId, slug } = await request.json();
    if (!exerciseId) {
      return NextResponse.json({ error: 'exerciseId richiesto' }, { status: 400 });
    }

    const exerciseDir = path.join(EXERCISES_PATH, exerciseId);
    const startPath = path.join(exerciseDir, '0.jpg');
    const endPath = path.join(exerciseDir, '1.jpg');

    if (!fs.existsSync(startPath)) {
      return NextResponse.json({ error: `Immagine non trovata: ${startPath}` }, { status: 404 });
    }

    const guideSlug = slug || 'shared';
    const urls: { start: string; end?: string } = { start: '' };

    // Upload 0.jpg (inizio)
    const startBuffer = fs.readFileSync(startPath);
    const startFileName = `guide-images/exercises/${exerciseId}_0.jpg`;

    // Controlla se esiste gia
    const { data: existing } = supabase.storage
      .from('guide-pdfs')
      .getPublicUrl(startFileName);

    // Upload con upsert
    await supabase.storage
      .from('guide-pdfs')
      .upload(startFileName, startBuffer, { contentType: 'image/jpeg', upsert: true });

    const { data: startUrl } = supabase.storage
      .from('guide-pdfs')
      .getPublicUrl(startFileName);
    urls.start = startUrl.publicUrl;

    // Upload 1.jpg (fine) se esiste
    if (fs.existsSync(endPath)) {
      const endBuffer = fs.readFileSync(endPath);
      const endFileName = `guide-images/exercises/${exerciseId}_1.jpg`;

      await supabase.storage
        .from('guide-pdfs')
        .upload(endFileName, endBuffer, { contentType: 'image/jpeg', upsert: true });

      const { data: endUrl } = supabase.storage
        .from('guide-pdfs')
        .getPublicUrl(endFileName);
      urls.end = endUrl.publicUrl;
    }

    return NextResponse.json({ success: true, urls });
  } catch (err) {
    return NextResponse.json({ error: 'Errore server: ' + (err instanceof Error ? err.message : 'sconosciuto') }, { status: 500 });
  }
}
