// E:\guide-digitali\src\lib\exercise-library.ts
// Libreria esercizi con foto di Andrea — usata dal generatore guide fitness

export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  equipment: 'corpo libero' | 'manubri' | 'bilanciere' | 'cavi' | 'panca';
  photos: { start: string; end: string }; // nomi file in E:\foto esercizi Andrea
}

// Catalogo completo esercizi disponibili con foto
export const EXERCISE_LIBRARY: Exercise[] = [
  // === PETTO ===
  { id: 'pushup', name: 'Push Up', muscle: 'Petto', equipment: 'corpo libero', photos: { start: 'pushup.jpg', end: 'pushup1.jpg' } },
  { id: 'pushup-diamond', name: 'Push Up Diamond', muscle: 'Petto / Tricipiti', equipment: 'corpo libero', photos: { start: 'pushup diamnond.jpg', end: 'pushup diamond 1.jpg' } },
  { id: 'panca-manubri', name: 'Distensioni Manubri su Panca', muscle: 'Petto', equipment: 'manubri', photos: { start: 'manubri su panca piana.jpg', end: 'manubri su panca unilaterale.jpg' } },
  { id: 'croci-manubri', name: 'Croci con Manubri su Panca', muscle: 'Petto', equipment: 'manubri', photos: { start: 'croci manubri su panca.jpg', end: 'croci man2.jpg' } },
  { id: 'squeeze-press', name: 'Squeeze Press', muscle: 'Petto', equipment: 'manubri', photos: { start: 'squeeze press .jpg', end: 'squeeze press1.jpg' } },

  // === SPALLE ===
  { id: 'press-manubri', name: 'Press Manubri (Spalle)', muscle: 'Spalle', equipment: 'manubri', photos: { start: 'press manubri.jpg', end: 'press manubri1.jpg' } },
  { id: 'alzate-laterali', name: 'Alzate Laterali', muscle: 'Spalle', equipment: 'manubri', photos: { start: 'alzate laterali complete.jpg', end: 'alzate laterali complete 2.jpg' } },
  { id: 'alzate-frontali', name: 'Alzate Frontali', muscle: 'Spalle', equipment: 'manubri', photos: { start: 'alz frontali manubri.jpg', end: 'alzate frontali man1.jpg' } },

  // === SCHIENA ===
  // (no foto schiena senza TRX al momento)

  // === BRACCIA ===
  { id: 'curl-manubri', name: 'Curl con Manubri', muscle: 'Bicipiti', equipment: 'manubri', photos: { start: 'curl manubri.jpg', end: 'curl manubri 2.jpg' } },
  { id: 'curl-hammer', name: 'Curl Hammer', muscle: 'Bicipiti', equipment: 'manubri', photos: { start: 'curl hammer.jpg', end: 'curl hammer 1.jpg' } },
  { id: 'curl-ez', name: 'Curl Bilanciere EZ', muscle: 'Bicipiti', equipment: 'bilanciere', photos: { start: 'curl ez.jpg', end: 'curl ez 1.jpg' } },
  { id: 'french-press', name: 'French Press', muscle: 'Tricipiti', equipment: 'bilanciere', photos: { start: 'french press bil ez.jpg', end: 'french press bil ez1.jpg' } },
  { id: 'dip', name: 'Dip alle Parallele', muscle: 'Tricipiti / Petto', equipment: 'corpo libero', photos: { start: 'dip .jpg', end: 'dip 1.jpg' } },
  { id: 'pushdown-cavi', name: 'Pushdown ai Cavi', muscle: 'Tricipiti', equipment: 'cavi', photos: { start: 'pushdown ai cavi.jpg', end: 'pushdown ai cavi1.jpg' } },

  // === GAMBE ===
  { id: 'squat', name: 'Squat a Corpo Libero', muscle: 'Quadricipiti / Glutei', equipment: 'corpo libero', photos: { start: 'squat air.jpg', end: 'squat air1.jpg' } },
  { id: 'squat-jump', name: 'Squat Jump', muscle: 'Quadricipiti / Esplosivita', equipment: 'corpo libero', photos: { start: 'squat jump.jpg', end: 'squat jump1.jpg' } },
  { id: 'squat-bulgaro', name: 'Squat Bulgaro', muscle: 'Quadricipiti / Glutei', equipment: 'corpo libero', photos: { start: 'squat bulgaro.jpg', end: 'squat bulgaro2.jpg' } },
  { id: 'affondi', name: 'Affondi', muscle: 'Quadricipiti / Glutei', equipment: 'corpo libero', photos: { start: 'affondi overhead .jpg', end: 'affondi overhead1.jpg' } },
  { id: 'leg-extension', name: 'Leg Extension', muscle: 'Quadricipiti', equipment: 'corpo libero', photos: { start: 'leg extension.jpg', end: 'leg extension1.jpg' } },

  // === CORE ===
  { id: 'crunch', name: 'Crunch', muscle: 'Addominali', equipment: 'corpo libero', photos: { start: 'crunch obliqui su hyper.jpg', end: 'crunch obliqui su hyper1.jpg' } },
  { id: 'leg-raise', name: 'Leg Raise alla Sbarra', muscle: 'Addominali', equipment: 'corpo libero', photos: { start: 'leg raise alla sbarra.jpg', end: 'leg raise alla sbarra2.jpg' } },
  { id: 'ab-wheel', name: 'Ab Wheel', muscle: 'Addominali', equipment: 'corpo libero', photos: { start: 'ab wheel.jpg', end: 'ab wheel 1.jpg' } },
  { id: 'plank', name: 'Plank', muscle: 'Core', equipment: 'corpo libero', photos: { start: 'plank trex.jpg', end: 'plank trex 1.jpg' } },
  { id: 'mountain-climber', name: 'Mountain Climber', muscle: 'Core / Cardio', equipment: 'corpo libero', photos: { start: 'mountain climber.jpg', end: 'mountain climber3.jpg' } },

  // === CARDIO / FULL BODY ===
  { id: 'burpees', name: 'Burpees', muscle: 'Full Body', equipment: 'corpo libero', photos: { start: 'burpees.jpg', end: 'burpees1.jpg' } },
];

