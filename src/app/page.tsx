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

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/5">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="text-xs text-gray-400">Soddisfatti o rimborsati 30 giorni</span>
          </div>

          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/5 border border-violet-500/10">
            <span className="text-xs text-violet-400">Acquista 2+ guide e risparmia il 20%</span>
          </div>
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

      <GuideFooter />
    </>
  );
}
