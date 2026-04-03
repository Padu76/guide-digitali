// Genera PDF reale da HTML usando Puppeteer serverless (Chromium)
// POST { slug } → scarica HTML dal bucket, converte in PDF, carica nel bucket

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Timeout più lungo per generazione PDF
export const maxDuration = 60;

async function getBrowser() {
  const chromium = await import('@sparticuz/chromium');
  const puppeteer = await import('puppeteer-core');

  return puppeteer.default.launch({
    args: chromium.default.args,
    defaultViewport: { width: 1280, height: 720 },
    executablePath: await chromium.default.executablePath(),
    headless: true,
  });
}

export async function POST(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('guide_admin_auth');
    if (authCookie?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { slug } = await request.json();
    if (!slug) {
      return NextResponse.json({ error: 'Slug mancante' }, { status: 400 });
    }

    // 1. Trova la guida nel DB
    const { data: guide } = await supabase
      .from('guide_products')
      .select('id, slug, title, category')
      .eq('slug', slug)
      .single();

    if (!guide) {
      return NextResponse.json({ error: 'Guida non trovata' }, { status: 404 });
    }

    // 2. Scarica HTML dal bucket
    const htmlPath = `guide-html/${slug}.html`;
    const { data: htmlBlob, error: dlErr } = await supabase.storage
      .from('guide-pdfs')
      .download(htmlPath);

    if (dlErr || !htmlBlob) {
      return NextResponse.json({ error: 'HTML non trovato nel bucket' }, { status: 404 });
    }

    const html = await htmlBlob.text();

    // 3. Converti in PDF con Puppeteer
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 25000 });

    // Attendi caricamento immagini
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
    await browser.close();

    // 4. Carica PDF nel bucket
    const pdfPath = `${guide.category}/${slug}.pdf`;
    const { error: uploadErr } = await supabase.storage
      .from('guide-pdfs')
      .upload(pdfPath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadErr) {
      return NextResponse.json({ error: `Errore upload: ${uploadErr.message}` }, { status: 500 });
    }

    // 5. Aggiorna pdf_path nel DB
    await supabase
      .from('guide_products')
      .update({ pdf_path: pdfPath })
      .eq('id', guide.id);

    return NextResponse.json({
      success: true,
      pdf_path: pdfPath,
      size: pdfBuffer.length,
    });
  } catch (error: unknown) {
    console.error('Errore generazione PDF:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Errore interno' },
      { status: 500 }
    );
  }
}
