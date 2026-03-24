// E:\guide-digitali\src\app\admin\genera\page.tsx
// Generatore Guide AI — prompt semplice → guida completa con immagini

'use client';

import { useState, useEffect, useRef } from 'react';
import { GuideCategory } from '@/lib/guide-types';

const CATEGORIES: Record<GuideCategory, { label: string; color: string; placeholder: string }> = {
  fitness: {
    label: 'Fitness & Allenamento',
    color: '#06b6d4',
    placeholder: 'Es: Programma corpo libero 4 settimane, focus su forza e resistenza, con schede giornaliere',
  },
  business: {
    label: 'AI & Automazione',
    color: '#8b5cf6',
    placeholder: 'Es: 50 prompt ChatGPT per freelancer, divisi per area (marketing, vendite, contenuti)',
  },
  mindset: {
    label: 'Mindset & Produttivita',
    color: '#f59e0b',
    placeholder: 'Es: Sistema di morning routine in 21 giorni, con checklist giornaliere e tracking',
  },
  biohacking: {
    label: 'Benessere & Performance',
    color: '#ec4899',
    placeholder: 'Es: Protocollo sonno ottimale, con tecniche, integratori e tracking settimanale',
  },
};

interface GenerationResult {
  markdown: string;
  images: Array<{ chapter: string; url: string }>;
  stats: { wordCount: number; estimatedPages: number; chapters: number; imagesGenerated: number };
}

