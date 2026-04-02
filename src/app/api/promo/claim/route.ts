// POST — Richiedi guida gratuita in cambio di email
// Limite: 1 guida gratis per email

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getSupabase } from '@/lib/supabase';
import { sendTelegramNotification } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    const { email, product_id, slug } = await request.json();

    if (!email || !product_id || !slug) {
      return NextResponse.json({ error: 'Email e guida richiesti' }, { status: 400 });
    }

    // Validazione email base
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email non valida' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Controlla se questa email ha gia riscattato una guida gratis
    const { data: existing } = await supabase
      .from('guide_promo_claims')
      .select('id')
      .eq('email', email.toLowerCase())
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Hai gia riscattato la tua guida gratuita.' }, { status: 409 });
    }

    // Verifica che il prodotto esista
    const { data: product } = await supabase
      .from('guide_products')
      .select('id, slug, title, category, pdf_path')
      .eq('id', product_id)
      .eq('active', true)
      .single();

    if (!product) {
      return NextResponse.json({ error: 'Guida non trovata' }, { status: 404 });
    }

    // Genera token download
    const downloadToken = randomUUID();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(); // 72 ore

    // Salva claim
    const { error: insertErr } = await supabase
      .from('guide_promo_claims')
      .insert({
        email: email.toLowerCase(),
        product_id,
        slug,
        download_token: downloadToken,
        download_count: 0,
        download_expires_at: expiresAt,
      });

    if (insertErr) {
      console.error('Errore salvataggio promo:', insertErr);
      if (insertErr.code === '23505') {
        return NextResponse.json({ error: 'Hai gia riscattato la tua guida gratuita.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
    }

    // Notifica Telegram
    sendTelegramNotification(
      `<b>🎁 Nuova promo riscattata!</b>\n\n` +
      `<b>Email:</b> ${email}\n` +
      `<b>Guida:</b> ${product.title}\n\n` +
      `<i>${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}</i>`
    ).catch(() => {});

    return NextResponse.json({
      success: true,
      download_token: downloadToken,
    });
  } catch (err) {
    console.error('Errore promo claim:', err);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
