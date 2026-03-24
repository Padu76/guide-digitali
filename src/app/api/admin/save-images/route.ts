// E:\guide-digitali\src\app\api\admin\save-images\route.ts
// Salva immagini DALL-E su Supabase Storage per renderle permanenti

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('guide_admin_auth');
    if (authCookie?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { images, slug } = await request.json();
    // images: Array<{ chapter: string; url: string }>

    if (!images || !slug) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
    }

    const savedImages: Array<{ chapter: string; url: string }> = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      try {
        const res = await fetch(img.url);
        if (!res.ok) continue;

        const buffer = await res.arrayBuffer();
        const fileName = `guide-images/${slug}/cap-${i + 1}.png`;

        await supabase.storage
          .from('guide-pdfs')
          .upload(fileName, buffer, {
            contentType: 'image/png',
            upsert: true,
          });

        const { data: urlData } = supabase.storage
          .from('guide-pdfs')
          .getPublicUrl(fileName);

        savedImages.push({ chapter: img.chapter, url: urlData.publicUrl });
      } catch (e) {
        console.error(`Errore salvataggio immagine ${i}:`, e);
        // Mantieni URL originale come fallback
        savedImages.push(img);
      }
    }

    return NextResponse.json({ success: true, images: savedImages });
  } catch (error: unknown) {
    console.error('Errore save-images:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Errore interno' },
      { status: 500 }
    );
  }
}
