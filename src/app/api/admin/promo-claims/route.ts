// Lista promo claims per admin dashboard

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
    .from('guide_promo_claims')
    .select('id, email, guide_slug, created_at, download_count')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ claims: data || [] });
}
