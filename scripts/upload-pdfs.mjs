// Script per caricare i PDF delle guide nel bucket Supabase Storage
// Uso: node scripts/upload-pdfs.mjs
//
// Prerequisiti:
//   1. Metti i PDF in output/ con i nomi corrispondenti ai slug
//   2. Crea un file .env.local con NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
//   3. Lancia: node scripts/upload-pdfs.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Carica .env.local
function loadEnv() {
  const envPath = resolve(ROOT, '.env.local');
  if (!existsSync(envPath)) {
    console.error('❌ File .env.local non trovato. Crealo con NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
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
  console.error('❌ Variabili NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY mancanti in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Mappa: slug -> { category, file locale in output/ }
const GUIDES = [
  {
    slug: 'allenamento-completo-casa',
    category: 'fitness',
    localFile: 'home-workout-corpo-libero-30-giorni.pdf',
    storagePath: 'fitness/allenamento-completo-casa.pdf',
  },
  {
    slug: 'automazione-business-ai',
    category: 'business',
    localFile: 'automazione-business-ai.pdf',
    storagePath: 'business/automazione-business-ai.pdf',
  },
  {
    slug: 'mindset-produttivita-deep-work',
    category: 'mindset',
    localFile: 'mindset-produttivita-deep-work.pdf',
    storagePath: 'mindset/deep-work-produttivita.pdf',
  },
  {
    slug: 'personal-branding-linkedin',
    category: 'branding',
    localFile: 'personal-branding-linkedin.pdf',
    storagePath: 'branding/personal-branding-linkedin.pdf',
  },
];

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === 'guide-pdfs');
  if (!exists) {
    console.log('📦 Creo bucket "guide-pdfs"...');
    const { error } = await supabase.storage.createBucket('guide-pdfs', {
      public: false,
      fileSizeLimit: 52428800, // 50MB
    });
    if (error) {
      console.error('❌ Errore creazione bucket:', error.message);
      process.exit(1);
    }
    console.log('✅ Bucket creato');
  } else {
    console.log('✅ Bucket "guide-pdfs" esiste');
  }
}

async function uploadPdf(guide) {
  const filePath = resolve(ROOT, 'output', guide.localFile);

  if (!existsSync(filePath)) {
    console.log(`⚠️  SKIP: ${guide.localFile} non trovato in output/`);
    return false;
  }

  const buffer = readFileSync(filePath);
  console.log(`📤 Upload ${guide.localFile} -> ${guide.storagePath} (${(buffer.length / 1024).toFixed(0)} KB)...`);

  const { error } = await supabase.storage
    .from('guide-pdfs')
    .upload(guide.storagePath, buffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) {
    console.error(`❌ Errore upload ${guide.storagePath}:`, error.message);
    return false;
  }

  console.log(`✅ ${guide.storagePath} caricato`);
  return true;
}

async function main() {
  console.log('\n🚀 Upload PDF guide nel bucket Supabase\n');
  console.log(`   Supabase: ${SUPABASE_URL}`);
  console.log(`   Bucket:   guide-pdfs\n`);

  await ensureBucket();
  console.log('');

  let uploaded = 0;
  let skipped = 0;

  for (const guide of GUIDES) {
    const ok = await uploadPdf(guide);
    if (ok) uploaded++;
    else skipped++;
  }

  console.log(`\n📊 Risultato: ${uploaded} caricati, ${skipped} saltati`);

  if (skipped > 0) {
    console.log('\n💡 Per i PDF mancanti, mettili in output/ con questi nomi:');
    for (const guide of GUIDES) {
      const filePath = resolve(ROOT, 'output', guide.localFile);
      if (!existsSync(filePath)) {
        console.log(`   - output/${guide.localFile}`);
      }
    }
  }

  console.log('\n✨ Fatto!\n');
}

main().catch(err => {
  console.error('Errore:', err);
  process.exit(1);
});
