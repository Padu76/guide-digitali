// Carica il PDF generato nel bucket Supabase Storage

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

    const formData = await request.formData();
    const file = formData.get('pdf') as File | null;
    const category = formData.get('category') as string;
    const slug = formData.get('slug') as string;

    if (!file || !category || !slug) {
      return NextResponse.json({ error: 'Campi mancanti (pdf, category, slug)' }, { status: 400 });
    }

    const storagePath = `${category}/${slug}.pdf`;
    const buffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from('guide-pdfs')
      .upload(storagePath, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Errore upload PDF:', uploadError);
      return NextResponse.json({ error: `Errore upload: ${uploadError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      pdf_path: storagePath,
    });
  } catch (error: unknown) {
    console.error('Errore upload PDF:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Errore interno' },
      { status: 500 }
    );
  }
}
