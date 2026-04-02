// Logica comune per scaricare il file guida dal bucket Supabase
// Preferisce HTML (sempre funzionante), usa PDF solo se valido (>50KB)

import { SupabaseClient } from '@supabase/supabase-js';

const MIN_PDF_SIZE = 50 * 1024; // 50KB — sotto questa soglia il PDF è probabilmente corrotto

interface DownloadResult {
  data: ArrayBuffer;
  contentType: string;
  filename: string;
}

export async function downloadGuideFile(
  supabase: SupabaseClient,
  slug: string,
  pdfPath: string
): Promise<DownloadResult | null> {
  // Normalizza pdf_path (potrebbe essere un URL completo)
  const normalizedPath = pdfPath.startsWith('http')
    ? pdfPath.replace(/^.*\/guide-pdfs\//, '')
    : pdfPath;

  // 1. Prova HTML (affidabile, sempre funzionante)
  const htmlPath = `guide-html/${slug}.html`;
  const { data: htmlData } = await supabase.storage
    .from('guide-pdfs')
    .download(htmlPath);

  if (htmlData) {
    // Controlla se esiste anche un PDF valido (>50KB)
    const { data: pdfData } = await supabase.storage
      .from('guide-pdfs')
      .download(normalizedPath);

    if (pdfData && pdfData.size > MIN_PDF_SIZE) {
      // PDF valido, usa quello
      return {
        data: await pdfData.arrayBuffer(),
        contentType: 'application/pdf',
        filename: `${slug}.pdf`,
      };
    }

    // PDF assente o corrotto, usa HTML
    return {
      data: await htmlData.arrayBuffer(),
      contentType: 'text/html; charset=utf-8',
      filename: `${slug}.html`,
    };
  }

  // 2. Niente HTML, prova PDF diretto
  const { data: pdfData } = await supabase.storage
    .from('guide-pdfs')
    .download(normalizedPath);

  if (pdfData && pdfData.size > MIN_PDF_SIZE) {
    return {
      data: await pdfData.arrayBuffer(),
      contentType: 'application/pdf',
      filename: `${slug}.pdf`,
    };
  }

  return null;
}
