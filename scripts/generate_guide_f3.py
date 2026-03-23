# E:\guide-digitali\scripts\generate_guide_f3.py
# Genera la guida PDF "Home Workout Completo: Corpo Libero per 30 Giorni"
# Con immagini esercizi da ExerciseDB API
#
# Eseguire: python scripts/generate_guide_f3.py

import os
import sys
import json
import requests
from io import BytesIO
from pathlib import Path

# --- CONFIG ---
RAPIDAPI_KEY = "309b989982msh873428813d782bbp130a6ejsn52f3fd1486e9"
EXERCISEDB_HOST = "exercisedb.p.rapidapi.com"
OUTPUT_DIR = Path(__file__).parent.parent / "output"
IMAGES_DIR = OUTPUT_DIR / "exercise_images"
OUTPUT_PDF = OUTPUT_DIR / "home-workout-corpo-libero-30-giorni.pdf"

# Colori tema
CYAN = (6, 182, 212)
DARK_BG = (10, 10, 26)
WHITE = (255, 255, 255)
GRAY = (156, 163, 175)
DARK_CARD = (17, 24, 39)

# --- ESERCIZI PER LA GUIDA (corpo libero) ---
EXERCISES_TO_FETCH = [
    "push up", "squat", "plank", "burpee", "mountain climber",
    "lunge", "jumping jacks", "crunch", "leg raise", "glute bridge",
    "tricep dip", "superman", "high knees", "bicycle crunch", "wall sit exercise",
    "pike push up", "side plank", "jump squat", "flutter kick", "bear crawl",
    "inchworm", "bodyweight reverse lunge", "calf raise", "dead bug", "alternate bird dog"
]

