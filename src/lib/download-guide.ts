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
    // Inietta toolbar di download nell'HTML
    let html = await htmlData.text();
    html = injectDownloadToolbar(html, slug);

    const encoder = new TextEncoder();
    return {
      data: encoder.encode(html).buffer as ArrayBuffer,
      contentType: 'text/html; charset=utf-8',
      filename: `${slug}.html`,
      isHtml: true,
    };
  }

  return null;
}

function injectDownloadToolbar(html: string, slug: string): string {
  // Imposta il titolo della pagina (usato come nome file nel "Salva come PDF")
  const readableTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  if (html.includes('<title>')) {
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${readableTitle}</title>`);
  } else if (html.includes('<head')) {
    html = html.replace(/<head[^>]*>/, `$&<title>${readableTitle}</title>`);
  } else {
    html = `<html><head><title>${readableTitle}</title></head>` + html;
  }

  const toolbar = `
<div id="guide-toolbar" style="position:fixed;top:0;left:0;right:0;z-index:9999;background:linear-gradient(135deg,#0f172a,#1e293b);padding:12px 24px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 4px 20px rgba(0,0,0,0.3);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <span style="color:#94a3b8;font-size:13px;"><span style="color:#22d3ee;font-weight:700;">GuideDigitali</span> — ${slug}</span>
  <button onclick="document.getElementById('guide-toolbar').style.display='none';window.print();" style="background:linear-gradient(135deg,#06b6d4,#8b5cf6);color:white;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">
    Salva come PDF
  </button>
</div>
<div style="height:56px;"></div>
<style>@media print { #guide-toolbar, #guide-toolbar + div { display:none !important; height:0 !important; } }</style>`;

  // Inietta dopo <body> o all'inizio
  if (html.includes('<body')) {
    return html.replace(/<body[^>]*>/, '$&' + toolbar);
  }
  return toolbar + html;
}
