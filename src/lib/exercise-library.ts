// E:\guide-digitali\src\lib\exercise-library.ts
// Libreria esercizi: tue foto Andrea + 800+ da free-exercise-db (GitHub)

export interface Exercise {
  id: string;
  name: string;
  nameIt?: string; // nome italiano (solo per le tue foto)
  muscle: string;
  equipment: string;
  source: 'andrea' | 'github';
  photos: { start: string; end: string };
}

// === TUE FOTO PERSONALI (priorita) ===
export const ANDREA_EXERCISES: Exercise[] = [
  // PETTO
  { id: 'a-pushup', name: 'Push Up', nameIt: 'Push Up', muscle: 'Petto', equipment: 'Corpo libero', source: 'andrea', photos: { start: 'pushup.jpg', end: 'pushup1.jpg' } },
  { id: 'a-pushup-diamond', name: 'Push Up Diamond', nameIt: 'Push Up Diamond', muscle: 'Petto / Tricipiti', equipment: 'Corpo libero', source: 'andrea', photos: { start: 'pushup diamnond.jpg', end: 'pushup diamond 1.jpg' } },
  { id: 'a-panca-manubri', name: 'Distensioni Manubri Panca', nameIt: 'Distensioni Manubri su Panca', muscle: 'Petto', equipment: 'Manubri + Panca', source: 'andrea', photos: { start: 'manubri su panca piana.jpg', end: 'manubri su panca unilaterale.jpg' } },
  { id: 'a-croci-manubri', name: 'Croci Manubri Panca', nameIt: 'Croci con Manubri su Panca', muscle: 'Petto', equipment: 'Manubri + Panca', source: 'andrea', photos: { start: 'croci manubri su panca.jpg', end: 'croci manubri1.jpg' } },
  { id: 'a-croci-cavi', name: 'Croci ai Cavi', nameIt: 'Croci ai Cavi', muscle: 'Petto', equipment: 'Cavi', source: 'andrea', photos: { start: 'croci ai cavi.jpg', end: 'croci ai cavi (2).jpg' } },
  { id: 'a-croci-cavi-alti', name: 'Croci ai Cavi Alti', nameIt: 'Croci ai Cavi Alti', muscle: 'Petto', equipment: 'Cavi', source: 'andrea', photos: { start: 'croci ai cavi alti.jpg', end: 'croci ai cavi alti 1.jpg' } },
  { id: 'a-squeeze-press', name: 'Squeeze Press', nameIt: 'Squeeze Press', muscle: 'Petto', equipment: 'Manubri', source: 'andrea', photos: { start: 'squeeze press .jpg', end: 'squeeze press1.jpg' } },
  // SPALLE
  { id: 'a-press-manubri', name: 'Press Manubri Spalle', nameIt: 'Press Manubri (Spalle)', muscle: 'Spalle', equipment: 'Manubri', source: 'andrea', photos: { start: 'press manubri.jpg', end: 'press manubri1.jpg' } },
  { id: 'a-alzate-laterali', name: 'Alzate Laterali', nameIt: 'Alzate Laterali Manubri', muscle: 'Spalle', equipment: 'Manubri', source: 'andrea', photos: { start: 'alzate laterali complete.jpg', end: 'alzate laterali complete 2.jpg' } },
  { id: 'a-alzate-frontali-man', name: 'Alzate Frontali Manubri', nameIt: 'Alzate Frontali Manubri', muscle: 'Spalle', equipment: 'Manubri', source: 'andrea', photos: { start: 'alz frontali manubri.jpg', end: 'alzate frontali man1.jpg' } },
  { id: 'a-alzate-frontali-disco', name: 'Alzate Frontali Disco', nameIt: 'Alzate Frontali con Disco', muscle: 'Spalle', equipment: 'Disco', source: 'andrea', photos: { start: 'alzate frontali disco.jpg', end: 'alzate frontali disco1.jpg' } },
  // SCHIENA
  { id: 'a-pullup', name: 'Trazioni Sbarra', nameIt: 'Trazioni alla Sbarra', muscle: 'Schiena', equipment: 'Sbarra', source: 'andrea', photos: { start: 'pullup.jpg', end: 'pullup1.jpg' } },
  { id: 'a-pullup-inv', name: 'Trazioni Presa Inversa', nameIt: 'Trazioni Presa Inversa', muscle: 'Schiena', equipment: 'Sbarra', source: 'andrea', photos: { start: 'pullup presa inv.jpg', end: 'pullup presa inv1.jpg' } },
  { id: 'a-row-trx', name: 'Row TRX', nameIt: 'Row al TRX', muscle: 'Schiena', equipment: 'TRX', source: 'andrea', photos: { start: 'row 1 arm trex.jpg', end: 'row 1 arm trex 1.jpg' } },
  // BICIPITI
  { id: 'a-curl-manubri', name: 'Curl Manubri', nameIt: 'Curl con Manubri', muscle: 'Bicipiti', equipment: 'Manubri', source: 'andrea', photos: { start: 'curl manubri.jpg', end: 'curl manubri 2.jpg' } },
  { id: 'a-curl-hammer', name: 'Curl Hammer', nameIt: 'Curl Hammer', muscle: 'Bicipiti', equipment: 'Manubri', source: 'andrea', photos: { start: 'curl hammer.jpg', end: 'curl hammer 1.jpg' } },
  { id: 'a-curl-ez', name: 'Curl EZ', nameIt: 'Curl Bilanciere EZ', muscle: 'Bicipiti', equipment: 'Bilanciere EZ', source: 'andrea', photos: { start: 'curl ez.jpg', end: 'curl ez 1.jpg' } },
  { id: 'a-curl-cavi', name: 'Curl Cavi Bassi', nameIt: 'Curl ai Cavi Bassi', muscle: 'Bicipiti', equipment: 'Cavi', source: 'andrea', photos: { start: 'curl ai cavi bassi.jpg', end: 'curl cavi bassi 1.jpg' } },
  // TRICIPITI
  { id: 'a-french-press', name: 'French Press EZ', nameIt: 'French Press Bilanciere EZ', muscle: 'Tricipiti', equipment: 'Bilanciere EZ', source: 'andrea', photos: { start: 'french press bil ez.jpg', end: 'french press bil ez1.jpg' } },
  { id: 'a-french-press-man', name: 'French Press Manubrio', nameIt: 'French Press Manubrio', muscle: 'Tricipiti', equipment: 'Manubri', source: 'andrea', photos: { start: 'french press 1 man.jpg', end: 'french press 1 man 1.jpg' } },
  { id: 'a-dip', name: 'Dip', nameIt: 'Dip alle Parallele', muscle: 'Tricipiti / Petto', equipment: 'Parallele', source: 'andrea', photos: { start: 'dip .jpg', end: 'dip 1.jpg' } },
  { id: 'a-pushdown', name: 'Pushdown Cavi', nameIt: 'Pushdown ai Cavi', muscle: 'Tricipiti', equipment: 'Cavi', source: 'andrea', photos: { start: 'pushdown ai cavi.jpg', end: 'pushdown ai cavi1.jpg' } },
  // GAMBE
  { id: 'a-squat', name: 'Squat Corpo Libero', nameIt: 'Squat a Corpo Libero', muscle: 'Quadricipiti', equipment: 'Corpo libero', source: 'andrea', photos: { start: 'squat air.jpg', end: 'squat air1.jpg' } },
  { id: 'a-squat-jump', name: 'Squat Jump', nameIt: 'Squat Jump', muscle: 'Quadricipiti', equipment: 'Corpo libero', source: 'andrea', photos: { start: 'squat jump.jpg', end: 'squat jump1.jpg' } },
  { id: 'a-squat-bulgaro', name: 'Squat Bulgaro', nameIt: 'Squat Bulgaro', muscle: 'Quadricipiti', equipment: 'Corpo libero', source: 'andrea', photos: { start: 'squat bulgaro.jpg', end: 'squat bulgaro2.jpg' } },
  { id: 'a-squat-overhead', name: 'Squat Overhead', nameIt: 'Squat Overhead', muscle: 'Quadricipiti', equipment: 'Disco', source: 'andrea', photos: { start: 'squat overhead.jpg', end: 'squat overhead1.jpg' } },
  { id: 'a-sissy-squat', name: 'Sissy Squat', nameIt: 'Sissy Squat', muscle: 'Quadricipiti', equipment: 'Corpo libero', source: 'andrea', photos: { start: 'sissy squat.jpg', end: 'sissy squat 1.jpg' } },
  { id: 'a-affondi', name: 'Affondi', nameIt: 'Affondi', muscle: 'Quadricipiti', equipment: 'Corpo libero', source: 'andrea', photos: { start: 'affondi overhead .jpg', end: 'affondi overhead1.jpg' } },
  { id: 'a-step-up', name: 'Step Up', nameIt: 'Step Up', muscle: 'Quadricipiti', equipment: 'Box', source: 'andrea', photos: { start: 'stepup.jpg', end: 'stepup1.jpg' } },
  { id: 'a-leg-extension', name: 'Leg Extension', nameIt: 'Leg Extension', muscle: 'Quadricipiti', equipment: 'Macchina', source: 'andrea', photos: { start: 'leg extension.jpg', end: 'leg extension1.jpg' } },
  { id: 'a-hip-thrust', name: 'Hip Thrust', nameIt: 'Hip Thrust', muscle: 'Glutei', equipment: 'Corpo libero', source: 'andrea', photos: { start: 'hip thrust caviglia 1.jpg', end: 'hip thrust caviglia 2.jpg' } },
  // CORE
  { id: 'a-crunch', name: 'Crunch Obliqui', nameIt: 'Crunch Obliqui', muscle: 'Addominali', equipment: 'Corpo libero', source: 'andrea', photos: { start: 'crunch obliqui su hyper.jpg', end: 'crunch obliqui su hyper1.jpg' } },
  { id: 'a-leg-raise', name: 'Leg Raise', nameIt: 'Leg Raise alla Sbarra', muscle: 'Addominali', equipment: 'Sbarra', source: 'andrea', photos: { start: 'leg raise alla sbarra.jpg', end: 'leg raise alla sbarra2.jpg' } },
  { id: 'a-leg-raise-obliqui', name: 'Leg Raise Obliqui', nameIt: 'Leg Raise Obliqui', muscle: 'Addominali', equipment: 'Sbarra', source: 'andrea', photos: { start: 'leg raise obliqui.jpg', end: 'leg raise obliqui2.jpg' } },
  { id: 'a-ab-wheel', name: 'Ab Wheel', nameIt: 'Ab Wheel Rollout', muscle: 'Addominali', equipment: 'Ab Wheel', source: 'andrea', photos: { start: 'ab wheel.jpg', end: 'ab wheel 1.jpg' } },
  { id: 'a-plank', name: 'Plank', nameIt: 'Plank', muscle: 'Core', equipment: 'Corpo libero', source: 'andrea', photos: { start: 'plank trex.jpg', end: 'plank trex 1.jpg' } },
  { id: 'a-tergicristallo', name: 'Tergicristallo', nameIt: 'Tergicristallo', muscle: 'Obliqui', equipment: 'Sbarra', source: 'andrea', photos: { start: 'tergicristallo.jpg', end: 'tergicristallo2.jpg' } },
  { id: 'a-flutter-kick', name: 'Flutter Kick', nameIt: 'Flutter Kick', muscle: 'Addominali', equipment: 'Corpo libero', source: 'andrea', photos: { start: 'flutter kick.jpg', end: 'flutter kick 2.jpg' } },
  { id: 'a-mountain-climber', name: 'Mountain Climber', nameIt: 'Mountain Climber', muscle: 'Core / Cardio', equipment: 'Corpo libero', source: 'andrea', photos: { start: 'mountain climber.jpg', end: 'mountain climber3.jpg' } },
  // FULL BODY
  { id: 'a-burpees', name: 'Burpees', nameIt: 'Burpees', muscle: 'Full Body', equipment: 'Corpo libero', source: 'andrea', photos: { start: 'burpees.jpg', end: 'burpees1.jpg' } },
  { id: 'a-farmer-walk', name: 'Farmer Walk', nameIt: 'Farmer Walk', muscle: 'Full Body', equipment: 'Manubri', source: 'andrea', photos: { start: 'farmer walk.jpg', end: 'farmer walk1.jpg' } },
  { id: 'a-slam-ball', name: 'Slam Ball', nameIt: 'Slam Ball', muscle: 'Full Body', equipment: 'Med Ball', source: 'andrea', photos: { start: 'slam ball.jpg', end: 'slam ball1.jpg' } },
  { id: 'a-snatch-db', name: 'Snatch Manubrio', nameIt: 'Snatch Manubrio', muscle: 'Full Body', equipment: 'Manubri', source: 'andrea', photos: { start: 'snatch dummbell.jpg', end: 'snatch db1.jpg' } },
  { id: 'a-med-ball-clean', name: 'Med Ball Clean', nameIt: 'Med Ball Clean', muscle: 'Full Body', equipment: 'Med Ball', source: 'andrea', photos: { start: 'med ball clean.jpg', end: 'med ball clean 1.jpg' } },
  { id: 'a-pinch', name: 'Pinch Hold', nameIt: 'Pinch Hold', muscle: 'Avambracci', equipment: 'Disco', source: 'andrea', photos: { start: 'pinch.jpg', end: 'pinch 1.jpg' } },
];