# Traduzione nomi esercizi e istruzioni in italiano
EXERCISE_IT = {
    "push up": {
        "name": "Piegamenti sulle Braccia",
        "target": "Pettorali",
        "bodyPart": "Parte superiore",
        "secondaryMuscles": ["tricipiti", "deltoidi anteriori", "core"],
        "instructions": [
            "Posizionati a terra con le mani alla larghezza delle spalle.",
            "Mantieni il corpo in linea retta dalla testa ai piedi.",
            "Piega le braccia abbassando il petto verso il pavimento, poi spingi per tornare su."
        ]
    },
    "squat": {
        "name": "Squat a Corpo Libero",
        "target": "Quadricipiti",
        "bodyPart": "Gambe",
        "secondaryMuscles": ["glutei", "femorali", "core"],
        "instructions": [
            "In piedi con i piedi alla larghezza delle spalle.",
            "Piega le ginocchia e abbassa i fianchi come per sederti.",
            "Scendi finche le cosce sono parallele al pavimento, poi risali spingendo sui talloni."
        ]
    },
    "plank": {
        "name": "Plank",
        "target": "Core",
        "bodyPart": "Addominali",
        "secondaryMuscles": ["spalle", "glutei", "lombari"],
        "instructions": [
            "Appoggiati sugli avambracci e sulle punte dei piedi.",
            "Mantieni il corpo perfettamente in linea retta.",
            "Contrai gli addominali e mantieni la posizione per il tempo indicato."
        ]
    },
    "burpee": {
        "name": "Burpee",
        "target": "Tutto il corpo",
        "bodyPart": "Full body",
        "secondaryMuscles": ["pettorali", "quadricipiti", "core"],
        "instructions": [
            "Dalla posizione eretta, scendi in squat e appoggia le mani a terra.",
            "Lancia i piedi indietro in posizione di plank.",
            "Fai un piegamento, riporta i piedi avanti e salta verso l'alto con le braccia sopra la testa."
        ]
    },
    "mountain climber": {
        "name": "Mountain Climber",
        "target": "Core",
        "bodyPart": "Addominali / Cardio",
        "secondaryMuscles": ["quadricipiti", "spalle", "flessori dell'anca"],
        "instructions": [
            "Parti in posizione di plank alto con le braccia tese.",
            "Porta un ginocchio verso il petto in modo alternato.",
            "Mantieni il ritmo veloce come se stessi correndo in orizzontale."
        ]
    },
    "lunge": {
        "name": "Affondo in Avanti",
        "target": "Quadricipiti",
        "bodyPart": "Gambe",
        "secondaryMuscles": ["glutei", "femorali", "core"],
        "instructions": [
            "In piedi, fai un passo avanti lungo.",
            "Piega entrambe le ginocchia a 90 gradi.",
            "Spingi con il piede avanti per tornare alla posizione iniziale. Alterna le gambe."
        ]
    },
    "jumping jacks": {
        "name": "Jumping Jacks",
        "target": "Tutto il corpo",
        "bodyPart": "Cardio",
        "secondaryMuscles": ["deltoidi", "polpacci", "adduttori"],
        "instructions": [
            "In piedi con piedi uniti e braccia lungo i fianchi.",
            "Salta divaricando le gambe e portando le braccia sopra la testa.",
            "Torna alla posizione iniziale con un altro salto. Ripeti a ritmo costante."
        ]
    },
    "crunch": {
        "name": "Crunch Addominale",
        "target": "Retto addominale",
        "bodyPart": "Addominali",
        "secondaryMuscles": ["obliqui"],
        "instructions": [
            "Sdraiati a terra con le ginocchia piegate e i piedi appoggiati.",
            "Mani dietro la testa, solleva le spalle da terra contraendo gli addominali.",
            "Torna giu lentamente senza rilassare completamente. Non tirare il collo."
        ]
    },
    "leg raise": {
        "name": "Sollevamento Gambe",
        "target": "Addominali bassi",
        "bodyPart": "Addominali",
        "secondaryMuscles": ["flessori dell'anca", "core"],
        "instructions": [
            "Sdraiati a terra con le gambe distese e le mani sotto i glutei.",
            "Solleva le gambe tese fino a 90 gradi mantenendo la schiena a terra.",
            "Abbassa lentamente senza toccare il pavimento. Ripeti."
        ]
    },
    "glute bridge": {
        "name": "Ponte Glutei",
        "target": "Glutei",
        "bodyPart": "Gambe / Glutei",
        "secondaryMuscles": ["femorali", "core", "lombari"],
        "instructions": [
            "Sdraiati a terra con le ginocchia piegate e i piedi appoggiati.",
            "Spingi sui talloni e solleva i fianchi verso il soffitto.",
            "Contrai i glutei in alto, poi scendi lentamente. Non inarcare la schiena."
        ]
    },
    "tricep dip": {
        "name": "Dip su Sedia",
        "target": "Tricipiti",
        "bodyPart": "Braccia",
        "secondaryMuscles": ["deltoidi anteriori", "pettorali"],
        "instructions": [
            "Siediti sul bordo di una sedia stabile, mani afferrate al bordo.",
            "Scorri avanti con i glutei fuori dalla sedia.",
            "Piega le braccia abbassandoti, poi spingi per tornare su."
        ]
    },
    "superman": {
        "name": "Superman",
        "target": "Lombari",
        "bodyPart": "Schiena",
        "secondaryMuscles": ["glutei", "spalle", "core"],
        "instructions": [
            "Sdraiati a pancia in giu con braccia e gambe distese.",
            "Solleva contemporaneamente braccia, petto e gambe da terra.",
            "Mantieni 2-3 secondi in alto, poi torna giu lentamente."
        ]
    },
    "high knees": {
        "name": "Corsa sul Posto (Ginocchia Alte)",
        "target": "Cardio",
        "bodyPart": "Cardio / Gambe",
        "secondaryMuscles": ["quadricipiti", "flessori dell'anca", "core"],
        "instructions": [
            "In piedi, corri sul posto portando le ginocchia il piu in alto possibile.",
            "Alterna velocemente le gambe mantenendo il busto eretto.",
            "Usa le braccia per accompagnare il movimento. Mantieni il ritmo alto."
        ]
    },
    "bicycle crunch": {
        "name": "Crunch Bicicletta",
        "target": "Obliqui",
        "bodyPart": "Addominali",
        "secondaryMuscles": ["retto addominale", "flessori dell'anca"],
        "instructions": [
            "Sdraiati con le mani dietro la testa e le gambe sollevate.",
            "Porta il gomito destro verso il ginocchio sinistro ruotando il busto.",
            "Alterna i lati in modo fluido, come se pedalassi."
        ]
    },
    "wall sit exercise": {
        "name": "Wall Sit (Sedia a Muro)",
        "target": "Quadricipiti",
        "bodyPart": "Gambe",
        "secondaryMuscles": ["glutei", "polpacci"],
        "instructions": [
            "Appoggia la schiena al muro e scendi fino a cosce parallele al pavimento.",
            "Ginocchia a 90 gradi, schiena dritta contro il muro.",
            "Mantieni la posizione per il tempo indicato. Non appoggiare le mani sulle gambe."
        ]
    },
    "pike push up": {
        "name": "Pike Push Up",
        "target": "Deltoidi",
        "bodyPart": "Spalle",
        "secondaryMuscles": ["tricipiti", "trapezio"],
        "instructions": [
            "Posizionati in plank alto, poi alza i fianchi formando una V rovesciata.",
            "Piega le braccia portando la testa verso il pavimento.",
            "Spingi per tornare su. Ottimo per costruire forza nelle spalle."
        ]
    },
    "side plank": {
        "name": "Plank Laterale",
        "target": "Obliqui",
        "bodyPart": "Core",
        "secondaryMuscles": ["gluteo medio", "spalle"],
        "instructions": [
            "Sdraiati su un fianco appoggiandoti sull'avambraccio.",
            "Solleva i fianchi creando una linea retta dalla testa ai piedi.",
            "Mantieni la posizione. Cambia lato."
        ]
    },
    "jump squat": {
        "name": "Squat con Salto",
        "target": "Quadricipiti",
        "bodyPart": "Gambe / Esplosivita",
        "secondaryMuscles": ["glutei", "polpacci", "core"],
        "instructions": [
            "Esegui uno squat normale.",
            "Dalla posizione bassa, esplodi verso l'alto con un salto.",
            "Atterra morbido sulle punte e torna subito in squat. Ripeti."
        ]
    },
    "flutter kick": {
        "name": "Flutter Kicks",
        "target": "Addominali bassi",
        "bodyPart": "Addominali",
        "secondaryMuscles": ["flessori dell'anca"],
        "instructions": [
            "Sdraiati a terra con le gambe distese e le mani sotto i glutei.",
            "Solleva leggermente le gambe da terra.",
            "Alterna piccoli movimenti su e giu rapidi senza toccare il pavimento."
        ]
    },
    "bear crawl": {
        "name": "Bear Crawl (Camminata dell'Orso)",
        "target": "Tutto il corpo",
        "bodyPart": "Full body",
        "secondaryMuscles": ["spalle", "core", "quadricipiti"],
        "instructions": [
            "A quattro zampe, solleva le ginocchia da terra di pochi centimetri.",
            "Avanza muovendo mano e piede opposti contemporaneamente.",
            "Mantieni la schiena piatta e il core contratto. Vai avanti e indietro."
        ]
    },
    "inchworm": {
        "name": "Inchworm (Verme)",
        "target": "Core / Mobilita",
        "bodyPart": "Full body",
        "secondaryMuscles": ["femorali", "spalle", "pettorali"],
        "instructions": [
            "In piedi, piegati in avanti e appoggia le mani a terra.",
            "Cammina con le mani avanti fino alla posizione di plank.",
            "Cammina con i piedi verso le mani e torna in piedi. Ripeti."
        ]
    },
    "bodyweight reverse lunge": {
        "name": "Affondo Indietro",
        "target": "Quadricipiti",
        "bodyPart": "Gambe",
        "secondaryMuscles": ["glutei", "femorali", "core"],
        "instructions": [
            "In piedi, fai un passo indietro lungo.",
            "Piega entrambe le ginocchia a 90 gradi.",
            "Spingi con il piede avanti per tornare alla posizione iniziale. Alterna."
        ]
    },
    "calf raise": {
        "name": "Sollevamento Polpacci",
        "target": "Polpacci",
        "bodyPart": "Gambe",
        "secondaryMuscles": ["tibiale"],
        "instructions": [
            "In piedi con i piedi alla larghezza delle spalle.",
            "Sollevati sulle punte dei piedi contraendo i polpacci.",
            "Scendi lentamente. Puoi farlo su un gradino per maggiore escursione."
        ]
    },
    "dead bug": {
        "name": "Dead Bug",
        "target": "Core profondo",
        "bodyPart": "Addominali",
        "secondaryMuscles": ["flessori dell'anca", "lombari"],
        "instructions": [
            "Sdraiati a terra con braccia tese verso il soffitto e ginocchia a 90 gradi.",
            "Estendi braccio destro e gamba sinistra contemporaneamente.",
            "Torna al centro e alterna. Mantieni la schiena sempre a contatto col pavimento."
        ]
    },
    "alternate bird dog": {
        "name": "Bird Dog",
        "target": "Core / Stabilita",
        "bodyPart": "Core / Schiena",
        "secondaryMuscles": ["glutei", "lombari", "spalle"],
        "instructions": [
            "A quattro zampe, ginocchia sotto i fianchi e mani sotto le spalle.",
            "Estendi braccio destro e gamba sinistra contemporaneamente.",
            "Mantieni 2 secondi, torna al centro e alterna. Schiena piatta."
        ]
    },
}

