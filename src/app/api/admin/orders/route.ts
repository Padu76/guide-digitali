// E:\guide-digitali\src\app\api\admin\orders\route.ts
// GET — Lista ordini (protetto da cookie auth)

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get('guide_admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    const supabase = getSupabase();

    let query = supabase
      .from('guide_orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      orders: data || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Errore server';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authCookie = request.cookies.get('guide_admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID mancante' }, { status: 400 });
  }

  const supabase = getSupabase();

  // Solo ordini non completati possono essere eliminati
  const { data: order } = await supabase
    .from('guide_orders')
    .select('status')
    .eq('id', id)
    .single();

  if (!order) {
    return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 });
  }

  if (order.status === 'completed') {
    return NextResponse.json({ error: 'Non puoi eliminare un ordine completato' }, { status: 400 });
  }

  const { error } = await supabase
    .from('guide_orders')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
