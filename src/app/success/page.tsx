// E:\guide-digitali\src\app\success\page.tsx
// Pagina post-acquisto con download automatico

'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import GuideHeader from '@/components/GuideHeader';
import GuideFooter from '@/components/GuideFooter';

function SuccessContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [downloadState, setDownloadState] = useState<'ready' | 'downloading' | 'done' | 'error' | 'expired'>('ready');
  const [errorMsg, setErrorMsg] = useState('');
  const [downloadsRemaining, setDownloadsRemaining] = useState<number | null>(null);

  async function handleDownload() {
    if (!token) return;
    setDownloadState('downloading');

    try {
      const res = await fetch(`/api/download/${token}`);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (res.status === 410 || (data && data.error === 'expired')) {
          setDownloadState('expired');
          setErrorMsg(data?.message || 'Limite download raggiunto o link scaduto.');
          return;
        }
        throw new Error(data?.error || 'Errore download');
      }

      const remaining = res.headers.get('x-downloads-remaining');
      if (remaining !== null) setDownloadsRemaining(parseInt(remaining, 10));

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.headers.get('x-filename') || 'guide.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadState('done');
    } catch (err) {
      setDownloadState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Errore nel download');
    }
  }

  if (!token) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-white mb-4">Link non valido</h1>
        <p className="text-gray-400 mb-6">Token di download mancante.</p>
        <Link href="/" className="text-cyan-400 hover:underline">Torna al catalogo</Link>
      </div>
    );
  }

  return (
    <div className="text-center py-20">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 mb-6"
           style={{ boxShadow: '0 0 40px rgba(34, 197, 94, 0.2)' }}>
        <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-white mb-3">Acquisto completato!</h1>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">
        Grazie per il tuo acquisto. Clicca il bottone qui sotto per scaricare le tue guide.
        Hai a disposizione 2 download.
      </p>

      {downloadState === 'ready' && (
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold hover:opacity-90 transition-opacity"
          style={{ boxShadow: '0 4px 30px rgba(6, 182, 212, 0.3)' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Scarica le tue guide
        </button>
      )}

      {downloadState === 'downloading' && (
        <div className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-white/5 border border-white/10 text-gray-300">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Download in corso...
        </div>
      )}

      {downloadState === 'done' && (
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-500/5 border border-green-500/10 text-green-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Download completato!
          </div>
          <p className="text-xs text-gray-500">
            Controlla la cartella Download del tuo browser.
          </p>
          {downloadsRemaining !== null && downloadsRemaining > 0 && (
            <button
              onClick={() => setDownloadState('ready')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Scarica di nuovo ({downloadsRemaining} {downloadsRemaining === 1 ? 'rimanente' : 'rimanenti'})
            </button>
          )}
        </div>
      )}

      {(downloadState === 'error' || downloadState === 'expired') && (
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-red-500/5 border border-red-500/10 text-red-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {errorMsg}
          </div>
          {downloadState === 'error' && (
            <button
              onClick={() => { setDownloadState('ready'); setErrorMsg(''); }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              Riprova download
            </button>
          )}
          <p className="text-xs text-gray-500">
            Controlla la tua email per il link di download, oppure contattaci per assistenza.
          </p>
        </div>
      )}

      <div className="mt-16 p-6 rounded-xl border border-white/5 bg-[#0a0a1a] max-w-lg mx-auto">
        <h3 className="text-lg font-semibold text-white mb-2">Scopri altri strumenti digitali</h3>
        <p className="text-sm text-gray-400 mb-4">
          Esplora la suite completa di tool AI per professionisti su UtilityLab.
        </p>
        <a
          href="https://utilitylab.it"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-white/10 text-sm text-cyan-400 hover:border-cyan-500/30 transition-all"
        >
          Visita UtilityLab
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>
    </div>
  );
}

export default function GuideSuccessPage() {
  return (
    <>
      <GuideHeader />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="text-center py-20">
            <div className="animate-pulse text-gray-500">Caricamento...</div>
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </main>
      <GuideFooter />
    </>
  );
}
