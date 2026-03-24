// E:\guide-digitali\src\app\api\admin\generate-pdf\route.ts
// Genera PDF dalla struttura markdown e lo carica su Supabase Storage

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GuideCategory } from '@/lib/guide-types';

// Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Colori per categoria
const CATEGORY_COLORS: Record<GuideCategory, { primary: string; accent: string }> = {
  fitness: { primary: '#06b6d4', accent: '#0891b2' },
  business: { primary: '#8b5cf6', accent: '#7c3aed' },
  mindset: { primary: '#f59e0b', accent: '#d97706' },
  biohacking: { primary: '#ec4899', accent: '#db2777' },
};

const CATEGORY_LABELS: Record<GuideCategory, string> = {
  fitness: 'Fitness & Allenamento',
  business: 'AI & Automazione',
  mindset: 'Mindset & Produttivita',
  biohacking: 'Benessere & Performance',
};

// Converte markdown in struttura sezioni
function parseMarkdown(markdown: string): Array<{ type: string; content: string; level?: number }> {
  const lines = markdown.split('\n');
  const sections: Array<{ type: string; content: string; level?: number }> = [];
  let currentParagraph = '';

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('### ')) {
      if (currentParagraph) {
        sections.push({ type: 'paragraph', content: currentParagraph.trim() });
        currentParagraph = '';
      }
      sections.push({ type: 'heading', content: trimmed.replace('### ', ''), level: 3 });
    } else if (trimmed.startsWith('## ')) {
      if (currentParagraph) {
        sections.push({ type: 'paragraph', content: currentParagraph.trim() });
        currentParagraph = '';
      }
      sections.push({ type: 'heading', content: trimmed.replace('## ', ''), level: 2 });
    } else if (trimmed.startsWith('# ')) {
      if (currentParagraph) {
        sections.push({ type: 'paragraph', content: currentParagraph.trim() });
        currentParagraph = '';
      }
      sections.push({ type: 'heading', content: trimmed.replace('# ', ''), level: 1 });
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (currentParagraph) {
        sections.push({ type: 'paragraph', content: currentParagraph.trim() });
        currentParagraph = '';
      }
      sections.push({ type: 'list-item', content: trimmed.replace(/^[-*] /, '') });
    } else if (/^\d+\. /.test(trimmed)) {
      if (currentParagraph) {
        sections.push({ type: 'paragraph', content: currentParagraph.trim() });
        currentParagraph = '';
      }
      sections.push({ type: 'numbered-item', content: trimmed.replace(/^\d+\. /, '') });
    } else if (trimmed === '---') {
      if (currentParagraph) {
        sections.push({ type: 'paragraph', content: currentParagraph.trim() });
        currentParagraph = '';
      }
      sections.push({ type: 'divider', content: '' });
    } else if (trimmed === '') {
      if (currentParagraph) {
        sections.push({ type: 'paragraph', content: currentParagraph.trim() });
        currentParagraph = '';
      }
    } else {
      currentParagraph += (currentParagraph ? ' ' : '') + trimmed;
    }
  }

  if (currentParagraph) {
    sections.push({ type: 'paragraph', content: currentParagraph.trim() });
  }

  return sections;
}

