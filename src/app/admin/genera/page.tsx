// E:\guide-digitali\src\app\admin\genera\page.tsx
// Generatore Guide PDF — admin panel
// Editor markdown → preview PDF-like → genera → modifica → rigenera → pubblica

'use client';

import { useState, useEffect, useRef } from 'react';
import { GuideCategory } from '@/lib/guide-types';

const TEMPLATES: Record<GuideCategory, { label: string; color: string }> = {
  fitness: { label: 'Fitness & Allenamento', color: '#06b6d4' },
  business: { label: 'AI & Automazione', color: '#8b5cf6' },
  mindset: { label: 'Mindset & Produttivita', color: '#f59e0b' },
  biohacking: { label: 'Benessere & Performance', color: '#ec4899' },
};

interface GuideFormData {
  title: string;
  slug: string;
  category: GuideCategory;
  description: string;
  short_description: string;
  price: number;
  page_count: number;
  features: string;
  markdown_content: string;
}

const DEFAULT_MARKDOWN = `# Titolo della Guida

## Introduzione

Scrivi qui l'introduzione della guida. Questa sezione serve a catturare l'attenzione del lettore e spiegare cosa trovera nelle prossime pagine.

## Capitolo 1: Primo Argomento

Contenuto del primo capitolo. Usa **grassetto** per evidenziare concetti chiave e *corsivo* per enfasi.

### Sottosezione 1.1

- Punto elenco uno
- Punto elenco due
- Punto elenco tre

### Sottosezione 1.2

1. Primo passo
2. Secondo passo
3. Terzo passo

## Capitolo 2: Secondo Argomento

Contenuto del secondo capitolo...

> Questo e un box di citazione o nota importante.

---

## Conclusioni

Riepilogo e prossimi passi per il lettore.
`;

const DEFAULT_FORM: GuideFormData = {
  title: '',
  slug: '',
  category: 'fitness',
  description: '',
  short_description: '',
  price: 9.00,
  page_count: 35,
  features: '',
  markdown_content: DEFAULT_MARKDOWN,
};

