// E:\guide-digitali\src\app\api\download\[token]\route.ts
// GET — Download sicuro PDF con token monouso

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

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

    if (order.download_used) {
      return NextResponse.json({ error: 'expired', message: 'Questo link e gia stato utilizzato.' }, { status: 410 });
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

    const { data: fileData, error: downloadErr } = await supabase.storage
      .from('guide-pdfs')
      .download(product.pdf_path);

    if (downloadErr || !fileData) {
      console.error('Errore storage download:', downloadErr?.message, 'path:', product.pdf_path);
      return NextResponse.json({ error: 'Errore download PDF' }, { status: 500 });
    }

    // Segna token come usato DOPO il download riuscito
    await supabase
      .from('guide_orders')
      .update({ download_used: true })
      .eq('id', order.id);

    const arrayBuffer = await fileData.arrayBuffer();
    const filename = `${items[0].slug}.pdf`;

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'x-filename': filename,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Errore download';
    console.error('download error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
