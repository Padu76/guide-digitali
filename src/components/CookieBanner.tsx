'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  }

  function reject() {
    localStorage.setItem('cookie_consent', 'rejected');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-4xl mx-auto bg-[#111827] border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-2xl">
        <div className="flex-1">
          <p className="text-sm text-gray-300">
            Questo sito utilizza cookie tecnici necessari al funzionamento. Nessun cookie di profilazione.
            Per maggiori informazioni consulta la nostra{' '}
            <a href="/cookie-policy" className="text-cyan-400 underline hover:text-cyan-300">Cookie Policy</a> e la{' '}
            <a href="/privacy" className="text-cyan-400 underline hover:text-cyan-300">Privacy Policy</a>.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={reject}
            className="px-4 py-2 rounded-lg text-sm text-gray-400 border border-white/10 hover:bg-white/5 transition"
          >
            Rifiuta
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 rounded-lg text-sm text-white bg-cyan-600 hover:bg-cyan-500 transition font-medium"
          >
            Accetta
          </button>
        </div>
      </div>
    </div>
  );
}
