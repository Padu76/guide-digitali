// E:\guide-digitali\src\app\api\coupon\validate\route.ts
// POST — Valida codice coupon

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, reason: 'Codice non fornito' }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data: coupon, error } = await supabase
      .from('guide_coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('active', true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ valid: false, reason: 'Codice non valido' });
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return NextResponse.json({ valid: false, reason: 'Codice scaduto' });
    }

    if (coupon.uses_remaining !== null && coupon.uses_remaining <= 0) {
      return NextResponse.json({ valid: false, reason: 'Codice esaurito' });
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount_percent: coupon.discount_percent,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Errore validazione';
    return NextResponse.json({ valid: false, reason: msg }, { status: 500 });
  }
}
