// Logica comune per scaricare il file guida dal bucket Supabase

import { SupabaseClient } from '@supabase/supabase-js';

// Soglia minima per considerare un PDF valido (non corrotto da html2pdf.js)
const MIN_VALID_PDF_SIZE = 100 * 1024; // 100KB

interface DownloadResult {
  data: ArrayBuffer;
  contentType: string;
  filename: string;
  isHtml: boolean;
}

export async function downloadGuideFile(
  supabase: SupabaseClient,
  slug: string,
  pdfPath: string
): Promise<DownloadResult | null> {
  const normalizedPath = pdfPath.startsWith('http')
    ? pdfPath.replace(/^.*\/guide-pdfs\//, '')
    : pdfPath;

  // 1. Prova PDF reale (solo se valido >100KB)
  if (normalizedPath && !normalizedPath.includes('guide-html/')) {
    const { data: pdfData } = await supabase.storage
      .from('guide-pdfs')
      .download(normalizedPath);

    if (pdfData && pdfData.size > MIN_VALID_PDF_SIZE) {
      // Verifica header PDF (%PDF-)
      const header = new Uint8Array(await pdfData.slice(0, 5).arrayBuffer());
      const isPdf = header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46;

      if (isPdf) {
        return {
          data: await pdfData.arrayBuffer(),
          contentType: 'application/pdf',
          filename: `${slug}.pdf`,
          isHtml: false,
        };
      }
    }
  }

  // 2. Fallback: HTML (sempre funzionante)
  const htmlPath = `guide-html/${slug}.html`;
  const { data: htmlData } = await supabase.storage
    .from('guide-pdfs')
    .download(htmlPath);

  if (htmlData) {
    return {
      data: await htmlData.arrayBuffer(),
      contentType: 'text/html; charset=utf-8',
      filename: `${slug}.html`,
      isHtml: true,
    };
  }

  return null;
}