// === ESERCIZI DA GITHUB (free-exercise-db) ===
// Selezionati: i piu comuni in palestra che Andrea NON ha come foto
const GITHUB_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

// Helper per creare esercizio GitHub
function gh(id: string, name: string, muscle: string, equipment: string, folder: string): Exercise {
  return { id: `g-${id}`, name, muscle, equipment, source: 'github', photos: { start: `${GITHUB_BASE}/${folder}/0.jpg`, end: `${GITHUB_BASE}/${folder}/1.jpg` } };
}

export const GITHUB_EXERCISES: Exercise[] = [
  // === PETTO ===
  gh('bench-press', 'Barbell Bench Press', 'Petto', 'Bilanciere', 'Barbell_Bench_Press_-_Medium_Grip'),
  gh('incline-bench', 'Incline Barbell Bench Press', 'Petto', 'Bilanciere', 'Barbell_Incline_Bench_Press_-_Medium_Grip'),
  gh('guillotine-press', 'Guillotine Bench Press', 'Petto', 'Bilanciere', 'Barbell_Guillotine_Bench_Press'),
  gh('bench-dips', 'Bench Dips', 'Petto', 'Panca', 'Bench_Dips'),
  gh('db-pullover', 'Dumbbell Pullover', 'Petto', 'Manubri', 'Bent-Arm_Dumbbell_Pullover'),
  gh('bb-pullover', 'Barbell Pullover', 'Petto', 'Bilanciere', 'Bent-Arm_Barbell_Pullover'),
  gh('floor-press-kb', 'Alternating Floor Press', 'Petto', 'Kettlebell', 'Alternating_Floor_Press'),
  gh('around-worlds', 'Around The Worlds', 'Petto', 'Manubri', 'Around_The_Worlds'),

  // === SPALLE ===
  gh('barbell-shoulder-press', 'Barbell Shoulder Press', 'Spalle', 'Bilanciere', 'Barbell_Shoulder_Press'),
  gh('arnold-press', 'Arnold Dumbbell Press', 'Spalle', 'Manubri', 'Arnold_Dumbbell_Press'),
  gh('alt-deltoid-raise', 'Alternating Deltoid Raise', 'Spalle', 'Manubri', 'Alternating_Deltoid_Raise'),
  gh('cable-shoulder-press', 'Cable Shoulder Press', 'Spalle', 'Cavi', 'Alternating_Cable_Shoulder_Press'),
  gh('barbell-incline-raise', 'Barbell Incline Shoulder Raise', 'Spalle', 'Bilanciere', 'Barbell_Incline_Shoulder_Raise'),
  gh('band-pull-apart', 'Band Pull Apart', 'Spalle', 'Elastici', 'Band_Pull_Apart'),
  gh('arm-circles', 'Arm Circles', 'Spalle', 'Corpo libero', 'Arm_Circles'),
  gh('battling-ropes', 'Battling Ropes', 'Spalle', 'Funi', 'Battling_Ropes'),

  // === SCHIENA ===
  gh('barbell-row', 'Bent Over Barbell Row', 'Schiena', 'Bilanciere', 'Bent_Over_Barbell_Row'),
  gh('db-row', 'Bent Over Dumbbell Row', 'Schiena', 'Manubri', 'Bent_Over_Two-Dumbbell_Row'),
  gh('db-row-palms-in', 'Dumbbell Row Palms In', 'Schiena', 'Manubri', 'Bent_Over_Two-Dumbbell_Row_With_Palms_In'),
  gh('one-arm-bb-row', 'One-Arm Barbell Row', 'Schiena', 'Bilanciere', 'Bent_Over_One-Arm_Long_Bar_Row'),
  gh('two-arm-bb-row', 'Two-Arm Barbell Row', 'Schiena', 'Bilanciere', 'Bent_Over_Two-Arm_Long_Bar_Row'),
  gh('barbell-rear-delt', 'Barbell Rear Delt Row', 'Schiena', 'Bilanciere', 'Barbell_Rear_Delt_Row'),
  gh('db-rear-delt', 'DB Rear Delt Raise', 'Schiena', 'Manubri', 'Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench'),
  gh('cable-low-lateral', 'Cable Low-Pulley Side Lateral', 'Schiena', 'Cavi', 'Bent_Over_Low-Pulley_Side_Lateral'),
  gh('deadlift', 'Barbell Deadlift', 'Schiena', 'Bilanciere', 'Barbell_Deadlift'),
  gh('band-pullup', 'Band Assisted Pull-Up', 'Schiena', 'Elastici', 'Band_Assisted_Pull-Up'),
  gh('kb-row', 'Alternating Kettlebell Row', 'Schiena', 'Kettlebell', 'Alternating_Kettlebell_Row'),
  gh('renegade-row', 'Renegade Row', 'Schiena', 'Kettlebell', 'Alternating_Renegade_Row'),

  // === TRAPEZIO ===
  gh('barbell-shrug', 'Barbell Shrug', 'Trapezio', 'Bilanciere', 'Barbell_Shrug'),
  gh('barbell-shrug-back', 'Barbell Shrug Behind Back', 'Trapezio', 'Bilanciere', 'Barbell_Shrug_Behind_The_Back'),

  // === BICIPITI ===
  gh('barbell-curl', 'Barbell Curl', 'Bicipiti', 'Bilanciere', 'Barbell_Curl'),
  gh('incline-db-curl', 'Incline Dumbbell Curl', 'Bicipiti', 'Manubri', 'Alternate_Incline_Dumbbell_Curl'),
  gh('alt-hammer-curl', 'Alternate Hammer Curl', 'Bicipiti', 'Manubri', 'Alternate_Hammer_Curl'),
  gh('bb-curl-incline', 'Barbell Curl Lying Incline', 'Bicipiti', 'Bilanciere', 'Barbell_Curls_Lying_Against_An_Incline'),

  // === TRICIPITI ===
  gh('band-skull-crusher', 'Band Skull Crusher', 'Tricipiti', 'Elastici', 'Band_Skull_Crusher'),
  gh('bench-press-close', 'Close-Grip Bench Press', 'Tricipiti', 'Bilanciere', 'Bench_Press_-_Powerlifting'),

  // === QUADRICIPITI ===
  gh('barbell-squat', 'Barbell Squat', 'Quadricipiti', 'Bilanciere', 'Barbell_Squat'),
  gh('barbell-full-squat', 'Barbell Full Squat', 'Quadricipiti', 'Bilanciere', 'Barbell_Full_Squat'),
  gh('barbell-lunge', 'Barbell Lunge', 'Quadricipiti', 'Bilanciere', 'Barbell_Lunge'),
  gh('barbell-walking-lunge', 'Barbell Walking Lunge', 'Quadricipiti', 'Bilanciere', 'Barbell_Walking_Lunge'),
  gh('hack-squat', 'Barbell Hack Squat', 'Quadricipiti', 'Bilanciere', 'Barbell_Hack_Squat'),
  gh('barbell-step-up', 'Barbell Step Ups', 'Quadricipiti', 'Bilanciere', 'Barbell_Step_Ups'),
  gh('barbell-side-squat', 'Barbell Side Split Squat', 'Quadricipiti', 'Bilanciere', 'Barbell_Side_Split_Squat'),
  gh('squat-to-bench', 'Barbell Squat to Bench', 'Quadricipiti', 'Bilanciere', 'Barbell_Squat_To_A_Bench'),
  gh('bench-jump', 'Bench Jump', 'Quadricipiti', 'Corpo libero', 'Bench_Jump'),

  // === GLUTEI ===
  gh('hip-thrust-bb', 'Barbell Hip Thrust', 'Glutei', 'Bilanciere', 'Barbell_Hip_Thrust'),
  gh('glute-bridge-bb', 'Barbell Glute Bridge', 'Glutei', 'Bilanciere', 'Barbell_Glute_Bridge'),

  // === FEMORALI ===
  gh('ball-leg-curl', 'Ball Leg Curl', 'Femorali', 'Fitball', 'Ball_Leg_Curl'),
  gh('band-good-morning', 'Band Good Morning', 'Femorali', 'Elastici', 'Band_Good_Morning'),
  gh('band-pull-through', 'Band Pull Through', 'Femorali', 'Elastici', 'Band_Good_Morning_Pull_Through'),
  gh('90-90-hamstring', 'Hamstring Stretch 90/90', 'Femorali', 'Corpo libero', '90_90_Hamstring'),

  // === POLPACCI ===
  gh('calf-raise-bb', 'Barbell Seated Calf Raise', 'Polpacci', 'Bilanciere', 'Barbell_Seated_Calf_Raise'),

  // === ADDOMINALI ===
  gh('sit-up', '3/4 Sit-Up', 'Addominali', 'Corpo libero', '3_4_Sit-Up'),
  gh('ab-crunch-machine', 'Ab Crunch Machine', 'Addominali', 'Macchina', 'Ab_Crunch_Machine'),
  gh('ab-roller', 'Ab Roller', 'Addominali', 'Ab Roller', 'Ab_Roller'),
  gh('air-bike', 'Air Bike (Bicycle Crunch)', 'Addominali', 'Corpo libero', 'Air_Bike'),
  gh('heel-touchers', 'Alternate Heel Touchers', 'Addominali', 'Corpo libero', 'Alternate_Heel_Touchers'),
  gh('hip-raise', 'Bent-Knee Hip Raise', 'Addominali', 'Corpo libero', 'Bent-Knee_Hip_Raise'),
  gh('bb-ab-rollout', 'Barbell Ab Rollout', 'Addominali', 'Bilanciere', 'Barbell_Ab_Rollout'),
  gh('bb-ab-rollout-knees', 'Barbell Ab Rollout on Knees', 'Addominali', 'Bilanciere', 'Barbell_Ab_Rollout_-_On_Knees'),
  gh('barbell-side-bend', 'Barbell Side Bend', 'Obliqui', 'Bilanciere', 'Barbell_Side_Bend'),

  // === ADDUTTORI ===
  gh('band-hip-adduction', 'Band Hip Adductions', 'Adduttori', 'Elastici', 'Band_Hip_Adductions'),
];

