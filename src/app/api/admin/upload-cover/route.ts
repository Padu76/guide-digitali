// E:\guide-digitali\src\app\api\admin\upload-cover\route.ts
// Upload cover image per una guida su Supabase Storage (FormData)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const authCookie = request.cookies.get('guide_admin_auth');
  if (authCookie?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const slug = formData.get('slug') as string | null;
    const guideId = formData.get('guide_id') as string | null;

    if (!file || !slug) {
      return NextResponse.json({ error: 'File e slug richiesti' }, { status: 400 });
    }

    // Leggi file come buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = file.type || 'image/jpeg';

    // Salva su Supabase Storage
    const fileName = `guide-covers/${slug}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('guide-pdfs')
      .upload(fileName, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Ottieni URL pubblico
    const { data: urlData } = supabase.storage
      .from('guide-pdfs')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // Aggiungi timestamp per evitare cache CDN
    const urlWithCache = `${publicUrl}?v=${Date.now()}`;

    // Aggiorna il DB con cache-buster
    if (guideId) {
      await supabase
        .from('guide_products')
        .update({ cover_image: urlWithCache })
        .eq('id', guideId);
    }

    return NextResponse.json({
      success: true,
      url: urlWithCache,
    });
  } catch (err) {
    console.error('Errore upload cover:', err);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
