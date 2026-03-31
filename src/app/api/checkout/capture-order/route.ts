// E:\guide-digitali\src\app\api\checkout\capture-order\route.ts
// POST — Cattura pagamento PayPal, genera token download, invia email

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getSupabase } from '@/lib/supabase';
import { capturePayPalOrder } from '@/lib/paypal';
import { sendPurchaseEmail } from '@/lib/guide-email';

export async function POST(request: NextRequest) {
  try {
    const { paypal_order_id } = await request.json();

    if (!paypal_order_id) {
      return NextResponse.json({ error: 'PayPal order ID mancante' }, { status: 400 });
    }

    const capture = await capturePayPalOrder(paypal_order_id);

    if (capture.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Pagamento non completato' }, { status: 400 });
    }

    const supabase = getSupabase();

    const downloadToken = randomUUID();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const { data: order, error: updateErr } = await supabase
      .from('guide_orders')
      .update({
        status: 'completed',
        download_token: downloadToken,
        download_expires_at: expiresAt,
      })
      .eq('paypal_order_id', paypal_order_id)
      .select('*')
      .single();

    if (updateErr || !order) {
      console.error('Errore aggiornamento ordine:', updateErr);
      return NextResponse.json({ error: 'Errore aggiornamento ordine' }, { status: 500 });
    }

    const items = order.items as { product_id: string; slug: string; title: string; price: number }[];
    for (const item of items) {
      await supabase
        .rpc('increment_guide_download_count', { p_product_id: item.product_id })
        .then(null, (err: unknown) => console.error('Errore incremento download:', err));
    }

    if (order.coupon_code) {
      try {
        const { data: c } = await supabase
          .from('guide_coupons')
          .select('uses_remaining')
          .eq('code', order.coupon_code)
          .single();
        if (c && c.uses_remaining !== null && c.uses_remaining > 0) {
          await supabase
            .from('guide_coupons')
            .update({ uses_remaining: c.uses_remaining - 1 })
            .eq('code', order.coupon_code);
        }
      } catch (err) {
        console.error('Errore decremento coupon:', err);
      }
    }

    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || '';
    const downloadUrl = `${baseUrl}/success?token=${downloadToken}`;

    // Email in background — non blocca il flusso se fallisce
    sendPurchaseEmail({
      to: order.email,
      items,
      amount: Number(order.amount),
      downloadUrl,
    }).then(result => {
      if (!result.success) console.error('Email non inviata a:', order.email, result.error);
      else console.log('Email inviata a:', order.email);
    }).catch(err => {
      console.error('Errore invio email a:', order.email, err);
    });

    return NextResponse.json({
      success: true,
      download_token: downloadToken,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Errore cattura pagamento';
    console.error('capture-order error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