# Programma 30 giorni — 4 settimane progressive
PROGRAM = {
    "Settimana 1 — Base": {
        "focus": "Costruire le fondamenta. Impara la forma corretta.",
        "days": [
            {"day": 1, "name": "Full Body Intro", "exercises": ["push up", "squat", "plank", "jumping jacks", "glute bridge"], "sets": "3x8", "rest": "60s"},
            {"day": 2, "name": "Riposo attivo", "exercises": [], "note": "Camminata 30 min + stretching"},
            {"day": 3, "name": "Upper Body", "exercises": ["push up", "tricep dip", "pike push up", "superman", "plank"], "sets": "3x8", "rest": "60s"},
            {"day": 4, "name": "Lower Body", "exercises": ["squat", "lunge", "glute bridge", "calf raise", "wall sit exercise"], "sets": "3x10", "rest": "60s"},
            {"day": 5, "name": "Core Focus", "exercises": ["crunch", "leg raise", "bicycle crunch", "dead bug", "alternate bird dog"], "sets": "3x12", "rest": "45s"},
            {"day": 6, "name": "Cardio Light", "exercises": ["jumping jacks", "high knees", "mountain climber", "burpee"], "sets": "3x30s", "rest": "30s"},
            {"day": 7, "name": "Riposo completo", "exercises": [], "note": "Recupero totale. Idratazione e sonno."},
        ]
    },
    "Settimana 2 — Progressione": {
        "focus": "Aumenta ripetizioni e riduci i tempi di recupero.",
        "days": [
            {"day": 8, "name": "Full Body Power", "exercises": ["push up", "squat", "mountain climber", "glute bridge", "plank"], "sets": "3x12", "rest": "45s"},
            {"day": 9, "name": "Riposo attivo", "exercises": [], "note": "Yoga 20 min o camminata veloce"},
            {"day": 10, "name": "Push & Core", "exercises": ["push up", "pike push up", "tricep dip", "crunch", "flutter kick"], "sets": "4x10", "rest": "45s"},
            {"day": 11, "name": "Legs & Glutes", "exercises": ["squat", "bodyweight reverse lunge", "jump squat", "glute bridge", "calf raise"], "sets": "4x10", "rest": "45s"},
            {"day": 12, "name": "Core Avanzato", "exercises": ["bicycle crunch", "leg raise", "dead bug", "side plank", "superman"], "sets": "3x15", "rest": "40s"},
            {"day": 13, "name": "HIIT Base", "exercises": ["burpee", "high knees", "mountain climber", "jump squat", "jumping jacks"], "sets": "4x30s", "rest": "20s"},
            {"day": 14, "name": "Riposo completo", "exercises": [], "note": "Stretching profondo 20 min."},
        ]
    },
    "Settimana 3 — Intensita": {
        "focus": "Circuiti piu lunghi. Meno riposo tra le serie.",
        "days": [
            {"day": 15, "name": "Full Body Circuit", "exercises": ["push up", "squat", "burpee", "plank", "lunge", "mountain climber"], "sets": "4x12", "rest": "30s"},
            {"day": 16, "name": "Upper Strength", "exercises": ["push up", "pike push up", "tricep dip", "superman", "inchworm"], "sets": "4x12", "rest": "40s"},
            {"day": 17, "name": "Riposo attivo", "exercises": [], "note": "Nuoto, bici o camminata 40 min"},
            {"day": 18, "name": "Lower Power", "exercises": ["jump squat", "bodyweight reverse lunge", "glute bridge", "calf raise", "wall sit exercise"], "sets": "4x12", "rest": "35s"},
            {"day": 19, "name": "Core & Cardio", "exercises": ["bicycle crunch", "flutter kick", "high knees", "mountain climber", "bear crawl"], "sets": "4x15", "rest": "30s"},
            {"day": 20, "name": "HIIT Intermedio", "exercises": ["burpee", "jump squat", "push up", "high knees", "mountain climber"], "sets": "5x30s", "rest": "15s"},
            {"day": 21, "name": "Riposo completo", "exercises": [], "note": "Recupero. Prepara la settimana finale."},
        ]
    },
    "Settimana 4 — Trasformazione": {
        "focus": "Massima intensita. Dimostra a te stesso cosa sai fare.",
        "days": [
            {"day": 22, "name": "Full Body Max", "exercises": ["push up", "squat", "burpee", "plank", "lunge", "jump squat", "mountain climber"], "sets": "4x15", "rest": "30s"},
            {"day": 23, "name": "Push Finale", "exercises": ["push up", "pike push up", "tricep dip", "superman", "inchworm", "plank"], "sets": "4x15", "rest": "30s"},
            {"day": 24, "name": "Riposo attivo", "exercises": [], "note": "Mobilita e foam rolling 30 min"},
            {"day": 25, "name": "Legs Finale", "exercises": ["jump squat", "lunge", "bodyweight reverse lunge", "glute bridge", "calf raise", "wall sit exercise"], "sets": "4x15", "rest": "30s"},
            {"day": 26, "name": "Core Finale", "exercises": ["bicycle crunch", "leg raise", "flutter kick", "dead bug", "side plank", "alternate bird dog"], "sets": "4x20", "rest": "25s"},
            {"day": 27, "name": "HIIT Finale", "exercises": ["burpee", "jump squat", "push up", "high knees", "mountain climber", "bear crawl"], "sets": "5x40s", "rest": "15s"},
            {"day": 28, "name": "Test Finale", "exercises": ["push up", "squat", "burpee", "plank"], "sets": "MAX", "rest": "Fai il massimo di ripetizioni per ogni esercizio e segna i risultati"},
            {"day": 29, "name": "Riposo attivo", "exercises": [], "note": "Stretching e riflessione sui risultati"},
            {"day": 30, "name": "Celebra", "exercises": [], "note": "Confronta i tuoi numeri del Giorno 1 con quelli del Giorno 28. Sei una persona diversa."},
        ]
    },
}


