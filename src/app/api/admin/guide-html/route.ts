// Scarica HTML di una guida dal bucket Supabase per generazione PDF lato client

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

  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ error: 'Slug mancante' }, { status: 400 });
  }

  const htmlPath = `guide-html/${slug}.html`;
  const { data, error } = await supabase.storage
    .from('guide-pdfs')
    .download(htmlPath);

  if (error || !data) {
    return NextResponse.json({ error: 'HTML non trovato' }, { status: 404 });
  }

  const html = await data.text();
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