export default function GeneraGuidePage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Form semplice
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GuideCategory>('fitness');
  const [prompt, setPrompt] = useState('');
  const [chapters, setChapters] = useState(8);
  const [generateImages, setGenerateImages] = useState(true);
  const [imageProvider, setImageProvider] = useState<'dalle' | 'leonardo'>('dalle');

  // Stato generazione
  const [step, setStep] = useState<'input' | 'generating' | 'review' | 'publishing'>('input');
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [editedMarkdown, setEditedMarkdown] = useState('');
  const [tab, setTab] = useState<'preview' | 'edit' | 'images'>('preview');
  const [error, setError] = useState('');
  const [publishResult, setPublishResult] = useState('');

  // Metadata per pubblicazione
  const [price, setPrice] = useState(9);
  const [shortDesc, setShortDesc] = useState('');

  useEffect(() => {
    if (document.cookie.includes('guide_admin_auth=authenticated')) setAuthed(true);
  }, []);

  async function handleLogin() {
    const res = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) { setAuthed(true); setLoginError(''); }
    else setLoginError('Password non corretta');
  }

  async function apiCall(body: Record<string, unknown>) {
    const res = await fetch('/api/admin/generate-guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Errore API');
    return data;
  }

  async function handleGenerate() {
    if (!title) { setError('Inserisci un titolo'); return; }
    setStep('generating');
    setError('');

    try {
      // 1. Outline
      setProgress('Creazione struttura capitoli...');
      const outlineData = await apiCall({ step: 'outline', title, category, prompt, chapters });
      const chapterTitles: string[] = outlineData.chapterTitles;

      // 2. Introduzione
      setProgress('Scrittura introduzione...');
      const introData = await apiCall({ step: 'intro', title, category, chapterTitles });
      let fullMarkdown = `# ${title}\n\n${introData.content}\n\n`;

      // 3. Capitoli uno per uno
      const chapterTexts: string[] = [];
      for (let i = 0; i < chapterTitles.length; i++) {
        setProgress(`Scrittura capitolo ${i + 1}/${chapterTitles.length}: ${chapterTitles[i]}...`);
        const chapData = await apiCall({
          step: 'chapter', title, category, chapterTitle: chapterTitles[i], chapterNum: i + 1,
        });
        chapterTexts.push(chapData.content);
        fullMarkdown += chapData.content + '\n\n';
      }

      // 4. Conclusione
      setProgress('Scrittura conclusione...');
      const concData = await apiCall({ step: 'conclusion', title, category });
      fullMarkdown += concData.content;

      // 5. Immagini (parallelo, non bloccante)
      let images: Array<{ chapter: string; url: string }> = [];
      if (generateImages) {
        setProgress(`Generazione immagini (${chapterTitles.length})...`);
        const imgPromises = chapterTitles.map(ct =>
          apiCall({ step: 'image', title, category, chapterTitle: ct })
            .then(d => d.url ? { chapter: ct, url: d.url } : null)
            .catch(() => null)
        );
        const imgResults = await Promise.allSettled(imgPromises);
        images = imgResults
          .filter((r): r is PromiseFulfilledResult<{ chapter: string; url: string } | null> => r.status === 'fulfilled')
          .map(r => r.value)
          .filter((v): v is { chapter: string; url: string } => v !== null);

        // Salva immagini su Supabase Storage (URL permanenti)
        if (images.length > 0) {
          setProgress('Salvataggio immagini permanenti...');
          try {
            const saveRes = await fetch('/api/admin/save-images', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ images, slug: autoSlug(title) }),
            });
            const saveData = await saveRes.json();
            if (saveData.success && saveData.images) {
              images = saveData.images;
            }
          } catch (e) {
            console.error('Errore salvataggio immagini:', e);
          }
        }
      }

      const wordCount = fullMarkdown.split(/\s+/).length;
      const estimatedPages = Math.max(25, Math.ceil(wordCount / 250));

      setResult({
        markdown: fullMarkdown,
        images,
        stats: { wordCount, estimatedPages, chapters: chapterTitles.length, imagesGenerated: images.length },
      });
      setEditedMarkdown(fullMarkdown);
      setStep('review');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore');
      setStep('input');
    }
  }

  async function handleRegenerate() {
    setStep('input');
    setResult(null);
    setEditedMarkdown('');
    setPublishResult('');
  }

  async function handlePublish() {
    if (!result) return;
    setStep('publishing');
    setPublishResult('');

    try {
      // 1. Carica HTML su Supabase (con immagini permanenti)
      const genRes = await fetch('/api/admin/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug: autoSlug(title),
          category,
          markdown: editedMarkdown,
          images: result.images, // URL permanenti Supabase
        }),
      });
      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error);

      // 2. Pubblica su store (con cover automatica dalla prima immagine DALL-E)
      const firstImage = result.images?.[0]?.url || null;
      const pubRes = await fetch('/api/admin/publish-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug: autoSlug(title),
          category,
          description: editedMarkdown.slice(0, 500),
          short_description: shortDesc || `Guida completa: ${title}`,
          price,
          page_count: result.stats.estimatedPages,
          features: [`${result.stats.estimatedPages}+ pagine`, `${result.stats.chapters} capitoli`, 'Stampabile', 'Download immediato'],
          pdf_url: genData.pdfUrl,
          cover_image_url: firstImage,
        }),
      });
      const pubData = await pubRes.json();
      if (!pubRes.ok) throw new Error(pubData.error);

      setPublishResult(`Pubblicata su /guide/${autoSlug(title)}`);
      setStep('review');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore pubblicazione');
      setStep('review');
    }
  }

  // Converte markdown in HTML professionale per PDF
  function markdownToPdfHtml(md: string): string {
    const c = CATEGORIES[category].color;
    const imgMap: Record<string, string> = {};
    result?.images?.forEach(img => { imgMap[img.chapter] = img.url; });

    const lines = md.split('\n');
    let html = '';
    let inBlockquote = false;
    let blockquoteLines: string[] = [];

    function flushBlockquote() {
      if (blockquoteLines.length > 0) {
        const content = blockquoteLines.map(l => renderInline(l)).join('<br>');
        const isAction = blockquoteLines.some(l => l.toLowerCase().includes('da fare subito') || l.toLowerCase().includes('azione'));
        if (isAction) {
          html += `<div style="background:${c}0D;border:1px solid ${c}30;border-left:4px solid ${c};padding:16px 20px;margin:16px 0;border-radius:0 8px 8px 0;">
            <div style="color:${c};font-weight:700;font-size:12px;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Azione Pratica</div>
            <div style="color:#1e293b;font-size:12px;line-height:1.7;">${content}</div></div>`;
        } else {
          html += `<div style="background:#f8fafc;border-left:4px solid ${c};padding:14px 18px;margin:14px 0;border-radius:0 8px 8px 0;">
            <div style="color:#334155;font-size:12px;line-height:1.7;font-style:italic;">${content}</div></div>`;
        }
        blockquoteLines = [];
      }
      inBlockquote = false;
    }

    function renderInline(text: string): string {
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#0f172a;">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, `<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:11px;color:${c};font-weight:600;">$1</code>`);
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const t = line.trim();

      // Blockquote accumulator
      if (t.startsWith('> ')) {
        inBlockquote = true;
        blockquoteLines.push(t.slice(2));
        continue;
      } else if (inBlockquote) {
        flushBlockquote();
      }

      if (!t) { html += '<div style="height:10px;"></div>'; continue; }

      // Headings
      if (t.startsWith('#### ')) {
        html += `<h4 style="color:#334155;font-size:13px;font-weight:700;margin:14px 0 6px;">${renderInline(t.slice(5))}</h4>`;
      } else if (t.startsWith('### ')) {
        html += `<h3 style="color:#1e293b;font-size:15px;font-weight:700;margin:22px 0 8px;padding-left:12px;border-left:3px solid ${c};">${renderInline(t.slice(4))}</h3>`;
      } else if (t.startsWith('## ')) {
        const heading = t.slice(3);
        // Page break prima di ogni capitolo
        html += `<div style="page-break-before:always;"></div>`;
        html += `<div style="margin-bottom:24px;">`;
        html += `<h2 style="color:${c};font-size:22px;font-weight:800;margin:0 0 8px;line-height:1.3;">${renderInline(heading)}</h2>`;
        html += `<div style="width:50px;height:3px;background:${c};border-radius:2px;"></div>`;
        html += `</div>`;
        // Immagine capitolo
        const imgUrl = imgMap[heading];
        if (imgUrl) {
          html += `<div style="margin:0 0 24px;text-align:center;"><img src="${imgUrl}" style="max-width:100%;height:auto;max-height:220px;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.08);" alt="${heading}"></div>`;
        }
      } else if (t.startsWith('# ')) {
        html += `<h1 style="color:#0f172a;font-size:28px;font-weight:800;margin:40px 0 16px;line-height:1.2;">${renderInline(t.slice(2))}</h1>`;
      }
      // Table (raw markdown)
      else if (t.startsWith('|')) {
        // Collect table lines
        const tableLines = [t];
        while (i + 1 < lines.length && lines[i + 1].trim().startsWith('|')) {
          i++;
          tableLines.push(lines[i].trim());
        }
        // Parse table
        const rows = tableLines.filter(r => !r.match(/^\|[\s-|]+\|$/)).map(r =>
          r.split('|').map(c => c.trim()).filter(c => c)
        );
        if (rows.length > 0) {
          html += `<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:11px;">`;
          rows.forEach((row, ri) => {
            html += '<tr>';
            row.forEach(cell => {
              const tag = ri === 0 ? 'th' : 'td';
              const bg = ri === 0 ? `background:${c};color:white;font-weight:700;` : (ri % 2 === 0 ? 'background:#f8fafc;' : '');
              html += `<${tag} style="padding:8px 12px;border:1px solid #e2e8f0;text-align:left;${bg}color:${ri === 0 ? '#fff' : '#334155'};">${renderInline(cell)}</${tag}>`;
            });
            html += '</tr>';
          });
          html += '</table>';
        }
      }
      // Lists
      else if (t.startsWith('- ') || t.startsWith('* ')) {
        html += `<div style="display:flex;align-items:flex-start;margin:5px 0 5px 16px;"><span style="color:${c};margin-right:10px;font-size:16px;line-height:1.2;">&#8226;</span><span style="color:#334155;font-size:12px;line-height:1.7;">${renderInline(t.slice(2))}</span></div>`;
      } else if (/^\d+\.\s/.test(t)) {
        const num = t.match(/^(\d+)\./)?.[1] || '1';
        const txt = t.replace(/^\d+\.\s/, '');
        html += `<div style="display:flex;align-items:flex-start;margin:5px 0 5px 16px;"><span style="background:${c};color:white;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;margin-right:10px;flex-shrink:0;">${num}</span><span style="color:#334155;font-size:12px;line-height:1.7;">${renderInline(txt)}</span></div>`;
      }
      // Divider
      else if (t === '---') {
        html += '<hr style="border:none;border-top:1px solid #e2e8f0;margin:28px auto;width:40%;">';
      }
      // Paragraph
      else {
        html += `<p style="color:#334155;font-size:12px;line-height:1.85;margin:7px 0;text-align:justify;">${renderInline(t)}</p>`;
      }
    }
    if (inBlockquote) flushBlockquote();
    return html;
  }

  function handleSavePdf() {
    if (!result) return;
    const c = CATEGORIES[category].color;
    const bodyHtml = markdownToPdfHtml(editedMarkdown);

    // Genera sommario dai ## headings
    const tocItems = editedMarkdown.split('\n').filter(l => l.trim().startsWith('## ')).map(l => l.trim().slice(3));
    let tocHtml = '';
    tocItems.forEach((item, i) => {
      tocHtml += `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px dotted #e2e8f0;">
        <span style="color:#334155;font-size:13px;"><span style="color:${c};font-weight:800;margin-right:14px;font-size:14px;">${String(i + 1).padStart(2, '0')}</span>${item}</span>
        <span style="color:#94a3b8;font-size:12px;">${i + 3}</span></div>`;
    });

    const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
<style>
  @page { size: A4; margin: 22mm 20mm; }
  body { font-family: 'Segoe UI', -apple-system, Arial, sans-serif; background: #fff; color: #334155; margin: 0; padding: 0; }
  @media print { body { padding: 0; } .no-print { display: none; } }
  @media screen { body { max-width: 800px; margin: 0 auto; padding: 40px 32px; } }
</style></head><body>

<!-- COPERTINA -->
<div style="text-align:center;padding:100px 0 60px;page-break-after:always;">
  <div style="margin-bottom:28px;">
    <span style="background:${c};color:white;padding:8px 24px;border-radius:24px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">${CATEGORIES[category].label}</span>
  </div>
  <h1 style="font-size:38px;font-weight:800;color:#0f172a;margin:28px auto;line-height:1.15;max-width:500px;">${title}</h1>
  <div style="width:70px;height:4px;background:${c};margin:28px auto;border-radius:2px;"></div>
  <p style="color:#64748b;font-size:14px;max-width:400px;margin:0 auto;line-height:1.7;">Guida pratica e completa.<br>Scaricabile e stampabile.</p>
  <div style="margin-top:100px;">
    <span style="color:${c};font-weight:700;font-size:13px;">GuideDigitali</span>
    <span style="color:#94a3b8;font-size:12px;"> — guidedigitali.vercel.app</span>
  </div>
</div>

<!-- SOMMARIO -->
<div style="page-break-after:always;">
  <h2 style="color:#0f172a;font-size:26px;font-weight:800;margin-bottom:28px;">Sommario</h2>
  ${tocHtml}
</div>

<!-- CONTENUTO -->
${bodyHtml}

<!-- ULTIMA PAGINA -->
<div style="page-break-before:always;text-align:center;padding-top:120px;">
  <div style="width:60px;height:4px;background:${c};margin:0 auto 28px;border-radius:2px;"></div>
  <p style="color:${c};font-weight:800;font-size:18px;">GuideDigitali</p>
  <p style="color:#64748b;font-size:13px;margin-top:8px;">guidedigitali.vercel.app</p>
  <p style="color:#94a3b8;font-size:12px;margin-top:24px;max-width:320px;margin-left:auto;margin-right:auto;line-height:1.7;">Scopri tutte le guide su fitness, AI, mindset e biohacking.</p>
</div>

</body></html>`;

    const w = window.open('', '_blank');
    if (w) {
      w.document.write(fullHtml);
      w.document.close();
      setTimeout(() => w.print(), 800);
    }
  }

  function autoSlug(t: string) {
    return t
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // accenti: e->e, a->a, u->u
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .trim();
  }

  function formatInline(text: string): string {
    const c = CATEGORIES[category].color;
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#0f172a;font-weight:700;">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em style="color:#475569;">$1</em>')
      .replace(/`(.+?)`/g, `<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:11px;color:${c};font-weight:600;">$1</code>`);
  }

  // Mappa capitolo -> immagine URL
  function getImageMap(): Record<string, string> {
    const map: Record<string, string> = {};
    if (result?.images) {
      result.images.forEach(img => { map[img.chapter] = img.url; });
    }
    return map;
  }

  function markdownToHtml(md: string): string {
    const c = CATEGORIES[category].color;
    const imgMap = getImageMap();
    const lines = md.split('\n');
    let html = '';
    let chapterCount = 0;

    for (const line of lines) {
      const t = line.trim();
      if (!t) { html += '<div style="height:10px;"></div>'; continue; }

      if (t.startsWith('### ')) {
        html += `<h3 style="color:#475569;font-size:15px;font-weight:700;margin:18px 0 6px;">${t.slice(4)}</h3>`;
      } else if (t.startsWith('## ')) {
        const heading = t.slice(3);
        chapterCount++;
        // Separatore visivo tra capitoli
        if (chapterCount > 1) html += '<div style="height:24px;border-top:1px solid #e2e8f0;margin:32px 0 0;"></div>';
        html += `<h2 style="color:${c};font-size:20px;font-weight:800;margin:16px 0 10px;padding-bottom:6px;border-bottom:2px solid ${c}30;">${heading}</h2>`;
        // Inserisci immagine del capitolo se disponibile
        const imgUrl = imgMap[heading];
        if (imgUrl) {
          html += `<div style="margin:12px 0 20px;text-align:center;"><img src="${imgUrl}" style="max-width:100%;height:auto;max-height:280px;border-radius:10px;box-shadow:0 2px 12px rgba(0,0,0,0.08);" alt="${heading}"></div>`;
        }
      } else if (t.startsWith('# ')) {
        html += `<h1 style="color:#0f172a;font-size:28px;font-weight:800;margin:32px 0 14px;">${t.slice(2)}</h1>`;
      } else if (t.startsWith('> ')) {
        html += `<div style="border-left:3px solid ${c};background:${c}08;padding:10px 14px;margin:10px 0;border-radius:0 6px 6px 0;"><span style="color:#334155;font-size:13px;line-height:1.6;">${formatInline(t.slice(2))}</span></div>`;
      } else if (t.startsWith('- ') || t.startsWith('* ')) {
        html += `<div style="display:flex;margin:4px 0 4px 12px;"><span style="color:${c};margin-right:8px;">&#8226;</span><span style="color:#334155;font-size:13px;line-height:1.6;">${formatInline(t.slice(2))}</span></div>`;
      } else if (/^\d+\. /.test(t)) {
        const num = t.match(/^(\d+)\./)?.[1] || '1';
        const txt = t.replace(/^\d+\.\s/, '');
        html += `<div style="display:flex;margin:4px 0 4px 12px;"><span style="color:${c};margin-right:8px;font-weight:700;min-width:20px;">${num}.</span><span style="color:#334155;font-size:13px;line-height:1.6;">${formatInline(txt)}</span></div>`;
      } else if (t === '---') {
        html += '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px auto;width:50%;">';
      } else {
        html += `<p style="color:#334155;font-size:13px;line-height:1.8;margin:5px 0;">${formatInline(t)}</p>`;
      }
    }
    return html;
  }

  // --- LOGIN ---
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="bg-[#0a0a1a] border border-[#1a1a2e] rounded-xl p-8 w-full max-w-md">
          <h1 className="text-xl font-bold text-white mb-6 text-center">Genera Guide</h1>
          <input type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 bg-[#111827] border border-[#1f2937] rounded-lg text-white mb-4" />
          {loginError && <p className="text-red-400 text-sm mb-4">{loginError}</p>}
          <button onClick={handleLogin} className="w-full py-3 bg-cyan-600 text-white rounded-lg font-semibold">Accedi</button>
        </div>
      </div>
    );
  }

  const cat = CATEGORIES[category];

  // --- STEP 1: INPUT ---
  if (step === 'input') {
    return (
      <div className="min-h-screen bg-[#050510] text-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">Genera una Guida</h1>
            <p className="text-gray-400">Scegli categoria, scrivi il titolo, e l'AI crea tutto.</p>
          </div>

          {/* Categoria */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {(Object.entries(CATEGORIES) as [GuideCategory, typeof cat][]).map(([key, val]) => (
              <button key={key} onClick={() => setCategory(key)}
                className={`py-3 px-4 rounded-xl text-sm font-semibold transition border-2 ${category === key ? 'border-opacity-100 bg-opacity-10' : 'border-transparent bg-[#0a0a1a] hover:bg-[#111827]'}`}
                style={{ borderColor: category === key ? val.color : 'transparent', backgroundColor: category === key ? val.color + '15' : undefined, color: category === key ? val.color : '#9ca3af' }}>
                {val.label}
              </button>
            ))}
          </div>

          {/* Titolo */}
          <div className="mb-6">
            <label className="text-sm text-gray-400 mb-2 block">Titolo della guida</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Es: Deep Work: Concentrazione Estrema in 21 Giorni"
              className="w-full px-4 py-3 bg-[#0a0a1a] border border-[#1a1a2e] rounded-xl text-white text-lg focus:outline-none focus:border-gray-600" />
          </div>

          {/* Prompt */}
          <div className="mb-6">
            <label className="text-sm text-gray-400 mb-2 block">Cosa deve contenere? (opzionale)</label>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3}
              placeholder={cat.placeholder}
              className="w-full px-4 py-3 bg-[#0a0a1a] border border-[#1a1a2e] rounded-xl text-white text-sm focus:outline-none focus:border-gray-600 resize-none" />
          </div>

          {/* Opzioni */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Capitoli</label>
              <select value={chapters} onChange={e => setChapters(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#0a0a1a] border border-[#1a1a2e] rounded-lg text-white text-sm">
                {[5, 6, 7, 8, 10, 12].map(n => <option key={n} value={n}>{n} capitoli</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Immagini</label>
              <select value={generateImages ? (imageProvider === 'dalle' ? 'dalle' : 'leonardo') : 'none'}
                onChange={e => { setGenerateImages(e.target.value !== 'none'); setImageProvider(e.target.value as 'dalle' | 'leonardo'); }}
                className="w-full px-3 py-2 bg-[#0a0a1a] border border-[#1a1a2e] rounded-lg text-white text-sm">
                <option value="dalle">DALL-E 3</option>
                <option value="leonardo">Leonardo AI</option>
                <option value="none">Nessuna</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Prezzo EUR</label>
              <input type="number" step="0.01" value={price} onChange={e => setPrice(parseFloat(e.target.value) || 9)}
                className="w-full px-3 py-2 bg-[#0a0a1a] border border-[#1a1a2e] rounded-lg text-white text-sm" />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

          <button onClick={handleGenerate} disabled={!title}
            className="w-full py-4 rounded-xl font-bold text-lg transition disabled:opacity-40"
            style={{ backgroundColor: cat.color }}>
            Genera Guida Completa
          </button>

          <p className="text-center text-gray-600 text-xs mt-4">
            Costo stimato: ~$0.15 testo {generateImages ? `+ ~$0.04 x ${chapters} immagini` : ''} = ~${generateImages ? (0.15 + 0.04 * chapters).toFixed(2) : '0.15'}
          </p>

          <div className="mt-8 text-center">
            <a href="/admin" className="text-gray-500 text-sm hover:text-gray-300 transition">Dashboard Ordini</a>
          </div>
        </div>
      </div>
    );
  }

  // --- STEP 2: GENERATING ---
  if (step === 'generating') {
    return (
      <div className="min-h-screen bg-[#050510] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-700 rounded-full mx-auto mb-6 animate-spin" style={{ borderTopColor: cat.color }}></div>
          <h2 className="text-xl font-bold mb-2">Generazione in corso...</h2>
          <p className="text-gray-400">{progress}</p>
          <p className="text-gray-600 text-sm mt-4">Puo richiedere 30-60 secondi</p>
        </div>
      </div>
    );
  }

  // --- STEP 3: REVIEW ---
  return (
    <div className="min-h-screen bg-[#050510] text-white">
      <div className="max-w-[1600px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: cat.color + '20', color: cat.color }}>{cat.label}</span>
              {result && (
                <span className="text-xs text-gray-500">
                  {result.stats.wordCount.toLocaleString()} parole — ~{result.stats.estimatedPages} pagine — {result.stats.chapters} capitoli — {result.stats.imagesGenerated} immagini
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <a href="/admin"
              className="px-4 py-2 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg text-sm text-gray-400 hover:text-white transition flex items-center">
              Admin
            </a>
            <button onClick={handleRegenerate}
              className="px-4 py-2 bg-amber-900/30 border border-amber-800 rounded-lg text-sm text-amber-400 hover:bg-amber-900/50 transition">
              Ricomincia
            </button>
            <button onClick={handleGenerate}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition" style={{ backgroundColor: cat.color + '20', color: cat.color }}>
              Rigenera
            </button>
            <button onClick={handleSavePdf}
              className="px-4 py-2 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg text-sm text-white hover:bg-[#2a2a3e] transition">
              Salva PDF
            </button>
            <button onClick={handlePublish} disabled={step === 'publishing'}
              className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-500 transition disabled:opacity-50">
              {step === 'publishing' ? 'Pubblicazione...' : 'Pubblica su Store'}
            </button>
          </div>
        </div>

        {publishResult && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-800 rounded-lg text-green-400 text-sm">
            {publishResult}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
          {/* Main content */}
          <div className="bg-[#0a0a1a] border border-[#1a1a2e] rounded-xl overflow-hidden flex flex-col" style={{ minHeight: '80vh' }}>
            {/* Tabs */}
            <div className="flex border-b border-[#1a1a2e] shrink-0">
              {(['preview', 'edit', 'images'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-3 text-sm font-semibold transition ${tab === t ? 'text-white bg-[#111827]' : 'text-gray-500 hover:text-gray-300'}`}>
                  {t === 'preview' ? 'Anteprima' : t === 'edit' ? 'Modifica Testo' : `Immagini (${result?.images.length || 0})`}
                </button>
              ))}
            </div>

            <div className="flex-1 relative">
              {tab === 'preview' && (
                <div className="absolute inset-0 overflow-y-auto px-10 py-8 bg-white"
                  style={{ fontFamily: "'Segoe UI', -apple-system, Arial, sans-serif" }}
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(editedMarkdown) }} />
              )}

              {tab === 'edit' && (
                <textarea value={editedMarkdown} onChange={e => setEditedMarkdown(e.target.value)}
                  className="absolute inset-0 w-full h-full px-5 py-4 bg-[#0d1117] text-gray-300 text-sm font-mono resize-none focus:outline-none leading-relaxed"
                  spellCheck={false} />
              )}

              {tab === 'images' && (
                <div className="absolute inset-0 overflow-y-auto p-6 bg-[#0d1117]">
                  {result?.images && result.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {result.images.map((img, i) => (
                        <div key={i} className="bg-[#111827] rounded-xl overflow-hidden border border-[#1f2937]">
                          <img src={img.url} alt={img.chapter} className="w-full aspect-square object-cover" />
                          <div className="p-3">
                            <p className="text-xs text-gray-400 truncate">{img.chapter}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-600">
                      <p>Nessuna immagine generata. Rigenera con immagini abilitate.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: metadata per pubblicazione */}
          <div className="space-y-4">
            <div className="bg-[#0a0a1a] border border-[#1a1a2e] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Dettagli Store</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Slug URL</label>
                  <div className="px-3 py-2 bg-[#111827] border border-[#1f2937] rounded-lg text-gray-400 text-xs">
                    /guide/{autoSlug(title)}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Prezzo EUR</label>
                  <input type="number" step="0.01" value={price} onChange={e => setPrice(parseFloat(e.target.value) || 9)}
                    className="w-full px-3 py-2 bg-[#111827] border border-[#1f2937] rounded-lg text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Descrizione breve</label>
                  <input value={shortDesc} onChange={e => setShortDesc(e.target.value)}
                    placeholder="Una riga per lo store"
                    className="w-full px-3 py-2 bg-[#111827] border border-[#1f2937] rounded-lg text-white text-xs" />
                </div>
              </div>
            </div>

            {result && (
              <div className="bg-[#0a0a1a] border border-[#1a1a2e] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Parole</span><span className="text-white">{result.stats.wordCount.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Pagine stimate</span><span className="text-white">~{result.stats.estimatedPages}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Capitoli</span><span className="text-white">{result.stats.chapters}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Immagini</span><span className="text-white">{result.stats.imagesGenerated}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
