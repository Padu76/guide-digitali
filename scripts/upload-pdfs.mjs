// Script per caricare i PDF di TUTTE le guide nel bucket Supabase Storage
// Legge le guide dal DB, cerca i PDF corrispondenti in output/
//
// Uso: node scripts/upload-pdfs.mjs
//
// Prerequisiti:
//   1. Metti i PDF in output/ (nome file = slug della guida, es: "mia-guida.pdf")
//   2. Crea un file .env.local con NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
//   3. Lancia: node scripts/upload-pdfs.mjs
//
// Lo script:
//   - Legge tutte le guide da guide_products
//   - Cerca PDF in output/ matchando per slug (nome file senza .pdf)
//   - Carica nel bucket guide-pdfs con path: {category}/{slug}.pdf
//   - Aggiorna pdf_path nel DB se necessario

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT_DIR = resolve(ROOT, 'output');

// --- Carica .env.local ---
function loadEnv() {
  const envPath = resolve(ROOT, '.env.local');
  if (!existsSync(envPath)) {
    console.error('File .env.local non trovato. Crealo con NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Variabili NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY mancanti in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Funzioni ---

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === 'guide-pdfs');
  if (!exists) {
    console.log('Creo bucket "guide-pdfs"...');
    const { error } = await supabase.storage.createBucket('guide-pdfs', {
      public: false,
      fileSizeLimit: 52428800,
    });
    if (error) {
      console.error('Errore creazione bucket:', error.message);
      process.exit(1);
    }
    console.log('Bucket creato\n');
  } else {
    console.log('Bucket "guide-pdfs" esiste\n');
  }
}

function findLocalPdfs() {
  if (!existsSync(OUTPUT_DIR)) {
    console.error(`Cartella output/ non trovata. Crea ${OUTPUT_DIR} e mettici i PDF.`);
    process.exit(1);
  }
  const files = readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.pdf'));
  // Mappa: slug normalizzato -> path completo
  const map = {};
  for (const f of files) {
    const name = basename(f, '.pdf');
    // Normalizza: lowercase, rimuovi accenti, solo lettere/numeri/trattini
    const normalized = name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    map[normalized] = resolve(OUTPUT_DIR, f);
    // Salva anche il nome originale per matching flessibile
    map[name.toLowerCase()] = resolve(OUTPUT_DIR, f);
  }
  return { map, files };
}

function findBestMatch(slug, localMap) {
  // Match esatto
  if (localMap[slug]) return localMap[slug];

  // Match parziale: il file contiene lo slug o viceversa
  const keys = Object.keys(localMap);
  for (const key of keys) {
    if (key.includes(slug) || slug.includes(key)) return localMap[key];
  }

  // Match per parole chiave: almeno 2 parole in comune
  const slugWords = slug.split('-').filter(w => w.length > 2);
  let bestMatch = null;
  let bestScore = 0;

  for (const key of keys) {
    const keyWords = key.split('-').filter(w => w.length > 2);
    const common = slugWords.filter(w => keyWords.includes(w)).length;
    if (common > bestScore && common >= 2) {
      bestScore = common;
      bestMatch = localMap[key];
    }
  }

  return bestMatch;
}

async function main() {
  console.log('\n=== Upload PDF guide nel bucket Supabase ===\n');
  console.log(`Supabase: ${SUPABASE_URL}`);
  console.log(`Output:   ${OUTPUT_DIR}\n`);

  await ensureBucket();

  // 1. Leggi tutte le guide dal DB
  const { data: guides, error: dbError } = await supabase
    .from('guide_products')
    .select('id, slug, title, category, pdf_path, active')
    .order('sort_order');

  if (dbError) {
    console.error('Errore lettura guide dal DB:', dbError.message);
    process.exit(1);
  }

  console.log(`Guide nel DB: ${guides.length}\n`);

  // 2. Trova PDF locali
  const { map: localMap, files: localFiles } = findLocalPdfs();
  console.log(`PDF in output/: ${localFiles.length}`);
  localFiles.forEach(f => console.log(`  - ${f}`));
  console.log('');

  // 3. Match e upload
  let uploaded = 0;
  let skipped = 0;
  let updated = 0;
  const missing = [];

  for (const guide of guides) {
    const expectedPath = `${guide.category}/${guide.slug}.pdf`;
    const localFile = findBestMatch(guide.slug, localMap);

    if (!localFile) {
      console.log(`[SKIP] ${guide.title}`);
      console.log(`       Nessun PDF trovato per slug: ${guide.slug}\n`);
      missing.push(guide);
      skipped++;
      continue;
    }

    const buffer = readFileSync(localFile);
    const sizeKb = (buffer.length / 1024).toFixed(0);
    console.log(`[UPLOAD] ${guide.title}`);
    console.log(`         ${basename(localFile)} -> ${expectedPath} (${sizeKb} KB)`);

    const { error: uploadError } = await supabase.storage
      .from('guide-pdfs')
      .upload(expectedPath, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error(`         Errore: ${uploadError.message}\n`);
      skipped++;
      continue;
    }

    console.log(`         OK`);
    uploaded++;

    // Aggiorna pdf_path nel DB se diverso
    if (guide.pdf_path !== expectedPath) {
      const { error: updateErr } = await supabase
        .from('guide_products')
        .update({ pdf_path: expectedPath })
        .eq('id', guide.id);

      if (!updateErr) {
        console.log(`         DB aggiornato: pdf_path = ${expectedPath}`);
        updated++;
      }
    }
    console.log('');
  }

  // 4. Riepilogo
  console.log('=== Riepilogo ===\n');
  console.log(`Guide totali:    ${guides.length}`);
  console.log(`PDF caricati:    ${uploaded}`);
  console.log(`DB aggiornati:   ${updated}`);
  console.log(`Saltati:         ${skipped}`);

  if (missing.length > 0) {
    console.log(`\nPDF mancanti (rinomina i file con lo slug e rimetti in output/):\n`);
    for (const g of missing) {
      console.log(`  ${g.slug}.pdf  (${g.title})`);
    }
  }

  console.log('\nFatto!\n');
}

main().catch(err => {
  console.error('Errore:', err);
  process.exit(1);
});