// Esercizi raggruppati per muscolo
export function getExercisesByMuscle(): Record<string, Exercise[]> {
  const groups: Record<string, Exercise[]> = {};
  for (const ex of EXERCISE_LIBRARY) {
    const muscle = ex.muscle.split('/')[0].trim();
    if (!groups[muscle]) groups[muscle] = [];
    groups[muscle].push(ex);
  }
  return groups;
}

// Interfaccia per un esercizio nella scheda
export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: string; // "12" o "30 sec" o "10-12"
  notes?: string;
}

// Interfaccia per un programma di allenamento
export interface WorkoutProgram {
  name: string; // "Programma A - Upper Body"
  exercises: WorkoutExercise[];
}

// Genera HTML per una card esercizio con 2 foto affiancate
export function exerciseCardHtml(
  exercise: Exercise,
  sets: number,
  reps: string,
  notes: string | undefined,
  imageUrls: { start: string; end: string },
  color: string
): string {
  return `
    <div style="margin:20px 0;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;page-break-inside:avoid;">
      <div style="background:${color}10;padding:10px 16px;border-bottom:1px solid #e2e8f0;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:800;font-size:14px;color:#0f172a;">${exercise.name}</span>
          <span style="background:${color};color:white;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">${sets} x ${reps}</span>
        </div>
        <div style="font-size:10px;color:#64748b;margin-top:2px;">${exercise.muscle} — ${exercise.equipment}</div>
      </div>
      <div style="display:flex;gap:8px;padding:12px 16px;justify-content:center;align-items:center;">
        <div style="flex:1;text-align:center;">
          <img src="${imageUrls.start}" style="width:100%;max-height:200px;object-fit:contain;border-radius:6px;" alt="${exercise.name} - inizio">
          <div style="color:#94a3b8;font-size:8px;margin-top:3px;font-weight:700;text-transform:uppercase;">Inizio</div>
        </div>
        <div style="flex:0 0 20px;text-align:center;color:${color};font-size:18px;font-weight:900;">→</div>
        <div style="flex:1;text-align:center;">
          <img src="${imageUrls.end}" style="width:100%;max-height:200px;object-fit:contain;border-radius:6px;" alt="${exercise.name} - fine">
          <div style="color:#94a3b8;font-size:8px;margin-top:3px;font-weight:700;text-transform:uppercase;">Fine</div>
        </div>
      </div>
      ${notes ? `<div style="padding:8px 16px 12px;font-size:11px;color:#475569;font-style:italic;border-top:1px solid #e2e8f0;">${notes}</div>` : ''}
    </div>`;
}

// Genera HTML per un intero programma di allenamento
export function workoutProgramHtml(
  program: WorkoutProgram,
  imageMap: Record<string, { start: string; end: string }>,
  color: string
): string {
  let html = `<div style="page-break-before:always;"></div>`;
  html += `<div style="margin-bottom:24px;">`;
  html += `<h2 style="color:${color};font-size:22px;font-weight:800;margin:0 0 8px;line-height:1.3;">${program.name}</h2>`;
  html += `<div style="width:50px;height:3px;background:${color};border-radius:2px;"></div>`;
  html += `</div>`;

  for (const we of program.exercises) {
    const exercise = EXERCISE_LIBRARY.find(e => e.id === we.exerciseId);
    if (!exercise) continue;

    const urls = imageMap[exercise.id];
    if (urls) {
      html += exerciseCardHtml(exercise, we.sets, we.reps, we.notes, urls, color);
    } else {
      // Senza immagini, mostra solo testo
      html += `<div style="margin:12px 0;padding:12px 16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
        <div style="font-weight:700;color:#0f172a;">${exercise.name}</div>
        <div style="color:${color};font-weight:600;">${we.sets} x ${we.reps}</div>
        ${we.notes ? `<div style="font-size:11px;color:#64748b;">${we.notes}</div>` : ''}
      </div>`;
    }
  }

  return html;
}
