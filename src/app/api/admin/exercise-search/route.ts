// E:\guide-digitali\src\app\api\admin\exercise-search\route.ts
// Cerca esercizi da free-exercise-db locale e restituisce risultati

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = 'E:/free-exercise-db-main/dist/exercises.json';

interface ExerciseEntry {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  images: string[];
  level: string;
  category: string;
}

let exercisesCache: ExerciseEntry[] | null = null;

function loadExercises(): ExerciseEntry[] {
  if (exercisesCache) return exercisesCache;
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    exercisesCache = JSON.parse(raw);
    return exercisesCache!;
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get('guide_admin_auth');
  if (authCookie?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get('q')?.toLowerCase() || '';
  const muscle = request.nextUrl.searchParams.get('muscle')?.toLowerCase() || '';
  const equipment = request.nextUrl.searchParams.get('equipment')?.toLowerCase() || '';

  const exercises = loadExercises();

  let filtered = exercises;

  if (q) {
    filtered = filtered.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.primaryMuscles.some(m => m.toLowerCase().includes(q)) ||
      e.equipment.toLowerCase().includes(q)
    );
  }

  if (muscle) {
    filtered = filtered.filter(e =>
      e.primaryMuscles.some(m => m.toLowerCase().includes(muscle))
    );
  }

  if (equipment) {
    filtered = filtered.filter(e => e.equipment.toLowerCase().includes(equipment));
  }

  // Limita a 50 risultati
  const results = filtered.slice(0, 50).map(e => ({
    id: e.id,
    name: e.name,
    muscles: e.primaryMuscles.join(', '),
    equipment: e.equipment,
    level: e.level,
    hasImages: e.images.length >= 2,
  }));

  return NextResponse.json({ results, total: filtered.length });
}