export default function GeneraGuidePage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [form, setForm] = useState<GuideFormData>(DEFAULT_FORM);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; pdfUrl?: string; htmlUrl?: string } | null>(null);
  const [tab, setTab] = useState<'edit' | 'preview' | 'pdf-preview'>('edit');
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [editingGenerated, setEditingGenerated] = useState(false);
  const [versions, setVersions] = useState<Array<{ timestamp: string; title: string; url?: string }>>([]);
  const previewRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (document.cookie.includes('guide_admin_auth=authenticated')) {
      setAuthed(true);
    }
  }, []);

  // Salva/carica bozza da localStorage
  useEffect(() => {
    if (authed) {
      const saved = localStorage.getItem('guide_draft');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setForm(parsed);
        } catch {}
      }
    }
  }, [authed]);

  useEffect(() => {
    if (authed && form.title) {
      const timer = setTimeout(() => {
        localStorage.setItem('guide_draft', JSON.stringify(form));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [form, authed]);

  async function handleLogin() {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) { setAuthed(true); setLoginError(''); }
      else { setLoginError('Password non corretta'); }
    } catch { setLoginError('Errore di connessione'); }
  }

  function autoSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  }

  function updateField(field: keyof GuideFormData, value: string | number) {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'title') updated.slug = autoSlug(value as string);
      return updated;
    });
    // Reset generazione se si modifica il contenuto
    if (field === 'markdown_content' || field === 'title' || field === 'category') {
      setResult(null);
      setGeneratedHtml('');
    }
  }

  function clearDraft() {
    localStorage.removeItem('guide_draft');
    setForm(DEFAULT_FORM);
    setResult(null);
    setGeneratedHtml('');
    setVersions([]);
  }

  // Genera HTML completo per preview PDF-like (lato client)
  function generatePreviewHtml(): string {
    const colors = TEMPLATES[form.category];
    const md = form.markdown_content;

    // Parse markdown
    const lines = md.split('\n');
    let bodyHtml = '';
    const tocItems: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) { bodyHtml += '<div style="height: 8px;"></div>'; continue; }

      if (line.startsWith('### ')) {
        const text = line.replace('### ', '');
        bodyHtml += `<h3 style="color: #475569; font-size: 14px; font-weight: 700; margin: 20px 0 8px; letter-spacing: 0.3px;">${text}</h3>`;
      } else if (line.startsWith('## ')) {
        const text = line.replace('## ', '');
        tocItems.push(text);
        bodyHtml += `<div style="page-break-before: auto; margin-top: 36px;"></div>`;
        bodyHtml += `<h2 style="color: ${colors.color}; font-size: 20px; font-weight: 800; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid ${colors.color}20;">${text}</h2>`;
      } else if (line.startsWith('# ')) {
        const text = line.replace('# ', '');
        bodyHtml += `<h1 style="color: #0f172a; font-size: 28px; font-weight: 800; margin: 40px 0 16px; line-height: 1.2;">${text}</h1>`;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        const text = line.replace(/^[-*] /, '');
        bodyHtml += `<div style="display: flex; align-items: flex-start; margin: 6px 0 6px 12px;"><span style="color: ${colors.color}; margin-right: 10px; font-size: 18px; line-height: 1;">&#8226;</span><span style="color: #334155; font-size: 11px; line-height: 1.7;">${formatInline(text)}</span></div>`;
      } else if (/^\d+\. /.test(line)) {
        const num = line.match(/^(\d+)\./)?.[1] || '1';
        const text = line.replace(/^\d+\. /, '');
        bodyHtml += `<div style="display: flex; align-items: flex-start; margin: 6px 0 6px 12px;"><span style="color: ${colors.color}; margin-right: 10px; font-size: 11px; font-weight: 700; min-width: 20px;">${num}.</span><span style="color: #334155; font-size: 11px; line-height: 1.7;">${formatInline(text)}</span></div>`;
      } else if (line.startsWith('> ')) {
        const text = line.replace('> ', '');
        bodyHtml += `<div style="border-left: 3px solid ${colors.color}; background: ${colors.color}08; padding: 12px 16px; margin: 12px 0; border-radius: 0 6px 6px 0;"><p style="color: #475569; font-size: 11px; line-height: 1.7; margin: 0; font-style: italic;">${formatInline(text)}</p></div>`;
      } else if (line === '---') {
        bodyHtml += `<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px auto; width: 50%;">`;
      } else {
        bodyHtml += `<p style="color: #334155; font-size: 11px; line-height: 1.8; margin: 6px 0; text-align: justify;">${formatInline(line)}</p>`;
      }
    }

    // Sommario
    let tocHtml = '';
    tocItems.forEach((item, i) => {
      tocHtml += `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dotted #e2e8f0;">
        <span style="color: #334155; font-size: 12px;"><span style="color: ${colors.color}; font-weight: 700; margin-right: 12px;">${String(i + 1).padStart(2, '0')}</span>${item}</span>
        <span style="color: #94a3b8; font-size: 11px;">${i + 3}</span>
      </div>`;
    });

    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', -apple-system, Arial, sans-serif; background: #f1f5f9; }
  .page { width: 210mm; min-height: 297mm; margin: 16px auto; background: white; box-shadow: 0 2px 16px rgba(0,0,0,0.12); padding: 28mm 22mm; position: relative; }
  .page-number { position: absolute; bottom: 14mm; right: 22mm; color: #94a3b8; font-size: 10px; }
  .brand { position: absolute; bottom: 14mm; left: 22mm; color: ${colors.color}; font-size: 9px; font-weight: 600; }
  @media print { .page { box-shadow: none; margin: 0; page-break-after: always; } body { background: white; } }
</style>
</head><body>

<!-- COPERTINA -->
<div class="page" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
  <div style="margin-bottom: 20px;">
    <span style="background: ${colors.color}; color: white; padding: 6px 20px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">${TEMPLATES[form.category].label}</span>
  </div>
  <h1 style="font-size: 38px; font-weight: 800; color: #0f172a; margin: 20px 0; line-height: 1.15; max-width: 500px;">${form.title || 'Titolo della Guida'}</h1>
  <div style="width: 60px; height: 3px; background: ${colors.color}; margin: 20px auto;"></div>
  <p style="color: #64748b; font-size: 13px; max-width: 380px; line-height: 1.6;">${form.short_description || 'Guida pratica e completa. Scaricabile e stampabile.'}</p>
  <div style="margin-top: 80px; color: #94a3b8; font-size: 10px;">
    <span style="color: ${colors.color}; font-weight: 700;">GuideDigitali</span> — guidedigitali.vercel.app
  </div>
</div>

<!-- SOMMARIO -->
<div class="page">
  <h2 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 28px;">Sommario</h2>
  ${tocHtml}
  <div class="page-number">2</div>
  <div class="brand">GuideDigitali</div>
</div>

<!-- CONTENUTO -->
<div class="page">
  ${bodyHtml}
  <div class="brand">GuideDigitali</div>
</div>

<!-- ULTIMA PAGINA -->
<div class="page" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
  <div style="width: 60px; height: 3px; background: ${colors.color}; margin-bottom: 24px;"></div>
  <p style="color: ${colors.color}; font-weight: 700; font-size: 16px;">GuideDigitali</p>
  <p style="color: #64748b; font-size: 12px; margin-top: 8px;">guidedigitali.vercel.app</p>
  <p style="color: #94a3b8; font-size: 11px; margin-top: 20px; max-width: 300px; line-height: 1.6;">Scopri tutte le guide su fitness, business, mindset e biohacking.</p>
</div>

</body></html>`;
  }

  function formatInline(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color: #0f172a;">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, `<code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-size: 10px; color: ${TEMPLATES[form.category].color};">$1</code>`);
  }

  // Genera markdown → preview semplice (tab Preview)
  function markdownToPreviewHtml(md: string): string {
    const colors = TEMPLATES[form.category];
    return md
      .replace(/^### (.+)$/gm, `<h3 style="color: #94a3b8; font-size: 15px; font-weight: 700; margin: 16px 0 8px;">$1</h3>`)
      .replace(/^## (.+)$/gm, `<h2 style="color: ${colors.color}; font-size: 19px; font-weight: 700; margin: 24px 0 12px; padding-bottom: 6px; border-bottom: 2px solid ${colors.color}30;">$1</h2>`)
      .replace(/^# (.+)$/gm, '<h1 style="color: #f1f5f9; font-size: 26px; font-weight: 800; margin: 32px 0 16px;">$1</h1>')
      .replace(/^> (.+)$/gm, `<div style="border-left: 3px solid ${colors.color}; padding: 8px 14px; margin: 8px 0; background: ${colors.color}10; border-radius: 0 6px 6px 0;"><span style="color: #cbd5e1; font-size: 13px;">$1</span></div>`)
      .replace(/^- (.+)$/gm, `<div style="display: flex; margin: 3px 0 3px 8px;"><span style="color: ${colors.color}; margin-right: 8px;">&#8226;</span><span style="color: #cbd5e1; font-size: 13px;">$1</span></div>`)
      .replace(/^\d+\. (.+)$/gm, `<div style="margin: 3px 0 3px 8px; color: #cbd5e1; font-size: 13px;">$1</div>`)
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color: #f1f5f9;">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, `<code style="background: #1e293b; padding: 2px 6px; border-radius: 3px; font-size: 12px; color: ${colors.color};">$1</code>`)
      .replace(/^---$/gm, '<hr style="border-color: #334155; margin: 20px 0;">')
      .replace(/\n\n/g, '<div style="height: 12px;"></div>')
      .replace(/\n/g, '<br>');
  }

  async function handleGenerate() {
    if (!form.title || !form.markdown_content) {
      setResult({ success: false, message: 'Inserisci titolo e contenuto' });
      return;
    }

    setGenerating(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
          category: form.category,
          markdown: form.markdown_content,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const html = generatePreviewHtml();
        setGeneratedHtml(html);
        setTab('pdf-preview');
        setVersions(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), title: form.title, url: data.pdfUrl }]);
        setResult({ success: true, message: `Generato v${versions.length + 1} — Controlla l'anteprima, modifica e rigenera se necessario.`, pdfUrl: data.pdfUrl, htmlUrl: data.htmlUrl });
      } else {
        setResult({ success: false, message: data.error || 'Errore generazione' });
      }
    } catch {
      setResult({ success: false, message: 'Errore di connessione' });
    } finally {
      setGenerating(false);
    }
  }

  async function handlePublish() {
    if (!result?.pdfUrl) return;
    setPublishing(true);
    try {
      const res = await fetch('/api/admin/publish-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          features: form.features.split('\n').filter(f => f.trim()),
          pdf_url: result.pdfUrl,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ ...result, success: true, message: `Guida pubblicata sullo store! Vai a /guide/${form.slug}` });
      } else {
        setResult({ success: false, message: data.error || 'Errore pubblicazione' });
      }
    } catch {
      setResult({ success: false, message: 'Errore di connessione' });
    } finally {
      setPublishing(false);
    }
  }

  // --- LOGIN ---
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="bg-[#0a0a1a] border border-[#1a1a2e] rounded-xl p-8 w-full max-w-md">
          <h1 className="text-xl font-bold text-white mb-6 text-center">Admin - Genera Guide</h1>
          <input type="password" placeholder="Password admin" value={password}
            onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 bg-[#111827] border border-[#1f2937] rounded-lg text-white mb-4" />
          {loginError && <p className="text-red-400 text-sm mb-4">{loginError}</p>}
          <button onClick={handleLogin} className="w-full py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-500 transition">Accedi</button>
        </div>
      </div>
    );
  }

  const catConfig = TEMPLATES[form.category];

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      <div className="max-w-[1600px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Generatore Guide PDF</h1>
            <p className="text-gray-400 text-sm mt-1">Crea, anteprima, modifica e pubblica</p>
          </div>
          <div className="flex gap-3 items-center">
            {versions.length > 0 && (
              <span className="text-xs text-gray-500">
                {versions.length} version{versions.length > 1 ? 'i' : 'e'} generata
              </span>
            )}
            <button onClick={clearDraft} className="px-4 py-2 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-400 hover:bg-red-900/50 transition">
              Nuova Guida
            </button>
            <a href="/admin" className="px-4 py-2 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg text-sm hover:bg-[#2a2a3e] transition">
              Dashboard Ordini
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
          {/* LEFT: Form + Actions */}
          <div className="space-y-4">
            {/* Metadata */}
            <div className="bg-[#0a0a1a] border border-[#1a1a2e] rounded-xl p-5">
              <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: catConfig.color }}>Dettagli Guida</h2>
              <div className="space-y-3">
                <input value={form.title} onChange={e => updateField('title', e.target.value)}
                  placeholder="Titolo guida" className="w-full px-3 py-2 bg-[#111827] border border-[#1f2937] rounded-lg text-white text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <input value={form.slug} onChange={e => updateField('slug', e.target.value)}
                    placeholder="slug-auto" className="px-3 py-2 bg-[#111827] border border-[#1f2937] rounded-lg text-gray-400 text-xs" />
                  <select value={form.category} onChange={e => updateField('category', e.target.value)}
                    className="px-3 py-2 bg-[#111827] border border-[#1f2937] rounded-lg text-white text-xs">
                    {Object.entries(TEMPLATES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase">Prezzo EUR</label>
                    <input type="number" step="0.01" value={form.price} onChange={e => updateField('price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-[#111827] border border-[#1f2937] rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase">Pagine</label>
                    <input type="number" value={form.page_count} onChange={e => updateField('page_count', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-[#111827] border border-[#1f2937] rounded-lg text-white text-sm" />
                  </div>
                </div>
                <input value={form.short_description} onChange={e => updateField('short_description', e.target.value)}
                  placeholder="Descrizione breve (card store)" className="w-full px-3 py-2 bg-[#111827] border border-[#1f2937] rounded-lg text-white text-xs" />
                <textarea value={form.description} onChange={e => updateField('description', e.target.value)} rows={2}
                  placeholder="Descrizione completa (landing page)" className="w-full px-3 py-2 bg-[#111827] border border-[#1f2937] rounded-lg text-white text-xs resize-none" />
                <textarea value={form.features} onChange={e => updateField('features', e.target.value)} rows={2}
                  placeholder={"Features (una per riga)\n35+ pagine\nStampabile"} className="w-full px-3 py-2 bg-[#111827] border border-[#1f2937] rounded-lg text-white text-xs resize-none" />
              </div>
            </div>

            {/* Actions */}
            <div className="bg-[#0a0a1a] border border-[#1a1a2e] rounded-xl p-5 space-y-3">
              <button onClick={handleGenerate} disabled={generating || !form.title}
                className="w-full py-3 rounded-lg font-semibold text-sm transition disabled:opacity-50"
                style={{ backgroundColor: catConfig.color }}>
                {generating ? 'Generazione...' : generatedHtml ? 'Rigenera PDF' : 'Genera PDF'}
              </button>

              {result?.pdfUrl && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <a href={result.pdfUrl} target="_blank"
                      className="py-2 text-center bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg text-xs text-cyan-400 hover:bg-[#2a2a3e] transition">
                      Scarica HTML
                    </a>
                    <button onClick={() => { setTab('edit'); }}
                      className="py-2 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg text-xs text-amber-400 hover:bg-[#2a2a3e] transition">
                      Modifica e Rigenera
                    </button>
                  </div>
                  <button onClick={handlePublish} disabled={publishing}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-500 transition disabled:opacity-50">
                    {publishing ? 'Pubblicazione...' : 'Pubblica su Store'}
                  </button>
                </>
              )}

              {result && (
                <div className={`p-3 rounded-lg text-xs ${result.success ? 'bg-green-900/20 text-green-400 border border-green-900' : 'bg-red-900/20 text-red-400 border border-red-900'}`}>
                  {result.message}
                </div>
              )}
            </div>

            {/* Versioni */}
            {versions.length > 0 && (
              <div className="bg-[#0a0a1a] border border-[#1a1a2e] rounded-xl p-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Cronologia Versioni</h3>
                <div className="space-y-2">
                  {versions.map((v, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">v{i + 1} — {v.timestamp}</span>
                      {v.url && (
                        <a href={v.url} target="_blank" className="text-cyan-500 hover:underline">apri</a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Editor / Preview / PDF Preview */}
          <div className="bg-[#0a0a1a] border border-[#1a1a2e] rounded-xl overflow-hidden flex flex-col" style={{ minHeight: '85vh' }}>
            {/* Tabs */}
            <div className="flex border-b border-[#1a1a2e] shrink-0">
              {(['edit', 'preview', 'pdf-preview'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  disabled={t === 'pdf-preview' && !generatedHtml}
                  className={`flex-1 py-3 text-sm font-semibold transition ${
                    tab === t ? 'text-white bg-[#111827]' : 'text-gray-500 hover:text-gray-300 disabled:text-gray-700 disabled:cursor-not-allowed'
                  }`}>
                  {t === 'edit' ? 'Editor' : t === 'preview' ? 'Preview' : 'Anteprima PDF'}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 relative">
              {tab === 'edit' && (
                <textarea
                  value={form.markdown_content}
                  onChange={e => updateField('markdown_content', e.target.value)}
                  className="absolute inset-0 w-full h-full px-5 py-4 bg-[#0d1117] text-gray-300 text-sm font-mono resize-none focus:outline-none leading-relaxed"
                  placeholder="Scrivi in Markdown..."
                  spellCheck={false}
                />
              )}

              {tab === 'preview' && (
                <div className="absolute inset-0 overflow-y-auto px-6 py-5 bg-[#0d1117]"
                  dangerouslySetInnerHTML={{ __html: markdownToPreviewHtml(form.markdown_content) }} />
              )}

              {tab === 'pdf-preview' && generatedHtml && (
                <iframe
                  ref={previewRef}
                  srcDoc={generatedHtml}
                  className="absolute inset-0 w-full h-full border-0"
                  title="Anteprima PDF"
                />
              )}

              {tab === 'pdf-preview' && !generatedHtml && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                  <div className="text-center">
                    <p className="text-lg mb-2">Nessuna anteprima disponibile</p>
                    <p className="text-sm">Clicca "Genera PDF" per creare l'anteprima</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
