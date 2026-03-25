// E:\guide-digitali\src\app\api\products\route.ts
// GET prodotti guide — filtro per categoria o slug

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const slug = searchParams.get('slug');

    const supabase = getSupabase();
    let query = supabase
      .from('guide_products')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }
    if (slug) {
      query = query.eq('slug', slug);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: data || [] }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Errore server';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
