// E:\guide-digitali\src\app\api\download\[token]\route.ts
// GET — Download sicuro PDF con token (max 2 download)

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const MAX_DOWNLOADS = 2;

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json({ error: 'Token mancante' }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data: order, error } = await supabase
      .from('guide_orders')
      .select('*')
      .eq('download_token', token)
      .eq('status', 'completed')
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 404 });
    }

    const downloadCount = order.download_count ?? 0;

    if (downloadCount >= MAX_DOWNLOADS) {
      return NextResponse.json({
        error: 'expired',
        message: `Hai raggiunto il limite di ${MAX_DOWNLOADS} download per questo link.`,
      }, { status: 410 });
    }

    if (order.download_expires_at && new Date(order.download_expires_at) < new Date()) {
      return NextResponse.json({ error: 'expired', message: 'Questo link e scaduto.' }, { status: 410 });
    }

    const items = order.items as { product_id: string; slug: string; title: string; price: number }[];

    // Scarica il primo PDF (in futuro: ZIP per multi)
    const { data: product } = await supabase
      .from('guide_products')
      .select('pdf_path, title')
      .eq('id', items[0].product_id)
      .single();

    if (!product || !product.pdf_path) {
      console.error('PDF non trovato per product_id:', items[0].product_id);
      return NextResponse.json({ error: 'PDF non trovato' }, { status: 404 });
    }

    // Prova a scaricare il PDF dal path nel DB
    let fileData: Blob | null = null;
    let contentType = 'application/pdf';
    let filename = `${items[0].slug}.pdf`;

    // 1. Prova il pdf_path diretto (es. fitness/slug.pdf)
    const pdfPath = product.pdf_path.startsWith('http')
      ? product.pdf_path.replace(/^.*\/guide-pdfs\//, '')
      : product.pdf_path;

    const { data: pdfData, error: pdfErr } = await supabase.storage
      .from('guide-pdfs')
      .download(pdfPath);

    if (!pdfErr && pdfData) {
      fileData = pdfData;
    }

    // 2. Fallback: cerca HTML in guide-html/{slug}.html
    if (!fileData) {
      const htmlPath = `guide-html/${items[0].slug}.html`;
      console.log('PDF non trovato, provo HTML fallback:', htmlPath);
      const { data: htmlData, error: htmlErr } = await supabase.storage
        .from('guide-pdfs')
        .download(htmlPath);

      if (!htmlErr && htmlData) {
        fileData = htmlData;
        contentType = 'text/html';
        filename = `${items[0].slug}.html`;
      }
    }

    if (!fileData) {
      console.error('Nessun file trovato per:', items[0].slug, 'pdf_path:', pdfPath);
      return NextResponse.json({ error: 'Guida non trovata nel storage' }, { status: 500 });
    }

    // Incrementa contatore download DOPO il download riuscito
    await supabase
      .from('guide_orders')
      .update({ download_count: downloadCount + 1 })
      .eq('id', order.id);

    const remaining = MAX_DOWNLOADS - downloadCount - 1;
    const arrayBuffer = await fileData.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'x-filename': filename,
        'x-downloads-remaining': String(remaining),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Errore download';
    console.error('download error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
