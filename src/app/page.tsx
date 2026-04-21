// E:\guide-digitali\src\app\page.tsx
// Pagina store principale — catalogo guide diviso per categoria

'use client';

import { useState, useEffect } from 'react';
import { GuideProduct, GuideCategory } from '@/lib/guide-types';
import GuideHeader from '@/components/GuideHeader';
import GuideFooter from '@/components/GuideFooter';
import GuideCard from '@/components/GuideCard';
import CategoryFilter from '@/components/CategoryFilter';
import CartDrawer from '@/components/CartDrawer';

export default function GuideStorePage() {
  const [products, setProducts] = useState<GuideProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<GuideCategory | null>(null);

  useEffect(() => {
    // Leggi categoria da URL (?cat=fitness)
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('cat') as GuideCategory | null;
    if (catParam && ['fitness', 'business', 'mindset', 'biohacking', 'alimentazione'].includes(catParam)) {
      setSelectedCategory(catParam);
    }
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (err) {
      console.error('Errore caricamento guide:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  return (
    <>
      <GuideHeader />
      <CartDrawer />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs text-cyan-400 font-medium">Guide Premium Digitali</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
            Cresci con le{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-rose-400 bg-clip-text text-transparent">
              guide giuste
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Contenuti pratici e azionabili in formato PDF.
            Scarica subito dopo il pagamento.
          </p>

        </div>
      </section>

      {/* Catalogo */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mb-8">
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-[#0a0a1a] animate-pulse">
                <div className="aspect-[3/4] bg-gray-800/50" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-800/50 rounded w-3/4" />
                  <div className="h-3 bg-gray-800/50 rounded w-1/2" />
                  <div className="h-8 bg-gray-800/50 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">
              {products.length === 0
                ? 'Nessuna guida disponibile al momento.'
                : 'Nessuna guida in questa categoria.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(product => (
              <GuideCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Chi Sono */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#0a0a1a] to-[#0d0d20] p-8 sm:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">

            {/* Avatar */}
            <div className="shrink-0">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-cyan-500/20">
                AP
              </div>
            </div>

            {/* Testo */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-1">Andrea Padoan</h2>
              <p className="text-cyan-400 text-sm font-medium mb-4">Autore & Creatore di GuideDigitali</p>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xl">
                Imprenditore digitale, appassionato di fitness, nutrizione e crescita personale.
                Creo guide pratiche e azionabili per chi vuole migliorare ogni giorno —
                dal business alla salute, dal mindset all&apos;alimentazione.
              </p>

              {/* Link */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <a
                  href="https://www.andreapadoan.it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:border-white/20 transition-all"
                >
                  <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  andreapadoan.it
                </a>
                <a
                  href="https://www.lifestylelab.it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:border-white/20 transition-all"
                >
                  <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                  LifestyleLab.it
                </a>
                <a
                  href="https://wa.me/393478881515"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-400 hover:bg-green-500/20 transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      <GuideFooter />
    </>
  );
}
