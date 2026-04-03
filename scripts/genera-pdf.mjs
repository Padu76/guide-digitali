// Script locale per generare PDF reali dalle guide HTML nel bucket Supabase
// Usa Puppeteer (Chrome headless) per conversione perfetta
//
// SETUP (una volta sola):
//   npm install puppeteer @supabase/supabase-js
//
// USO:
//   node scripts/genera-pdf.mjs

import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// --- Carica .env.local ---
function loadEnv() {
  const envPath = resolve(ROOT, '.env.local');
  if (!existsSync(envPath)) {
    console.error('File .env.local non trovato.');
    process.exit(1);
  }
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('\n=== Generazione PDF guide ===\n');

  // 1. Leggi tutte le guide dal DB
  const { data: guides, error } = await supabase
    .from('guide_products')
    .select('id, slug, title, category, pdf_path, active')
    .eq('active', true)
    .order('sort_order');

  if (error) {
    console.error('Errore DB:', error.message);
    process.exit(1);
  }

  console.log(`Guide trovate: ${guides.length}\n`);

  // 2. Avvia Puppeteer
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let generated = 0;
  let failed = 0;

  for (const guide of guides) {
    const htmlPath = `guide-html/${guide.slug}.html`;
    const pdfStoragePath = `${guide.category}/${guide.slug}.pdf`;

    process.stdout.write(`[${generated + failed + 1}/${guides.length}] ${guide.title}... `);

    // 3. Scarica HTML dal bucket
    const { data: htmlBlob, error: dlErr } = await supabase.storage
      .from('guide-pdfs')
      .download(htmlPath);

    if (dlErr || !htmlBlob) {
      console.log('SKIP (HTML non trovato)');
      failed++;
      continue;
    }

    const html = await htmlBlob.text();

    // 4. Converti in PDF con Puppeteer
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

      // Attendi che le immagini si carichino
      await page.evaluate(() => {
        return Promise.all(
          Array.from(document.images)
            .filter(img => !img.complete)
            .map(img => new Promise(resolve => {
              img.onload = resolve;
              img.onerror = resolve;
            }))
        );
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '20mm', right: '18mm', bottom: '20mm', left: '18mm' },
        printBackground: true,
        preferCSSPageSize: true,
      });

      await page.close();

      // 5. Carica PDF nel bucket
      const { error: uploadErr } = await supabase.storage
        .from('guide-pdfs')
        .upload(pdfStoragePath, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadErr) {
        console.log(`ERRORE upload: ${uploadErr.message}`);
        failed++;
        continue;
      }

      // 6. Aggiorna pdf_path nel DB
      await supabase
        .from('guide_products')
        .update({ pdf_path: pdfStoragePath })
        .eq('id', guide.id);

      const sizeKb = (pdfBuffer.length / 1024).toFixed(0);
      console.log(`OK (${sizeKb} KB)`);
      generated++;
    } catch (err) {
      console.log(`ERRORE: ${err.message}`);
      failed++;
    }
  }

  await browser.close();

  console.log(`\n=== Risultato ===`);
  console.log(`Generati: ${generated}`);
  console.log(`Falliti:  ${failed}`);
  console.log(`\nFatto!\n`);
}

main().catch(err => {
  console.error('Errore:', err);
  process.exit(1);
});
