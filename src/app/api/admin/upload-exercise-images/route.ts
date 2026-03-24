// E:\guide-digitali\src\app\api\admin\upload-exercise-images\route.ts
// Carica foto esercizi su Supabase Storage e ritorna la mappa nome -> URL

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Mappa esercizi -> file foto locale
const EXERCISE_PHOTOS: Record<string, string> = {
  'pushup': 'pushup.jpg',
  'push up': 'pushup.jpg',
  'panca manubri': 'manubri su panca piana.jpg',
  'chest press manubri': 'manubri su panca piana.jpg',
  'distensioni manubri panca': 'manubri su panca piana.jpg',
  'press manubri': 'press manubri.jpg',
  'shoulder press': 'press manubri.jpg',
  'alzate laterali': 'alzate laterali complete.jpg',
  'curl manubri': 'curl manubri.jpg',
  'curl hammer': 'curl hammer.jpg',
  'curl ez': 'curl ez.jpg',
  'french press': 'french press 1 man.jpg',
  'squat': 'squat air.jpg',
  'squat air': 'squat air.jpg',
  'bodyweight squat': 'squat air.jpg',
  'affondi': 'affondi overhead .jpg',
  'lunge': 'affondi overhead .jpg',
  'squat bulgaro': 'squat bulgaro.jpg',
  'bulgarian squat': 'squat bulgaro.jpg',
  'squat jump': 'squat jump.jpg',
  'jump squat': 'squat jump.jpg',
  'burpees': 'burpees.jpg',
  'burpee': 'burpees.jpg',
  'crunch obliqui': 'crunch obliqui su hyper.jpg',
  'crunch': 'crunch obliqui su hyper.jpg',
  'leg raise': 'leg raise alla sbarra.jpg',
  'leg extension': 'leg extension.jpg',
  'ab wheel': 'ab wheel.jpg',
  'plank': 'plank trex.jpg',
  'dip': 'dip .jpg',
  'dips': 'dip .jpg',
  'pushup diamond': 'pushup diamond 1.jpg',
  'diamond pushup': 'pushup diamond 1.jpg',
  'mountain climber': 'mountain climber.jpg',
  'alzate frontali': 'alz frontali manubri.jpg',
  'alzate frontali manubri': 'alz frontali manubri.jpg',
  'squeeze press': 'squeeze press .jpg',
  'croci manubri': 'croci manubri su panca.jpg',
  'pushdown cavi': 'pushdown ai cavi.jpg',
};

// Nomi italiani per la guida
const EXERCISE_NAMES_IT: Record<string, string> = {
  'pushup': 'Push Up',
  'push up': 'Push Up',
  'panca manubri': 'Distensioni su Panca con Manubri',
  'chest press manubri': 'Distensioni su Panca con Manubri',
  'distensioni manubri panca': 'Distensioni su Panca con Manubri',
  'press manubri': 'Press Manubri (Spalle)',
  'shoulder press': 'Press Manubri (Spalle)',
  'alzate laterali': 'Alzate Laterali con Manubri',
  'curl manubri': 'Curl con Manubri',
  'curl hammer': 'Curl Hammer',
  'curl ez': 'Curl con Bilanciere EZ',
  'french press': 'French Press con Manubrio',
  'squat': 'Squat a Corpo Libero',
  'squat air': 'Squat a Corpo Libero',
  'bodyweight squat': 'Squat a Corpo Libero',
  'affondi': 'Affondi',
  'lunge': 'Affondi',
  'squat bulgaro': 'Squat Bulgaro',
  'bulgarian squat': 'Squat Bulgaro',
  'squat jump': 'Squat Jump',
  'jump squat': 'Squat Jump',
  'burpees': 'Burpees',
  'burpee': 'Burpees',
  'crunch obliqui': 'Crunch Obliqui',
  'crunch': 'Crunch',
  'leg raise': 'Leg Raise alla Sbarra',
  'leg extension': 'Leg Extension',
  'ab wheel': 'Ab Wheel Rollout',
  'plank': 'Plank',
  'dip': 'Dip alle Parallele',
  'dips': 'Dip alle Parallele',
  'pushup diamond': 'Push Up Diamond',
  'diamond pushup': 'Push Up Diamond',
  'mountain climber': 'Mountain Climber',
  'alzate frontali': 'Alzate Frontali con Manubri',
  'alzate frontali manubri': 'Alzate Frontali con Manubri',
  'squeeze press': 'Squeeze Press con Manubri',
  'croci manubri': 'Croci con Manubri su Panca',
  'pushdown cavi': 'Pushdown ai Cavi',
};

const PHOTOS_DIR = 'E:\\foto esercizi Andrea';

export async function POST(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('guide_admin_auth');
    if (authCookie?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { exercises } = await request.json();
    // exercises = ['pushup', 'squat', 'plank', ...]

    const results: Record<string, { url: string; name_it: string }> = {};

    for (const exercise of exercises) {
      const key = exercise.toLowerCase().trim();
      const filename = EXERCISE_PHOTOS[key];

      if (!filename) {
        console.log(`Esercizio non mappato: ${key}`);
        continue;
      }

      const safeKey = key.replace(/\s+/g, '-');
      const storagePath = `guide-images/exercises/${safeKey}.jpg`;

      // Prova prima a leggere da locale (sviluppo)
      let uploaded = false;
      try {
        const localPath = path.join(PHOTOS_DIR, filename);
        if (fs.existsSync(localPath)) {
          const fileBuffer = fs.readFileSync(localPath);
          const { error: uploadError } = await supabase.storage
            .from('guide-pdfs')
            .upload(storagePath, fileBuffer, {
              contentType: 'image/jpeg',
              upsert: true,
            });
          if (!uploadError) uploaded = true;
          else console.error(`Errore upload ${key}:`, uploadError);
        }
      } catch {
        // Su Vercel fs non ha accesso a E:\, verifica se esiste gia nel bucket
      }

      // Se non caricato da locale, verifica se esiste gia su Supabase
      if (!uploaded) {
        const { data: list } = await supabase.storage
          .from('guide-pdfs')
          .list('guide-images/exercises', { search: safeKey });
        if (!list || list.length === 0) {
          console.log(`Foto non trovata ne in locale ne su Supabase: ${key}`);
          continue;
        }
      }

      const { data: urlData } = supabase.storage
        .from('guide-pdfs')
        .getPublicUrl(storagePath);

      results[key] = {
        url: urlData.publicUrl,
        name_it: EXERCISE_NAMES_IT[key] || exercise,
      };
    }

    return NextResponse.json({ success: true, exercises: results });
  } catch (error: unknown) {
    console.error('Errore upload esercizi:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Errore' }, { status: 500 });
  }
}

// GET: ritorna lista esercizi disponibili
export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get('guide_admin_auth');
  if (authCookie?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  return NextResponse.json({
    available: Object.keys(EXERCISE_PHOTOS).map(key => ({
      key,
      name_it: EXERCISE_NAMES_IT[key] || key,
      file: EXERCISE_PHOTOS[key],
    }))
  });
}