def fetch_exercises():
    """Scarica immagini esercizi da fonti multiple: ExerciseDB ID -> CDN, fallback wger"""
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    import time

    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": EXERCISEDB_HOST
    }

    # ExerciseDB IDs noti per esercizi a corpo libero
    # Formato: nome_locale -> (exercisedb_id, search_name_fallback)
    EXERCISE_IDS = {
        "push up": ("0662", "push-up"),
        "squat": ("0043", "bodyweight squat"),
        "plank": ("0308", "front plank"),
        "burpee": ("1160", "burpee"),
        "mountain climber": ("0658", "mountain climber"),
        "lunge": ("0291", "forward lunge"),
        "jumping jacks": ("0514", "jumping jack"),
        "crunch": ("0274", "crunch"),
        "leg raise": ("0584", "lying leg raise"),
        "glute bridge": ("3297", "glute bridge"),
        "tricep dip": ("0716", "triceps dip"),
        "superman": ("0709", "superman"),
        "high knees": ("1472", "high knee against wall"),
        "bicycle crunch": ("0009", "bicycle crunch"),
        "wall sit exercise": ("1427", "wall sit"),
        "pike push up": ("3064", "pike push-up"),
        "side plank": ("0689", "side plank"),
        "jump squat": ("0514", "jump squat"),
        "flutter kick": ("1476", "flutter kicks"),
        "bear crawl": ("3021", "bear crawl"),
        "inchworm": ("3012", "inchworm"),
        "bodyweight reverse lunge": ("0630", "reverse lunge"),
        "calf raise": ("1373", "calf raises"),
        "dead bug": ("3459", "dead bug"),
        "alternate bird dog": ("3460", "bird dog"),
    }

    exercises_data = {}

    for name in EXERCISES_TO_FETCH:
        safe_name = name.replace(" ", "_")
        png_path = IMAGES_DIR / f"{safe_name}.png"

        # Usa cache
        if png_path.exists() and png_path.stat().st_size > 5000:
            print(f"  [cache] {name}")
            exercises_data[name] = EXERCISE_IT.get(name, {"name": name})
            continue

        # Cancella vecchi
        for old in IMAGES_DIR.glob(f"{safe_name}.*"):
            old.unlink()

        ex_id, search_name = EXERCISE_IDS.get(name, ("", name))
        print(f"  [fetch] {name} (id={ex_id})...")

        img_saved = False

        # Metodo 1: Prova ExerciseDB API per ottenere gifUrl
        if not img_saved:
            try:
                url = f"https://{EXERCISEDB_HOST}/exercises/exercise/{ex_id}"
                res = requests.get(url, headers=headers, timeout=15)
                if res.status_code == 200:
                    data = res.json()
                    # Prova tutti i possibili campi immagine
                    gif_url = ""
                    for field in ['gifUrl', 'gif_url', 'gifurl', 'image', 'imageUrl', 'media']:
                        if data.get(field):
                            gif_url = data[field]
                            break

                    if gif_url:
                        img_res = requests.get(gif_url, timeout=30)
                        if img_res.status_code == 200 and len(img_res.content) > 5000:
                            gif_path = IMAGES_DIR / f"{safe_name}.gif"
                            with open(gif_path, 'wb') as f:
                                f.write(img_res.content)
                            # Converti in PNG
                            try:
                                from PIL import Image as PILImage
                                img = PILImage.open(gif_path)
                                img.seek(0)
                                if img.mode != 'RGB':
                                    bg = PILImage.new('RGB', img.size, (255, 255, 255))
                                    if img.mode == 'P':
                                        img = img.convert('RGBA')
                                    if 'A' in img.mode:
                                        bg.paste(img, mask=img.split()[-1])
                                    else:
                                        bg.paste(img)
                                    img = bg
                                img.save(png_path, 'PNG')
                                gif_path.unlink(missing_ok=True)
                                print(f"    ExerciseDB OK: {png_path.name} ({png_path.stat().st_size // 1024} KB)")
                                img_saved = True
                            except:
                                pass
                time.sleep(0.3)
            except:
                pass

        # Metodo 2: Fallback wger.de con ricerca
        if not img_saved:
            try:
                search_url = f"https://wger.de/api/v2/exercise/search/?term={search_name}&language=english&format=json"
                res = requests.get(search_url, timeout=10)
                if res.status_code == 200:
                    suggestions = res.json().get("suggestions", [])
                    for suggestion in suggestions:
                        sdata = suggestion.get("data", {})
                        image_path = sdata.get("image")
                        if image_path:
                            img_url = f"https://wger.de{image_path}" if image_path.startswith("/") else image_path
                            img_res = requests.get(img_url, timeout=15)
                            if img_res.status_code == 200 and len(img_res.content) > 2000:
                                # Verifica che il nome corrisponda (evita immagini sbagliate)
                                sname = sdata.get('name', '').lower()
                                search_lower = search_name.lower().replace('-', ' ')
                                # Accetta se almeno una parola chiave corrisponde
                                keywords = search_lower.split()
                                if any(kw in sname for kw in keywords):
                                    ext = 'png' if 'png' in image_path else 'jpg'
                                    save_path = IMAGES_DIR / f"{safe_name}.{ext}"
                                    with open(save_path, 'wb') as f:
                                        f.write(img_res.content)
                                    # Converti in PNG se jpg
                                    if ext != 'png':
                                        try:
                                            from PIL import Image as PILImage
                                            im = PILImage.open(save_path)
                                            if im.mode != 'RGB':
                                                im = im.convert('RGB')
                                            im.save(png_path, 'PNG')
                                            save_path.unlink(missing_ok=True)
                                        except:
                                            pass
                                    print(f"    wger OK: {safe_name} ({len(img_res.content)//1024} KB) — {sdata.get('name', '')}")
                                    img_saved = True
                                    break
            except Exception as e:
                print(f"    wger errore: {e}")

        # Metodo 3: Fallback Unsplash/placeholder
        if not img_saved:
            print(f"    [!] Nessuna immagine trovata per: {name}")

        exercises_data[name] = EXERCISE_IT.get(name, {"name": name})

    return exercises_data


