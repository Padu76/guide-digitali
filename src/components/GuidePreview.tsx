// E:\guide-digitali\src\components\GuidePreview.tsx
// Mostra anteprima delle prime 2 "pagine" della guida sulla landing page
// Estrae i primi 2 capitoli dalla descrizione/contenuto

'use client';

import { useState } from 'react';

interface GuidePreviewProps {
  description: string;
  title: string;
  color: string;
}

export default function GuidePreview({ description, title, color }: GuidePreviewProps) {
  const [expanded, setExpanded] = useState(false);

  // Prendi le prime ~600 parole dalla descrizione come anteprima
  const previewText = description.slice(0, 1500);
  const hasMore = description.length > 1500;

  if (!description || description.length < 100) return null;

  return (
    <div className="rounded-xl border border-white/5 bg-[#0a0a1a] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Anteprima gratuita</span>
        </div>
      </div>

      {/* Contenuto anteprima — sfondo bianco stampabile */}
      <div className="relative">
        <div
          className={`px-5 py-5 bg-white text-sm leading-relaxed ${expanded ? '' : 'max-h-[400px] overflow-hidden'}`}
          style={{ fontFamily: "'Segoe UI', -apple-system, Arial, sans-serif" }}
        >
          {previewText.split('\n').map((line, i) => {
            const t = line.trim();
            if (!t) return <div key={i} style={{ height: 8 }} />;
            if (t.startsWith('## ')) return <h3 key={i} style={{ color: color || '#06b6d4', fontSize: 16, fontWeight: 700, margin: '16px 0 8px' }}>{t.slice(3)}</h3>;
            if (t.startsWith('# ')) return <h2 key={i} style={{ color: '#0f172a', fontSize: 20, fontWeight: 800, margin: '20px 0 10px' }}>{t.slice(2)}</h2>;
            if (t.startsWith('- ') || t.startsWith('* ')) return (
              <div key={i} style={{ display: 'flex', margin: '3px 0 3px 8px' }}>
                <span style={{ color: color || '#06b6d4', marginRight: 8 }}>&#8226;</span>
                <span style={{ color: '#334155', fontSize: 12, lineHeight: '1.6' }}>{t.slice(2)}</span>
              </div>
            );
            if (t.startsWith('> ')) return (
              <div key={i} style={{ borderLeft: `3px solid ${color || '#06b6d4'}`, background: '#f8fafc', padding: '8px 12px', margin: '8px 0', borderRadius: '0 6px 6px 0' }}>
                <span style={{ color: '#475569', fontSize: 12 }}>{t.slice(2)}</span>
              </div>
            );
            return <p key={i} style={{ color: '#334155', fontSize: 12, lineHeight: '1.7', margin: '4px 0' }}>{t}</p>;
          })}
        </div>

        {/* Gradiente di fade + blur per contenuto bloccato */}
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-32" style={{
            background: 'linear-gradient(transparent, rgba(255,255,255,0.8) 40%, white 70%)',
          }}>
            <div className="absolute bottom-0 left-0 right-0 pb-4 pt-16 flex flex-col items-center">
              <div className="flex items-center gap-1.5 mb-2">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span className="text-xs text-gray-500 font-medium">Contenuto completo disponibile dopo l'acquisto</span>
              </div>
              <button
                onClick={() => setExpanded(true)}
                className="text-xs font-semibold hover:underline transition"
                style={{ color: color || '#06b6d4' }}
              >
                Mostra di piu
              </button>
            </div>
          </div>
        )}

        {expanded && hasMore && (
          <div className="px-5 pb-4 bg-white text-center">
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span className="text-xs text-gray-500">Il resto della guida e disponibile dopo l'acquisto</span>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="text-xs text-gray-400 hover:underline"
              >
                Comprimi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
