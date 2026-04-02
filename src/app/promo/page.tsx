// Pagina promo — 1 guida gratuita in cambio dell'email

'use client';

import { useState, useEffect } from 'react';
import { GuideProduct } from '@/lib/guide-types';
import { CATEGORY_CONFIG, formatPrice } from '@/lib/guide-utils';
import GuideHeader from '@/components/GuideHeader';
import GuideFooter from '@/components/GuideFooter';

type Step = 'choose' | 'email' | 'downloading' | 'done' | 'error';

export default function PromoPage() {
  const [products, setProducts] = useState<GuideProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<GuideProduct | null>(null);
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<Step>('choose');
  const [errorMsg, setErrorMsg] = useState('');
  const [downloadToken, setDownloadToken] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => setProducts(data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleSelect(product: GuideProduct) {
    setSelected(product);
    setStep('email');
    setErrorMsg('');
  }

  async function handleClaim() {
    if (!selected || !email) return;
    setStep('downloading');
    setErrorMsg('');

    try {
      // 1. Riscatta la guida
      const claimRes = await fetch('/api/promo/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          product_id: selected.id,
          slug: selected.slug,
        }),
      });

      const claimData = await claimRes.json();
      if (!claimRes.ok) {
        throw new Error(claimData.error || 'Errore');
      }

      setDownloadToken(claimData.download_token);

      // 2. Scarica il file
      const dlRes = await fetch(`/api/promo/download?token=${claimData.download_token}`);
      if (!dlRes.ok) throw new Error('Errore download');

      const blob = await dlRes.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = dlRes.headers.get('x-filename') || `${selected.slug}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStep('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Errore');
      setStep('error');
    }
  }

  return (
    <>
      <GuideHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Offerta Limitata</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
            Scegli la tua guida{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
              gratuita
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-2">
            Seleziona una guida dal nostro catalogo e scaricala gratis.
          </p>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Basta la tua email. Una guida gratuita per persona.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">

        {/* STEP: SCELTA GUIDA */}
        {step === 'choose' && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="rounded-xl border border-white/5 bg-[#0a0a1a] animate-pulse">
                    <div className="aspect-[3/4] bg-gray-800/50" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-800/50 rounded w-3/4" />
                      <div className="h-3 bg-gray-800/50 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => {
                  const config = CATEGORY_CONFIG[product.category];
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleSelect(product)}
                      className="group relative rounded-xl border border-white/5 bg-[#0a0a1a] overflow-hidden transition-all duration-300 hover:border-emerald-500/30 text-left"
                      style={{ boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.15)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 0 0 rgba(16, 185, 129, 0)'; }}
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                        {product.cover_image ? (
                          <img src={product.cover_image} alt={product.title} loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl font-bold text-white/20">{product.title.charAt(0)}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-transparent to-transparent" />
                        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
                          {config.label}
                        </div>
                        {/* Badge GRATIS */}
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-emerald-500 text-white text-[10px] font-bold uppercase">
                          Gratis
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-base font-semibold text-white mb-1 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                          {product.title}
                        </h3>
                        {product.short_description && (
                          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.short_description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 line-through">{formatPrice(product.price)}</span>
                            <span className="text-lg font-bold text-emerald-400">Gratis</span>
                          </div>
                          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-xs text-emerald-400 font-semibold border border-emerald-500/20">
                            Scegli
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* STEP: INSERISCI EMAIL */}
        {step === 'email' && selected && (
          <div className="max-w-md mx-auto text-center">
            <div className="rounded-xl border border-white/5 bg-[#0a0a1a] p-6 mb-6">
              <div className="w-20 h-24 mx-auto rounded-lg overflow-hidden mb-4">
                {selected.cover_image && (
                  <img src={selected.cover_image} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{selected.title}</h3>
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-sm text-gray-500 line-through">{formatPrice(selected.price)}</span>
                <span className="text-lg font-bold text-emerald-400">Gratis</span>
              </div>

              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && email && handleClaim()}
                  placeholder="La tua email"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:border-emerald-500/30 focus:outline-none transition-colors"
                />
                <button
                  onClick={handleClaim}
                  disabled={!email}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
                  style={{ boxShadow: '0 4px 30px rgba(16, 185, 129, 0.3)' }}
                >
                  Scarica gratis
                </button>
              </div>

              <p className="text-[10px] text-gray-600 mt-3">
                Niente spam. Solo contenuti utili, promesso.
              </p>
            </div>

            <button
              onClick={() => { setStep('choose'); setSelected(null); }}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Scegli un&apos;altra guida
            </button>
          </div>
        )}

        {/* STEP: DOWNLOADING */}
        {step === 'downloading' && (
          <div className="max-w-md mx-auto text-center py-12">
            <svg className="w-10 h-10 animate-spin text-emerald-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-400">Download in corso...</p>
          </div>
        )}

        {/* STEP: COMPLETATO */}
        {step === 'done' && selected && (
          <div className="max-w-lg mx-auto text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
                 style={{ boxShadow: '0 0 40px rgba(16, 185, 129, 0.2)' }}>
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Download completato!</h2>
            <p className="text-gray-400 mb-2">
              &quot;{selected.title}&quot; e tua. Controlla la cartella Download.
            </p>
            <p className="text-xs text-gray-500 mb-8">
              Hai ancora 1 download disponibile per questa guida.
            </p>

            {/* CTA verso lo store */}
            <div className="rounded-xl border border-white/5 bg-[#0a0a1a] p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Ti e piaciuta? Scopri le altre guide
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Abbiamo {products.length} guide su fitness, business, mindset e biohacking. Tutte a soli 9 EUR.
              </p>
              <div className="flex items-center justify-center gap-3">
                <a href="/"
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  style={{ boxShadow: '0 4px 30px rgba(6, 182, 212, 0.3)' }}
                >
                  Vai allo store
                </a>
                <a href="/?coupon=WELCOME10"
                  className="px-6 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                >
                  Usa sconto 10%
                </a>
              </div>
            </div>
          </div>
        )}

        {/* STEP: ERRORE */}
        {step === 'error' && (
          <div className="max-w-md mx-auto text-center py-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-red-500/5 border border-red-500/10 text-red-400 mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {errorMsg}
            </div>
            <button
              onClick={() => { setStep('choose'); setSelected(null); setErrorMsg(''); }}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Riprova
            </button>
          </div>
        )}
      </section>

      <GuideFooter />
    </>
  );
}