def gif_to_png(gif_path):
    """Converte il primo frame di una GIF in PNG per il PDF"""
    try:
        from PIL import Image
        png_path = gif_path.with_suffix('.png')
        if png_path.exists() and png_path.stat().st_size > 0:
            return str(png_path)
        img = Image.open(gif_path)
        img.seek(0)
        if img.mode in ('P', 'RGBA', 'LA'):
            bg = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            bg.paste(img, mask=img.split()[-1] if 'A' in img.mode else None)
            img = bg
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        img.save(png_path, 'PNG')
        print(f"    PNG convertito: {png_path.name} ({png_path.stat().st_size // 1024} KB)")
        return str(png_path)
    except Exception as e:
        print(f"  Errore conversione GIF->PNG {gif_path.name}: {e}")
        return None


def generate_pdf(exercises_data):
    """Genera il PDF della guida"""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm, cm
    from reportlab.lib.colors import HexColor, Color
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle,
        PageBreak, KeepTogether, HRFlowable
    )
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Colori — leggibili su sfondo bianco
    cyan = HexColor("#0891b2")
    dark_bg = HexColor("#f8fafc")
    dark_card = HexColor("#f1f5f9")
    white = HexColor("#0f172a")
    gray = HexColor("#64748b")
    light_gray = HexColor("#334155")
    green = HexColor("#16a34a")
    violet = HexColor("#7c3aed")

    # Stili
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'GuideTitle', parent=styles['Title'],
        fontSize=28, textColor=white, spaceAfter=6*mm,
        fontName='Helvetica-Bold', alignment=TA_CENTER
    )

    h1_style = ParagraphStyle(
        'H1', parent=styles['Heading1'],
        fontSize=22, textColor=cyan, spaceBefore=10*mm, spaceAfter=6*mm,
        fontName='Helvetica-Bold'
    )

    h2_style = ParagraphStyle(
        'H2', parent=styles['Heading2'],
        fontSize=16, textColor=light_gray, spaceBefore=8*mm, spaceAfter=4*mm,
        fontName='Helvetica-Bold'
    )

    h3_style = ParagraphStyle(
        'H3', parent=styles['Heading3'],
        fontSize=13, textColor=cyan, spaceBefore=5*mm, spaceAfter=3*mm,
        fontName='Helvetica-Bold'
    )

    body_style = ParagraphStyle(
        'Body', parent=styles['Normal'],
        fontSize=10, textColor=light_gray, spaceAfter=3*mm,
        fontName='Helvetica', leading=14, alignment=TA_JUSTIFY
    )

    small_style = ParagraphStyle(
        'Small', parent=styles['Normal'],
        fontSize=8, textColor=gray, spaceAfter=2*mm,
        fontName='Helvetica'
    )

    exercise_name_style = ParagraphStyle(
        'ExName', parent=styles['Normal'],
        fontSize=12, textColor=white, spaceAfter=2*mm,
        fontName='Helvetica-Bold'
    )

    exercise_detail_style = ParagraphStyle(
        'ExDetail', parent=styles['Normal'],
        fontSize=9, textColor=gray, spaceAfter=1*mm,
        fontName='Helvetica', leading=12
    )

    # Documento
    doc = SimpleDocTemplate(
        str(OUTPUT_PDF),
        pagesize=A4,
        topMargin=20*mm,
        bottomMargin=20*mm,
        leftMargin=18*mm,
        rightMargin=18*mm,
    )

    story = []

    # --- COPERTINA ---
    story.append(Spacer(1, 40*mm))
    story.append(Paragraph("HOME WORKOUT COMPLETO", title_style))
    story.append(Paragraph(
        '<font color="#0891b2">Trasforma il Tuo Corpo in 4 Settimane</font>',
        ParagraphStyle('Sub', parent=title_style, fontSize=18, textColor=cyan)
    ))
    story.append(Spacer(1, 6*mm))
    story.append(Paragraph(
        'Programma a Corpo Libero',
        ParagraphStyle('Sub2', parent=title_style, fontSize=14, textColor=gray)
    ))
    story.append(Spacer(1, 6*mm))
    story.append(HRFlowable(width="60%", thickness=1, color=cyan, spaceAfter=10*mm, spaceBefore=5*mm))
    story.append(Paragraph(
        "Trasforma il tuo corpo con un programma progressivo di 4 settimane<br/>"
        "a corpo libero. Nessun attrezzo. 25 esercizi illustrati. Risultati reali.",
        ParagraphStyle('CoverBody', parent=body_style, fontSize=12, alignment=TA_CENTER, textColor=gray)
    ))
    story.append(Spacer(1, 20*mm))
    story.append(Paragraph(
        '<font color="#0891b2">GuideDigitali</font> — guidedigitali.vercel.app',
        ParagraphStyle('Brand', parent=small_style, alignment=TA_CENTER)
    ))
    story.append(Spacer(1, 5*mm))
    story.append(Paragraph(
        "Nessun attrezzo richiesto | Tutti i livelli | Stampabile",
        ParagraphStyle('Tags', parent=small_style, alignment=TA_CENTER, textColor=cyan)
    ))

    story.append(PageBreak())

    # --- SOMMARIO ---
    story.append(Paragraph("Sommario", h1_style))
    story.append(Spacer(1, 5*mm))

    toc_items = [
        "Introduzione",
        "Come Usare Questa Guida",
        "Catalogo Esercizi (25 esercizi illustrati)",
        "Settimana 1 — Base",
        "Settimana 2 — Progressione",
        "Settimana 3 — Intensita",
        "Settimana 4 — Trasformazione",
        "Consigli Nutrizionali",
        "Tracking dei Progressi",
        "Prossimi Passi",
    ]

    for i, item in enumerate(toc_items, 1):
        story.append(Paragraph(
            f'<font color="#0891b2">{i:02d}</font>  {item}',
            ParagraphStyle('TOC', parent=body_style, fontSize=11, spaceAfter=4*mm)
        ))

    story.append(PageBreak())

    # --- INTRODUZIONE ---
    story.append(Paragraph("Introduzione", h1_style))
    story.append(Paragraph(
        "Questa guida e stata creata per chi vuole allenarsi seriamente a casa, "
        "senza attrezzi e senza scuse. Non servono palestre, non servono abbonamenti. "
        "Serve solo il tuo corpo e 30 minuti al giorno.",
        body_style
    ))
    story.append(Paragraph(
        "In 30 giorni passerai da principiante a un livello intermedio solido. "
        "Il programma e progressivo: ogni settimana aumenta l'intensita in modo "
        "graduale, permettendoti di adattarti senza rischio di infortuni.",
        body_style
    ))
    story.append(Spacer(1, 5*mm))

    story.append(Paragraph("Cosa Otterrai", h2_style))
    benefits = [
        "Forza funzionale migliorata su tutto il corpo",
        "Resistenza cardiovascolare superiore",
        "Core piu forte e postura migliore",
        "Abitudine all'allenamento consolidata",
        "Numeri misurabili: confronterai il Giorno 1 con il Giorno 28",
    ]
    for b in benefits:
        story.append(Paragraph(
            f'<font color="#16a34a">&#10003;</font>  {b}',
            ParagraphStyle('Benefit', parent=body_style, fontSize=10)
        ))

    story.append(PageBreak())

    # --- COME USARE ---
    story.append(Paragraph("Come Usare Questa Guida", h1_style))

    rules = [
        ("Segui l'ordine", "I giorni sono strutturati con logica. Non saltare avanti."),
        ("Riposo = crescita", "I giorni di riposo non sono opzionali. Il muscolo cresce quando riposi."),
        ("Forma prima di tutto", "Meglio 5 ripetizioni perfette che 15 fatte male."),
        ("Traccia tutto", "Usa la tabella di tracking alla fine della guida. I numeri non mentono."),
        ("Riscaldamento", "Sempre 5 minuti di riscaldamento prima di ogni sessione."),
    ]

    for title, desc in rules:
        story.append(Paragraph(
            f'<font color="#0891b2"><b>{title}</b></font>',
            ParagraphStyle('RuleTitle', parent=body_style, fontSize=11, textColor=cyan)
        ))
        story.append(Paragraph(desc, body_style))
        story.append(Spacer(1, 2*mm))

    story.append(PageBreak())

    # --- CATALOGO ESERCIZI ---
    story.append(Paragraph("Catalogo Esercizi", h1_style))
    story.append(Paragraph(
        "25 esercizi a corpo libero con immagini, muscoli coinvolti e istruzioni.",
        body_style
    ))
    story.append(Spacer(1, 5*mm))

    for ex_name in EXERCISES_TO_FETCH:
        safe_name = ex_name.replace(" ", "_")
        it_data = EXERCISE_IT.get(ex_name, {})
        api_data = exercises_data.get(ex_name, {})

        elements = []

        # Nome esercizio in italiano
        display_name = it_data.get("name", api_data.get("name", ex_name).title())
        elements.append(Paragraph(display_name, exercise_name_style))

        # Immagine — cerca png, jpg, jpeg, gif
        img_found = False
        for ext in ['png', 'jpg', 'jpeg', 'gif']:
            img_path = IMAGES_DIR / f"{safe_name}.{ext}"
            if img_path.exists() and img_path.stat().st_size > 0:
                try:
                    if ext == 'gif':
                        converted = gif_to_png(img_path)
                        if converted:
                            img_path = Path(converted)
                    img_obj = Image(str(img_path), width=55*mm, height=55*mm)
                    elements.append(img_obj)
                    elements.append(Spacer(1, 3*mm))
                    img_found = True
                    break
                except Exception as e:
                    print(f"  Errore immagine {safe_name}.{ext}: {e}")
        if not img_found:
            print(f"  [!] Immagine mancante: {safe_name}")

        # Dettagli in italiano
        target = it_data.get("target", api_data.get("target", ""))
        body_part = it_data.get("bodyPart", api_data.get("bodyPart", ""))
        secondary = ", ".join(it_data.get("secondaryMuscles", api_data.get("secondaryMuscles", []))[:3])

        if target:
            elements.append(Paragraph(
                f'<font color="#0891b2">Muscolo target:</font> {target}',
                exercise_detail_style
            ))
        if body_part:
            elements.append(Paragraph(
                f'<font color="#0891b2">Area:</font> {body_part}',
                exercise_detail_style
            ))
        if secondary:
            elements.append(Paragraph(
                f'<font color="#0891b2">Secondari:</font> {secondary}',
                exercise_detail_style
            ))

        # Istruzioni in italiano
        instructions = it_data.get("instructions", api_data.get("instructions", []))
        if instructions:
            elements.append(Spacer(1, 2*mm))
            for i, instr in enumerate(instructions[:3], 1):
                elements.append(Paragraph(
                    f'<font color="#64748b">{i}.</font> {instr}',
                    exercise_detail_style
                ))

        elements.append(Spacer(1, 3*mm))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#cbd5e1"), spaceAfter=3*mm))

        story.append(KeepTogether(elements))

    story.append(PageBreak())

    # --- PROGRAMMA 30 GIORNI ---
    for week_name, week_data in PROGRAM.items():
        story.append(Paragraph(week_name, h1_style))
        story.append(Paragraph(
            f'<i>{week_data["focus"]}</i>',
            ParagraphStyle('Focus', parent=body_style, textColor=cyan)
        ))
        story.append(Spacer(1, 5*mm))

        for day_info in week_data["days"]:
            day_elements = []

            day_elements.append(Paragraph(
                f'<font color="#0891b2">GIORNO {day_info["day"]}</font> — {day_info["name"]}',
                h3_style
            ))

            if day_info["exercises"]:
                sets = day_info.get("sets", "")
                rest = day_info.get("rest", "")

                day_elements.append(Paragraph(
                    f'<font color="#64748b">Serie/Rip:</font> {sets}  |  '
                    f'<font color="#64748b">Recupero:</font> {rest}',
                    exercise_detail_style
                ))
                day_elements.append(Spacer(1, 2*mm))

                for ex in day_info["exercises"]:
                    display = EXERCISE_IT.get(ex, {}).get("name", ex.title())
                    day_elements.append(Paragraph(
                        f'  <font color="#16a34a">&#9679;</font>  {display}',
                        ParagraphStyle('ExList', parent=body_style, fontSize=10, spaceAfter=1*mm)
                    ))
            else:
                note = day_info.get("note", "Riposo")
                day_elements.append(Paragraph(
                    f'<font color="#7c3aed"><i>{note}</i></font>',
                    ParagraphStyle('RestNote', parent=body_style, fontSize=10, textColor=violet)
                ))

            day_elements.append(Spacer(1, 3*mm))
            story.append(KeepTogether(day_elements))

        story.append(PageBreak())

    # --- CONSIGLI NUTRIZIONALI ---
    story.append(Paragraph("Consigli Nutrizionali", h1_style))
    story.append(Paragraph(
        "L'allenamento e solo meta del lavoro. Senza una nutrizione adeguata, "
        "i risultati saranno limitati. Non serve una dieta estrema: servono regole semplici.",
        body_style
    ))
    story.append(Spacer(1, 5*mm))

    nutrition_tips = [
        ("Proteine ad ogni pasto", "1.5-2g per kg di peso corporeo al giorno. Carne, pesce, uova, legumi, yogurt greco."),
        ("Idratazione", "Minimo 2 litri d'acqua al giorno. Di piu nei giorni di allenamento."),
        ("Carboidrati intelligenti", "Riso, patate, avena, frutta. Evita zuccheri raffinati."),
        ("Pasto pre-allenamento", "Carboidrati + proteine 1-2 ore prima. Esempio: banana + yogurt."),
        ("Pasto post-allenamento", "Proteine + carboidrati entro 1 ora. Esempio: pollo + riso."),
        ("Sonno", "7-8 ore minimo. Il GH (ormone della crescita) si produce durante il sonno profondo."),
    ]

    for title, desc in nutrition_tips:
        story.append(Paragraph(
            f'<font color="#0891b2"><b>{title}</b></font>',
            ParagraphStyle('NutTitle', parent=body_style, fontSize=11)
        ))
        story.append(Paragraph(desc, body_style))
        story.append(Spacer(1, 2*mm))

    story.append(PageBreak())

    # --- TRACKING ---
    story.append(Paragraph("Tracking dei Progressi", h1_style))
    story.append(Paragraph(
        "Stampa questa pagina e compila i tuoi numeri il Giorno 1 e il Giorno 28.",
        body_style
    ))
    story.append(Spacer(1, 5*mm))

    tracking_data = [
        ["Esercizio", "Giorno 1", "Giorno 28", "Differenza"],
        ["Push-Up (max rip.)", "", "", ""],
        ["Squat (max rip.)", "", "", ""],
        ["Plank (secondi)", "", "", ""],
        ["Burpee (max in 1 min)", "", "", ""],
        ["", "", "", ""],
        ["Peso corporeo (kg)", "", "", ""],
        ["Circonferenza vita (cm)", "", "", ""],
        ["Energia (1-10)", "", "", ""],
        ["Qualita sonno (1-10)", "", "", ""],
    ]

    table = Table(tracking_data, colWidths=[55*mm, 35*mm, 35*mm, 35*mm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor("#06b6d4")),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 1), (-1, -1), light_gray),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#1f2937")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor("#ffffff"), HexColor("#f1f5f9")]),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(table)

    story.append(PageBreak())

    # --- PROSSIMI PASSI ---
    story.append(Paragraph("Prossimi Passi", h1_style))
    story.append(Paragraph(
        "Hai completato 30 giorni. Sei una persona diversa da quando hai iniziato. "
        "Ma questo e solo l'inizio.",
        body_style
    ))
    story.append(Spacer(1, 5*mm))

    next_steps = [
        "Ripeti il programma aumentando le ripetizioni del 20%",
        "Aggiungi resistenza con elastici o manubri leggeri",
        "Esplora le altre guide su GuideDigitali per continuare a crescere",
        "Condividi i tuoi risultati — la community ti aspetta",
    ]
    for step in next_steps:
        story.append(Paragraph(
            f'<font color="#0891b2">&#10148;</font>  {step}',
            ParagraphStyle('NextStep', parent=body_style, fontSize=11, spaceAfter=4*mm)
        ))

    story.append(Spacer(1, 15*mm))
    story.append(HRFlowable(width="60%", thickness=1, color=cyan, spaceAfter=10*mm, spaceBefore=5*mm))
    story.append(Paragraph(
        '<font color="#0891b2">GuideDigitali</font><br/>'
        'guidedigitali.vercel.app<br/><br/>'
        'Scopri tutte le guide su fitness, business, mindset e biohacking.',
        ParagraphStyle('Footer', parent=body_style, alignment=TA_CENTER, fontSize=10)
    ))

    # Genera PDF
    print(f"\nGenerazione PDF...")
    doc.build(story)
    print(f"PDF generato: {OUTPUT_PDF}")
    print(f"Dimensione: {OUTPUT_PDF.stat().st_size / 1024:.0f} KB")


def main():
    print("=" * 60)
    print("GENERATORE GUIDA: Home Workout Corpo Libero 30 Giorni")
    print("=" * 60)

    # Step 1: Scarica esercizi
    print("\n[1/2] Scaricamento esercizi da ExerciseDB...")
    exercises_data = fetch_exercises()
    print(f"  Esercizi scaricati: {len(exercises_data)}/{len(EXERCISES_TO_FETCH)}")

    # Step 2: Genera PDF
    print("\n[2/2] Generazione PDF...")
    generate_pdf(exercises_data)

    print("\n" + "=" * 60)
    print("FATTO! Guida pronta.")
    print(f"File: {OUTPUT_PDF}")
    print("=" * 60)


if __name__ == "__main__":
    main()