// Libreria completa: prima le tue, poi GitHub
export const EXERCISE_LIBRARY: Exercise[] = [...ANDREA_EXERCISES, ...GITHUB_EXERCISES];

// Esercizi raggruppati per muscolo, con sezione "Foto Andrea" prima
export function getExercisesByMuscle(): Record<string, Exercise[]> {
  const groups: Record<string, Exercise[]> = {};
  for (const ex of EXERCISE_LIBRARY) {
    const muscle = ex.muscle.split('/')[0].trim();
    if (!groups[muscle]) groups[muscle] = [];
    groups[muscle].push(ex);
  }
  return groups;
}

// Esercizi raggruppati per fonte
export function getExercisesBySource(): { andrea: Exercise[]; github: Exercise[] } {
  return {
    andrea: ANDREA_EXERCISES,
    github: GITHUB_EXERCISES,
  };
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  notes?: string;
}

export interface WorkoutProgram {
  name: string;
  exercises: WorkoutExercise[];
}

export function exerciseCardHtml(
  exercise: Exercise,
  sets: number,
  reps: string,
  notes: string | undefined,
  imageUrls: { start: string; end: string },
  color: string
): string {
  const displayName = exercise.nameIt || exercise.name;
  return `
    <div style="margin:20px 0;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;page-break-inside:avoid;">
      <div style="background:${color}10;padding:10px 16px;border-bottom:1px solid #e2e8f0;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:800;font-size:14px;color:#0f172a;">${displayName}</span>
          <span style="background:${color};color:white;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">${sets} x ${reps}</span>
        </div>
        <div style="font-size:10px;color:#64748b;margin-top:2px;">${exercise.muscle} — ${exercise.equipment}</div>
      </div>
      <div style="display:flex;gap:8px;padding:12px 16px;justify-content:center;align-items:center;">
        <div style="flex:1;text-align:center;">
          <img src="${imageUrls.start}" style="width:100%;max-height:200px;object-fit:contain;border-radius:6px;" alt="${displayName} - inizio">
          <div style="color:#94a3b8;font-size:8px;margin-top:3px;font-weight:700;text-transform:uppercase;">Inizio</div>
        </div>
        <div style="flex:0 0 20px;text-align:center;color:${color};font-size:18px;font-weight:900;">→</div>
        <div style="flex:1;text-align:center;">
          <img src="${imageUrls.end}" style="width:100%;max-height:200px;object-fit:contain;border-radius:6px;" alt="${displayName} - fine">
          <div style="color:#94a3b8;font-size:8px;margin-top:3px;font-weight:700;text-transform:uppercase;">Fine</div>
        </div>
      </div>
      ${notes ? `<div style="padding:8px 16px 12px;font-size:11px;color:#475569;font-style:italic;border-top:1px solid #e2e8f0;">${notes}</div>` : ''}
    </div>`;
}

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
      const displayName = exercise.nameIt || exercise.name;
      html += `<div style="margin:12px 0;padding:12px 16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
        <div style="font-weight:700;color:#0f172a;">${displayName}</div>
        <div style="color:${color};font-weight:600;">${we.sets} x ${we.reps}</div>
      </div>`;
    }
  }
  return html;
}
