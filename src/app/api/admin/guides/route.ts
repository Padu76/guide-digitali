// E:\guide-digitali\src\app\api\admin\guides\route.ts
// Lista tutte le guide pubblicate + toggle attivo/disattivo + elimina

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get('guide_admin_auth');
  if (authCookie?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('guide_products')
    .select('id, slug, title, category, price, page_count, download_count, active, created_at, pdf_path, cover_image')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ guides: data || [] });
}

export async function PATCH(request: NextRequest) {
  const authCookie = request.cookies.get('guide_admin_auth');
  if (authCookie?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const body = await request.json();
  const { id, active, category } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID mancante' }, { status: 400 });
  }

  // Costruisci update dinamico
  const updateData: Record<string, unknown> = {};
  if (active !== undefined) updateData.active = active;
  if (category) updateData.category = category;

  const { error } = await supabase
    .from('guide_products')
    .update(updateData)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const authCookie = request.cookies.get('guide_admin_auth');
  if (authCookie?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID mancante' }, { status: 400 });
  }

  const { error } = await supabase
    .from('guide_products')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
