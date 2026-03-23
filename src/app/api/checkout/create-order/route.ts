// E:\guide-digitali\src\app\api\checkout\create-order\route.ts
// POST — Crea ordine PayPal con validazione prodotti, bundle discount e coupon

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { createPayPalOrder } from '@/lib/paypal';
import { calculateBundleDiscount, calculateTotal } from '@/lib/guide-utils';
import { CheckoutRequest, OrderItem } from '@/lib/guide-types';

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const { items, email, coupon_code } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Nessun prodotto selezionato' }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email non valida' }, { status: 400 });
    }

    const supabase = getSupabase();

    const productIds = items.map(i => i.product_id);
    const { data: products, error: prodErr } = await supabase
      .from('guide_products')
      .select('*')
      .in('id', productIds)
      .eq('active', true);

    if (prodErr || !products || products.length === 0) {
      return NextResponse.json({ error: 'Prodotti non trovati' }, { status: 400 });
    }

    const subtotal = products.reduce((sum, p) => sum + Number(p.price), 0);
    const bundleDiscount = calculateBundleDiscount(products.length, subtotal);

    let couponPercent = 0;
    if (coupon_code) {
      const { data: coupon } = await supabase
        .from('guide_coupons')
        .select('*')
        .eq('code', coupon_code.toUpperCase())
        .eq('active', true)
        .single();

      if (coupon) {
        const now = new Date().toISOString();
        const notExpired = !coupon.valid_until || coupon.valid_until > now;
        const hasUses = coupon.uses_remaining === null || coupon.uses_remaining > 0;
        if (notExpired && hasUses) {
          couponPercent = coupon.discount_percent;
        }
      }
    }

    const total = calculateTotal(subtotal, bundleDiscount, couponPercent);

    const orderItems: OrderItem[] = products.map(p => ({
      product_id: p.id,
      slug: p.slug,
      title: p.title,
      price: Number(p.price),
    }));

    const description = products.length === 1
      ? `GuideDigitali: ${products[0].title}`
      : `GuideDigitali: ${products.length} guide`;

    const paypalOrder = await createPayPalOrder({
      amount: total,
      description,
    });

    const { error: insertErr } = await supabase
      .from('guide_orders')
      .insert({
        email,
        paypal_order_id: paypalOrder.id,
        status: 'pending',
        amount: total,
        discount_amount: bundleDiscount + (couponPercent > 0 ? (subtotal - bundleDiscount) * couponPercent / 100 : 0),
        coupon_code: coupon_code?.toUpperCase() || null,
        items: orderItems,
      });

    if (insertErr) {
      console.error('Errore salvataggio ordine:', insertErr);
    }

    return NextResponse.json({
      paypal_order_id: paypalOrder.id,
      amount: total,
      discount: bundleDiscount,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Errore creazione ordine';
    console.error('create-order error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
