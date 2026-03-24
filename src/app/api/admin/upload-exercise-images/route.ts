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

// Mappa esercizi -> [foto_start, foto_end] (posizione iniziale e finale)
const EXERCISE_PHOTOS: Record<string, [string, string]> = {
  'pushup':                    ['pushup.jpg', 'pushup1.jpg'],
  'push up':                   ['pushup.jpg', 'pushup1.jpg'],
  'panca manubri':             ['manubri su panca piana.jpg', 'manubri panca unilat1.jpg'],
  'chest press manubri':       ['manubri su panca piana.jpg', 'manubri panca unilat1.jpg'],
  'distensioni manubri panca': ['manubri su panca piana.jpg', 'manubri panca unilat1.jpg'],
  'press manubri':             ['press manubri.jpg', 'press manubri1.jpg'],
  'shoulder press':            ['press manubri.jpg', 'press manubri1.jpg'],
  'alzate laterali':           ['alzate laterali complete.jpg', 'alzate laterali complete 2.jpg'],
  'curl manubri':              ['curl manubri.jpg', 'curl manubri 2.jpg'],
  'curl hammer':               ['curl hammer.jpg', 'curl hammer 1.jpg'],
  'curl ez':                   ['curl ez.jpg', 'curl ez 1.jpg'],
  'french press':              ['french press bil ez.jpg', 'french press bil ez1.jpg'],
  'squat':                     ['squat air.jpg', 'squat air1.jpg'],
  'squat air':                 ['squat air.jpg', 'squat air1.jpg'],
  'bodyweight squat':          ['squat air.jpg', 'squat air1.jpg'],
  'affondi':                   ['affondi overhead .jpg', 'affondi overhead1.jpg'],
  'lunge':                     ['affondi overhead .jpg', 'affondi overhead1.jpg'],
  'squat bulgaro':             ['squat bulgaro.jpg', 'squat bulgaro2.jpg'],
  'bulgarian squat':           ['squat bulgaro.jpg', 'squat bulgaro2.jpg'],
  'squat jump':                ['squat jump.jpg', 'squat jump1.jpg'],
  'jump squat':                ['squat jump.jpg', 'squat jump1.jpg'],
  'burpees':                   ['burpees.jpg', 'burpees1.jpg'],
  'burpee':                    ['burpees.jpg', 'burpees1.jpg'],
  'crunch obliqui':            ['crunch obliqui su hyper.jpg', 'crunch obliqui su hyper1.jpg'],
  'crunch':                    ['crunch obliqui su hyper.jpg', 'crunch obliqui su hyper1.jpg'],
  'leg raise':                 ['leg raise alla sbarra.jpg', 'leg raise alla sbarra2.jpg'],
  'leg extension':             ['leg extension.jpg', 'leg extension1.jpg'],
  'ab wheel':                  ['ab wheel.jpg', 'ab wheel 1.jpg'],
  'plank':                     ['plank trex.jpg', 'plank trex 1.jpg'],
  'dip':                       ['dip .jpg', 'dip 1.jpg'],
  'dips':                      ['dip .jpg', 'dip 1.jpg'],
  'pushup diamond':            ['pushup diamnond.jpg', 'pushup diamond 1.jpg'],
  'diamond pushup':            ['pushup diamnond.jpg', 'pushup diamond 1.jpg'],
  'mountain climber':          ['mountain climber.jpg', 'mountain climber3.jpg'],
  'alzate frontali':           ['alz frontali manubri.jpg', 'alzate frontali man1.jpg'],
  'alzate frontali manubri':   ['alz frontali manubri.jpg', 'alzate frontali man1.jpg'],
  'squeeze press':             ['squeeze press .jpg', 'squeeze press1.jpg'],
  'croci manubri':             ['croci manubri su panca.jpg', 'croci man2.jpg'],
  'pushdown cavi':             ['pushdown ai cavi.jpg', 'pushdown ai cavi1.jpg'],
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

// Mapping ID libreria -> foto [start, end]
const LIBRARY_PHOTOS: Record<string, [string, string]> = {
  'pushup': ['pushup.jpg', 'pushup1.jpg'],
  'pushup-diamond': ['pushup diamnond.jpg', 'pushup diamond 1.jpg'],
  'panca-manubri': ['manubri su panca piana.jpg', 'manubri su panca unilaterale.jpg'],
  'croci-manubri': ['croci manubri su panca.jpg', 'croci man2.jpg'],
  'squeeze-press': ['squeeze press .jpg', 'squeeze press1.jpg'],
  'press-manubri': ['press manubri.jpg', 'press manubri1.jpg'],
  'alzate-laterali': ['alzate laterali complete.jpg', 'alzate laterali complete 2.jpg'],
  'alzate-frontali': ['alz frontali manubri.jpg', 'alzate frontali man1.jpg'],
  'curl-manubri': ['curl manubri.jpg', 'curl manubri 2.jpg'],
  'curl-hammer': ['curl hammer.jpg', 'curl hammer 1.jpg'],
  'curl-ez': ['curl ez.jpg', 'curl ez 1.jpg'],
  'french-press': ['french press bil ez.jpg', 'french press bil ez1.jpg'],
  'dip': ['dip .jpg', 'dip 1.jpg'],
  'pushdown-cavi': ['pushdown ai cavi.jpg', 'pushdown ai cavi1.jpg'],
  'squat': ['squat air.jpg', 'squat air1.jpg'],
  'squat-jump': ['squat jump.jpg', 'squat jump1.jpg'],
  'squat-bulgaro': ['squat bulgaro.jpg', 'squat bulgaro2.jpg'],
  'affondi': ['affondi overhead .jpg', 'affondi overhead1.jpg'],
  'leg-extension': ['leg extension.jpg', 'leg extension1.jpg'],
  'crunch': ['crunch obliqui su hyper.jpg', 'crunch obliqui su hyper1.jpg'],
  'leg-raise': ['leg raise alla sbarra.jpg', 'leg raise alla sbarra2.jpg'],
  'ab-wheel': ['ab wheel.jpg', 'ab wheel 1.jpg'],
  'plank': ['plank trex.jpg', 'plank trex 1.jpg'],
  'mountain-climber': ['mountain climber.jpg', 'mountain climber3.jpg'],
  'burpees': ['burpees.jpg', 'burpees1.jpg'],
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

    const results: Record<string, { url: string; url_end?: string; name_it: string }> = {};

    for (const exercise of exercises) {
      const key = exercise.toLowerCase().trim();
      // Cerca prima in LIBRARY_PHOTOS (per ID), poi in EXERCISE_PHOTOS (per nome)
      const filename = LIBRARY_PHOTOS[key] || EXERCISE_PHOTOS[key];

      if (!filename) {
        console.log(`Esercizio non mappato: ${key}`);
        continue;
      }

      const safeKey = key.replace(/\s+/g, '-');
      const [startFile, endFile] = filename;
      const startPath = `guide-images/exercises/${safeKey}-start.jpg`;
      const endPath = `guide-images/exercises/${safeKey}-end.jpg`;

      let startUploaded = false;
      let endUploaded = false;

      // Prova a caricare da locale (sviluppo)
      try {
        const localStart = path.join(PHOTOS_DIR, startFile);
        const localEnd = path.join(PHOTOS_DIR, endFile);

        if (fs.existsSync(localStart)) {
          const buf = fs.readFileSync(localStart);
          const { error } = await supabase.storage.from('guide-pdfs').upload(startPath, buf, { contentType: 'image/jpeg', upsert: true });
          if (!error) startUploaded = true;
        }
        if (fs.existsSync(localEnd)) {
          const buf = fs.readFileSync(localEnd);
          const { error } = await supabase.storage.from('guide-pdfs').upload(endPath, buf, { contentType: 'image/jpeg', upsert: true });
          if (!error) endUploaded = true;
        }
      } catch {
        // Su Vercel, verifica se esistono gia nel bucket
      }

      // Se non caricato, verifica se esiste gia su Supabase
      if (!startUploaded) {
        const { data: list } = await supabase.storage.from('guide-pdfs').list('guide-images/exercises', { search: `${safeKey}-start` });
        if (!list || list.length === 0) {
          console.log(`Foto start non trovata: ${key}`);
          continue;
        }
      }

      const { data: startUrl } = supabase.storage.from('guide-pdfs').getPublicUrl(startPath);
      const { data: endUrl } = supabase.storage.from('guide-pdfs').getPublicUrl(endPath);

      results[key] = {
        url: startUrl.publicUrl,
        url_end: endUrl.publicUrl,
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
