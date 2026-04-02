// GET — Download guida gratuita tramite token promo

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { downloadGuideFile } from '@/lib/download-guide';

const MAX_DOWNLOADS = 2;

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Token mancante' }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data: claim, error } = await supabase
      .from('guide_promo_claims')
      .select('*')
      .eq('download_token', token)
      .single();

    if (error || !claim) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 404 });
    }

    const downloadCount = claim.download_count ?? 0;

    if (downloadCount >= MAX_DOWNLOADS) {
      return NextResponse.json({
        error: 'expired',
        message: `Hai raggiunto il limite di ${MAX_DOWNLOADS} download.`,
      }, { status: 410 });
    }

    if (claim.download_expires_at && new Date(claim.download_expires_at) < new Date()) {
      return NextResponse.json({ error: 'expired', message: 'Questo link e scaduto.' }, { status: 410 });
    }

    // Scarica il prodotto
    const { data: product } = await supabase
      .from('guide_products')
      .select('pdf_path, title, category')
      .eq('id', claim.product_id)
      .single();

    if (!product || !product.pdf_path) {
      return NextResponse.json({ error: 'Guida non trovata' }, { status: 404 });
    }

    const result = await downloadGuideFile(supabase, claim.slug, product.pdf_path);

    if (!result) {
      return NextResponse.json({ error: 'File non trovato' }, { status: 500 });
    }

    // Incrementa contatore
    await supabase
      .from('guide_promo_claims')
      .update({ download_count: downloadCount + 1 })
      .eq('id', claim.id);

    const remaining = MAX_DOWNLOADS - downloadCount - 1;

    return new NextResponse(result.data, {
      headers: {
        'Content-Type': result.contentType,
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'x-filename': result.filename,
        'x-downloads-remaining': String(remaining),
      },
    });
  } catch (err) {
    console.error('Errore promo download:', err);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
