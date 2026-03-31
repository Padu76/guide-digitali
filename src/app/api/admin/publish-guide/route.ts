// E:\guide-digitali\src\app\api\admin\publish-guide\route.ts
// Pubblica una guida generata sullo store (crea record in guide_products)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Verifica auth admin
    const authCookie = request.cookies.get('guide_admin_auth');
    if (authCookie?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      category,
      description,
      short_description,
      price,
      page_count,
      features,
      pdf_url,
      cover_image_url, // URL immagine DALL-E da salvare come cover
    } = body;

    if (!title || !slug || !category) {
      return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400 });
    }

    // Salva cover image su Supabase Storage se fornita (DALL-E)
    // Altrimenti cerca se esiste gia un .jpg manuale nel bucket
    let coverImagePath = `/guide/covers/${slug}.webp`;
    if (cover_image_url) {
      try {
        const imgRes = await fetch(cover_image_url);
        if (imgRes.ok) {
          const imgBuffer = await imgRes.arrayBuffer();
          const coverFileName = `guide-covers/${slug}.jpg`;
          await supabase.storage
            .from('guide-pdfs')
            .upload(coverFileName, imgBuffer, {
              contentType: 'image/jpeg',
              upsert: true,
            });
          const { data: coverUrl } = supabase.storage
            .from('guide-pdfs')
            .getPublicUrl(coverFileName);
          coverImagePath = coverUrl.publicUrl;
        }
      } catch (e) {
        console.error('Errore salvataggio cover:', e);
      }
    } else {
      // Nessuna immagine DALL-E: cerca .jpg nel bucket
      const { data: coverUrl } = supabase.storage
        .from('guide-pdfs')
        .getPublicUrl(`guide-covers/${slug}.jpg`);
      coverImagePath = coverUrl.publicUrl;
    }

    // Controlla se slug esiste gia
    const { data: existing } = await supabase
      .from('guide_products')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      // Aggiorna guida esistente
      const updateData: Record<string, unknown> = {
        title,
        category,
        description: description || '',
        short_description: short_description || null,
        price: price || 9.00,
        page_count: page_count || null,
        features: features || [],
        pdf_path: pdf_url && !pdf_url.startsWith('http') ? pdf_url : pdf_url?.replace(/^.*\/guide-pdfs\//, '') || '',
        active: true,
      };
      // Aggiorna cover solo se ne abbiamo una nuova da DALL-E
      if (cover_image_url) {
        updateData.cover_image = coverImagePath;
      }

      const { error } = await supabase
        .from('guide_products')
        .update(updateData)
        .eq('slug', slug);

      if (error) {
        return NextResponse.json({ error: `Errore aggiornamento: ${error.message}` }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: 'updated', slug });
    }

    // Crea nuova guida
    const { error } = await supabase
      .from('guide_products')
      .insert({
        slug,
        title,
        category,
        description: description || '',
        short_description: short_description || null,
        price: price || 9.00,
        page_count: page_count || null,
        features: features || [],
        pdf_path: pdf_url && !pdf_url.startsWith('http') ? pdf_url : pdf_url?.replace(/^.*\/guide-pdfs\//, '') || '',
        cover_image: coverImagePath,
        preview_pages: 3,
        download_count: 0,
        active: true,
      });

    if (error) {
      return NextResponse.json({ error: `Errore creazione: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, action: 'created', slug });
  } catch (error: unknown) {
    console.error('Errore pubblicazione:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Errore interno' },
      { status: 500 }
    );
  }
}
