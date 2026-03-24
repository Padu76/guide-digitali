// E:\guide-digitali\src\app\api\admin\upload-cover\route.ts
// Upload cover image per una guida su Supabase Storage

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
    const { slug, image_base64, content_type, ext } = await request.json();

    if (!slug || !image_base64) {
      return NextResponse.json({ error: 'slug e image_base64 richiesti' }, { status: 400 });
    }

    // Converti base64 in buffer
    const buffer = Buffer.from(image_base64, 'base64');

    // Salva sempre come .jpg per consistenza (o mantieni estensione originale)
    const fileName = `guide-covers/${slug}.${ext || 'jpg'}`;

    // Upload su Supabase Storage (upsert sovrascrive se esiste)
    const { error: uploadError } = await supabase.storage
      .from('guide-pdfs')
      .upload(fileName, buffer, {
        contentType: content_type || 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Ottieni URL pubblico
    const { data: urlData } = supabase.storage
      .from('guide-pdfs')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName,
    });
  } catch (err) {
    console.error('Errore upload cover:', err);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
