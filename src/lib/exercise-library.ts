// E:\guide-digitali\src\lib\exercise-library.ts
// Libreria COMPLETA esercizi con foto di Andrea

export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  photos: { start: string; end: string };
}

export const EXERCISE_LIBRARY: Exercise[] = [
  // === PETTO ===
  { id: 'pushup', name: 'Push Up', muscle: 'Petto', equipment: 'Corpo libero', photos: { start: 'pushup.jpg', end: 'pushup1.jpg' } },
  { id: 'pushup-diamond', name: 'Push Up Diamond', muscle: 'Petto / Tricipiti', equipment: 'Corpo libero', photos: { start: 'pushup diamnond.jpg', end: 'pushup diamond 1.jpg' } },
  { id: 'panca-manubri', name: 'Distensioni Manubri su Panca', muscle: 'Petto', equipment: 'Manubri + Panca', photos: { start: 'manubri su panca piana.jpg', end: 'manubri su panca unilaterale.jpg' } },
  { id: 'panca-manubri-unilat', name: 'Distensioni Manubri Unilaterali', muscle: 'Petto', equipment: 'Manubri + Panca', photos: { start: 'manubri panca unilat1.jpg', end: 'manubri su panca unilat2.jpg' } },
  { id: 'croci-manubri', name: 'Croci con Manubri su Panca', muscle: 'Petto', equipment: 'Manubri + Panca', photos: { start: 'croci manubri su panca.jpg', end: 'croci manubri1.jpg' } },
  { id: 'croci-cavi', name: 'Croci ai Cavi', muscle: 'Petto', equipment: 'Cavi', photos: { start: 'croci ai cavi.jpg', end: 'croci ai cavi (2).jpg' } },
  { id: 'croci-cavi-alti', name: 'Croci ai Cavi Alti', muscle: 'Petto', equipment: 'Cavi', photos: { start: 'croci ai cavi alti.jpg', end: 'croci ai cavi alti 1.jpg' } },
  { id: 'squeeze-press', name: 'Squeeze Press', muscle: 'Petto', equipment: 'Manubri', photos: { start: 'squeeze press .jpg', end: 'squeeze press1.jpg' } },

  // === SPALLE ===
  { id: 'press-manubri', name: 'Press Manubri (Spalle)', muscle: 'Spalle', equipment: 'Manubri', photos: { start: 'press manubri.jpg', end: 'press manubri1.jpg' } },
  { id: 'alzate-laterali', name: 'Alzate Laterali Manubri', muscle: 'Spalle', equipment: 'Manubri', photos: { start: 'alzate laterali complete.jpg', end: 'alzate laterali complete 2.jpg' } },
  { id: 'alzate-frontali-man', name: 'Alzate Frontali Manubri', muscle: 'Spalle', equipment: 'Manubri', photos: { start: 'alz frontali manubri.jpg', end: 'alzate frontali man1.jpg' } },
  { id: 'alzate-frontali-disco', name: 'Alzate Frontali con Disco', muscle: 'Spalle', equipment: 'Disco', photos: { start: 'alzate frontali disco.jpg', end: 'alzate frontali disco1.jpg' } },

  // === SCHIENA ===
  { id: 'pullup', name: 'Trazioni alla Sbarra', muscle: 'Schiena / Bicipiti', equipment: 'Sbarra', photos: { start: 'pullup.jpg', end: 'pullup1.jpg' } },
  { id: 'pullup-presa-inv', name: 'Trazioni Presa Inversa', muscle: 'Schiena / Bicipiti', equipment: 'Sbarra', photos: { start: 'pullup presa inv.jpg', end: 'pullup presa inv1.jpg' } },
  { id: 'row-trx', name: 'Row al TRX', muscle: 'Schiena', equipment: 'TRX', photos: { start: 'row 1 arm trex.jpg', end: 'row 1 arm trex 1.jpg' } },
  { id: 'trazioni-trx', name: 'Trazioni al TRX', muscle: 'Schiena', equipment: 'TRX', photos: { start: 'trazioni trex.jpg', end: 'trazioni trex1.jpg' } },

  // === BICIPITI ===
  { id: 'curl-manubri', name: 'Curl con Manubri', muscle: 'Bicipiti', equipment: 'Manubri', photos: { start: 'curl manubri.jpg', end: 'curl manubri 2.jpg' } },
  { id: 'curl-hammer', name: 'Curl Hammer', muscle: 'Bicipiti', equipment: 'Manubri', photos: { start: 'curl hammer.jpg', end: 'curl hammer 1.jpg' } },
  { id: 'curl-ez', name: 'Curl Bilanciere EZ', muscle: 'Bicipiti', equipment: 'Bilanciere EZ', photos: { start: 'curl ez.jpg', end: 'curl ez 1.jpg' } },
  { id: 'curl-cavi', name: 'Curl ai Cavi Bassi', muscle: 'Bicipiti', equipment: 'Cavi', photos: { start: 'curl ai cavi bassi.jpg', end: 'curl cavi bassi 1.jpg' } },

  // === TRICIPITI ===
  { id: 'french-press', name: 'French Press Bilanciere EZ', muscle: 'Tricipiti', equipment: 'Bilanciere EZ', photos: { start: 'french press bil ez.jpg', end: 'french press bil ez1.jpg' } },
  { id: 'french-press-man', name: 'French Press Manubrio', muscle: 'Tricipiti', equipment: 'Manubri', photos: { start: 'french press 1 man.jpg', end: 'french press 1 man 1.jpg' } },
  { id: 'dip', name: 'Dip alle Parallele', muscle: 'Tricipiti / Petto', equipment: 'Parallele', photos: { start: 'dip .jpg', end: 'dip 1.jpg' } },
  { id: 'pushdown-cavi', name: 'Pushdown ai Cavi', muscle: 'Tricipiti', equipment: 'Cavi', photos: { start: 'pushdown ai cavi.jpg', end: 'pushdown ai cavi1.jpg' } },

  // === GAMBE ===
  { id: 'squat', name: 'Squat a Corpo Libero', muscle: 'Quadricipiti / Glutei', equipment: 'Corpo libero', photos: { start: 'squat air.jpg', end: 'squat air1.jpg' } },
  { id: 'squat-jump', name: 'Squat Jump', muscle: 'Quadricipiti / Esplosivita', equipment: 'Corpo libero', photos: { start: 'squat jump.jpg', end: 'squat jump1.jpg' } },
  { id: 'squat-bulgaro', name: 'Squat Bulgaro', muscle: 'Quadricipiti / Glutei', equipment: 'Corpo libero', photos: { start: 'squat bulgaro.jpg', end: 'squat bulgaro2.jpg' } },
  { id: 'squat-overhead', name: 'Squat Overhead', muscle: 'Quadricipiti / Spalle', equipment: 'Disco / Manubri', photos: { start: 'squat overhead.jpg', end: 'squat overhead1.jpg' } },
  { id: 'sissy-squat', name: 'Sissy Squat', muscle: 'Quadricipiti', equipment: 'Corpo libero', photos: { start: 'sissy squat.jpg', end: 'sissy squat 1.jpg' } },
  { id: 'affondi', name: 'Affondi', muscle: 'Quadricipiti / Glutei', equipment: 'Corpo libero', photos: { start: 'affondi overhead .jpg', end: 'affondi overhead1.jpg' } },
  { id: 'step-up', name: 'Step Up', muscle: 'Quadricipiti / Glutei', equipment: 'Box / Panca', photos: { start: 'stepup.jpg', end: 'stepup1.jpg' } },
  { id: 'leg-extension', name: 'Leg Extension', muscle: 'Quadricipiti', equipment: 'Macchina', photos: { start: 'leg extension.jpg', end: 'leg extension1.jpg' } },
  { id: 'hip-thrust', name: 'Hip Thrust', muscle: 'Glutei', equipment: 'Corpo libero', photos: { start: 'hip thrust caviglia 1.jpg', end: 'hip thrust caviglia 2.jpg' } },

  // === CORE / ADDOMINALI ===
  { id: 'crunch', name: 'Crunch Obliqui', muscle: 'Addominali', equipment: 'Corpo libero', photos: { start: 'crunch obliqui su hyper.jpg', end: 'crunch obliqui su hyper1.jpg' } },
  { id: 'leg-raise', name: 'Leg Raise alla Sbarra', muscle: 'Addominali', equipment: 'Sbarra', photos: { start: 'leg raise alla sbarra.jpg', end: 'leg raise alla sbarra2.jpg' } },
  { id: 'leg-raise-obliqui', name: 'Leg Raise Obliqui', muscle: 'Addominali / Obliqui', equipment: 'Sbarra', photos: { start: 'leg raise obliqui.jpg', end: 'leg raise obliqui2.jpg' } },
  { id: 'ab-wheel', name: 'Ab Wheel Rollout', muscle: 'Addominali', equipment: 'Ab Wheel', photos: { start: 'ab wheel.jpg', end: 'ab wheel 1.jpg' } },
  { id: 'plank', name: 'Plank', muscle: 'Core', equipment: 'Corpo libero', photos: { start: 'plank trex.jpg', end: 'plank trex 1.jpg' } },
  { id: 'tergicristallo', name: 'Tergicristallo (Windshield Wiper)', muscle: 'Obliqui', equipment: 'Sbarra', photos: { start: 'tergicristallo.jpg', end: 'tergicristallo2.jpg' } },
  { id: 'flutter-kick', name: 'Flutter Kick', muscle: 'Addominali', equipment: 'Corpo libero', photos: { start: 'flutter kick.jpg', end: 'flutter kick 2.jpg' } },
  { id: 'mountain-climber', name: 'Mountain Climber', muscle: 'Core / Cardio', equipment: 'Corpo libero', photos: { start: 'mountain climber.jpg', end: 'mountain climber3.jpg' } },

  // === CARDIO / FULL BODY ===
  { id: 'burpees', name: 'Burpees', muscle: 'Full Body', equipment: 'Corpo libero', photos: { start: 'burpees.jpg', end: 'burpees1.jpg' } },
  { id: 'farmer-walk', name: 'Farmer Walk', muscle: 'Full Body / Grip', equipment: 'Manubri / Kettlebell', photos: { start: 'farmer walk.jpg', end: 'farmer walk1.jpg' } },
  { id: 'slam-ball', name: 'Slam Ball', muscle: 'Full Body', equipment: 'Med Ball', photos: { start: 'slam ball.jpg', end: 'slam ball1.jpg' } },
  { id: 'snatch-db', name: 'Snatch Manubrio', muscle: 'Full Body', equipment: 'Manubri', photos: { start: 'snatch dummbell.jpg', end: 'snatch db1.jpg' } },
  { id: 'med-ball-clean', name: 'Med Ball Clean', muscle: 'Full Body', equipment: 'Med Ball', photos: { start: 'med ball clean.jpg', end: 'med ball clean 1.jpg' } },
  { id: 'slanci-med-ball-front', name: 'Slanci Med Ball Frontali', muscle: 'Spalle / Core', equipment: 'Med Ball', photos: { start: 'slanci med ball front.jpg', end: 'slanci med ball front1.jpg' } },
  { id: 'slanci-med-ball-lat', name: 'Slanci Med Ball Laterali', muscle: 'Spalle / Core', equipment: 'Med Ball', photos: { start: 'slanci med ball laterali.jpg', end: 'slanci med ball laterali 1.jpg' } },
  { id: 'tyre-roll', name: 'Tyre Roll', muscle: 'Full Body', equipment: 'Pneumatico', photos: { start: 'tyre roll.jpg', end: 'tyre roll1.jpg' } },
  { id: 'tyre-sledge', name: 'Tyre Sledgehammer', muscle: 'Full Body', equipment: 'Pneumatico + Mazza', photos: { start: 'tyre sledge hammer.jpg', end: 'tyre sledge hammer1.jpg' } },
  { id: 'pinch', name: 'Pinch Hold', muscle: 'Avambracci / Grip', equipment: 'Disco', photos: { start: 'pinch.jpg', end: 'pinch 1.jpg' } },
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
  reps: string;
  notes?: string;
}

// Interfaccia per un programma di allenamento
export interface WorkoutProgram {
  name: string;
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
      html += `<div style="margin:12px 0;padding:12px 16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
        <div style="font-weight:700;color:#0f172a;">${exercise.name}</div>
        <div style="color:${color};font-weight:600;">${we.sets} x ${we.reps}</div>
      </div>`;
    }
  }
  return html;
}