// Genera HTML completo per il PDF
function generateHTML(
  title: string,
  category: GuideCategory,
  sections: Array<{ type: string; content: string; level?: number }>,
  imageMap: Record<string, string> = {}
): string {
  const colors = CATEGORY_COLORS[category];
  const label = CATEGORY_LABELS[category];

  // Estrai heading H2 per sommario
  const tocItems = sections
    .filter(s => s.type === 'heading' && s.level === 2)
    .map(s => s.content);

  let bodyHtml = '';

  for (const section of sections) {
    switch (section.type) {
      case 'heading':
        if (section.level === 1) {
          bodyHtml += `<h1 style="color: #0f172a; font-size: 28px; font-weight: 800; margin: 40px 0 16px; page-break-after: avoid;">${section.content}</h1>`;
        } else if (section.level === 2) {
          bodyHtml += `<div style="page-break-before: always;"></div>`;
          bodyHtml += `<h2 style="color: ${colors.primary}; font-size: 22px; font-weight: 800; margin: 32px 0 12px; padding-bottom: 6px; border-bottom: 2px solid ${colors.primary}25; page-break-after: avoid;">${section.content}</h2>`;
          // Immagine capitolo se disponibile
          const imgUrl = imageMap[section.content];
          if (imgUrl) {
            bodyHtml += `<div style="text-align: center; margin: 16px 0 24px;"><img src="${imgUrl}" style="max-width: 100%; height: auto; max-height: 220px; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.08);" alt="${section.content}"></div>`;
          }
        } else {
          bodyHtml += `<h3 style="color: #475569; font-size: 15px; font-weight: 700; margin: 20px 0 8px;">${section.content}</h3>`;
        }
        break;
      case 'paragraph':
        bodyHtml += `<p style="color: #334155; font-size: 11.5px; line-height: 1.75; margin: 8px 0; text-align: justify;">${section.content.replace(/\*\*(.+?)\*\*/g, '<strong style="color: #0f172a;">$1</strong>').replace(/\*(.+?)\*/g, '<em style="color: #475569;">$1</em>')}</p>`;
        break;
      case 'list-item':
        bodyHtml += `<div style="display: flex; align-items: flex-start; margin: 5px 0 5px 16px;"><span style="color: ${colors.primary}; margin-right: 10px; font-size: 14px;">&#8226;</span><span style="color: #334155; font-size: 11.5px; line-height: 1.65;">${section.content}</span></div>`;
        break;
      case 'numbered-item':
        bodyHtml += `<div style="display: flex; align-items: flex-start; margin: 5px 0 5px 16px;"><span style="color: ${colors.primary}; margin-right: 10px; font-size: 11.5px; font-weight: 700; min-width: 18px;">&#9679;</span><span style="color: #334155; font-size: 11.5px; line-height: 1.65;">${section.content}</span></div>`;
        break;
      case 'divider':
        bodyHtml += `<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px auto; width: 50%;">`;
        break;
    }
  }

  // Sommario HTML
  let tocHtml = '';
  tocItems.forEach((item, i) => {
    tocHtml += `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dotted #e2e8f0;">
      <span><span style="color: ${colors.primary}; font-weight: 700; margin-right: 12px;">${String(i + 1).padStart(2, '0')}</span><span style="color: #334155; font-size: 12px;">${item}</span></span>
      <span style="color: #94a3b8; font-size: 11px;">${i + 3}</span>
    </div>`;
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 20mm 18mm; }
    body { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; background: #ffffff; color: #334155; margin: 0; padding: 0; }
    .page { page-break-after: always; padding: 20mm 18mm; }
    .page:last-child { page-break-after: auto; }
  </style>
</head>
<body>
  <!-- COPERTINA -->
  <div style="text-align: center; padding-top: 80px;">
    <div style="margin-bottom: 24px;">
      <span style="background: ${colors.primary}; color: white; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">${label}</span>
    </div>
    <h1 style="font-size: 36px; font-weight: 800; color: #0f172a; margin: 24px 0 16px; line-height: 1.2;">${title}</h1>
    <div style="width: 80px; height: 3px; background: ${colors.primary}; margin: 24px auto;"></div>
    <p style="color: #64748b; font-size: 14px; max-width: 400px; margin: 0 auto; line-height: 1.6;">Guida pratica e completa. Scaricabile e stampabile.</p>
    <div style="margin-top: 60px; color: #94a3b8; font-size: 11px;">
      <span style="color: ${colors.primary}; font-weight: 600;">GuideDigitali</span> — guidedigitali.vercel.app
    </div>
  </div>

  <div style="page-break-after: always;"></div>

  <!-- SOMMARIO -->
  <div>
    <h2 style="color: #0f172a; font-size: 24px; font-weight: bold; margin-bottom: 24px;">Sommario</h2>
    ${tocHtml}
  </div>

  <div style="page-break-after: always;"></div>

  <!-- CONTENUTO -->
  ${bodyHtml}

  <!-- FOOTER -->
  <div style="text-align: center; margin-top: 60px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
    <p style="color: ${colors.primary}; font-weight: 600; font-size: 14px;">GuideDigitali</p>
    <p style="color: #94a3b8; font-size: 11px;">guidedigitali.vercel.app — Scopri tutte le guide</p>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    // Verifica auth admin
    const authCookie = request.cookies.get('guide_admin_auth');
    if (authCookie?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, category, markdown, images } = body;
    // images: Array<{ chapter: string; url: string }> — URL permanenti Supabase

    if (!title || !slug || !category || !markdown) {
      return NextResponse.json({ error: 'Campi mancanti' }, { status: 400 });
    }

    // Parse markdown
    const sections = parseMarkdown(markdown);

    // Mappa immagini per capitolo
    const imageMap: Record<string, string> = {};
    if (images && Array.isArray(images)) {
      images.forEach((img: { chapter: string; url: string }) => {
        imageMap[img.chapter] = img.url;
      });
    }

    // Genera HTML con immagini
    const html = generateHTML(title, category as GuideCategory, sections, imageMap);

    // Salva HTML su Supabase Storage (il PDF vero lo generiamo lato client o con servizio esterno)
    const htmlFileName = `guide-html/${slug}.html`;
    const htmlBlob = new Blob([html], { type: 'text/html' });

    const { error: uploadError } = await supabase.storage
      .from('guide-pdfs')
      .upload(htmlFileName, htmlBlob, {
        contentType: 'text/html',
        upsert: true,
      });

    if (uploadError) {
      console.error('Errore upload HTML:', uploadError);
      return NextResponse.json({ error: `Errore upload: ${uploadError.message}` }, { status: 500 });
    }

    // Ottieni URL pubblico
    const { data: urlData } = supabase.storage
      .from('guide-pdfs')
      .getPublicUrl(htmlFileName);

    return NextResponse.json({
      success: true,
      htmlUrl: urlData.publicUrl,
      pdfUrl: urlData.publicUrl, // Per ora restituisce HTML, in futuro PDF
      sections: sections.length,
      tocItems: sections.filter(s => s.type === 'heading' && s.level === 2).length,
    });
  } catch (error: unknown) {
    console.error('Errore generazione:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Errore interno' },
      { status: 500 }
    );
  }
}
