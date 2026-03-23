// E:\guide-digitali\src\app\[slug]\page.tsx
// Landing page dedicata per singola guida

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { GuideProduct } from '@/lib/guide-types';
import { CATEGORY_CONFIG, formatPrice } from '@/lib/guide-utils';
import GuideHeader from '@/components/GuideHeader';
import GuideFooter from '@/components/GuideFooter';
import CartDrawer from '@/components/CartDrawer';
import { useCart } from '@/components/CartProvider';
import GuidePreview from '@/components/GuidePreview';

export default function GuideDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<GuideProduct | null>(null);
  const [related, setRelated] = useState<GuideProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, removeItem, items } = useCart();

  useEffect(() => {
    if (slug) fetchProduct();
  }, [slug]);

  async function fetchProduct() {
    try {
      const res = await fetch(`/api/products?slug=${slug}`);
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        const p = data.products[0];
        setProduct(p);
        const relRes = await fetch(`/api/products?category=${p.category}`);
        const relData = await relRes.json();
        if (relData.products) {
          setRelated(relData.products.filter((r: GuideProduct) => r.id !== p.id).slice(0, 3));
        }
      }
    } catch (err) {
      console.error('Errore caricamento guida:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <GuideHeader />
        <div className="mx-auto max-w-4xl px-4 py-20">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-800/50 rounded w-3/4" />
            <div className="h-96 bg-gray-800/50 rounded-xl" />
            <div className="h-4 bg-gray-800/50 rounded w-1/2" />
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <GuideHeader />
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Guida non trovata</h1>
          <Link href="/" className="text-cyan-400 hover:underline">
            Torna al catalogo
          </Link>
        </div>
        <GuideFooter />
      </>
    );
  }

  function renderDescription(text: string): string {
    // Prendi solo i primi 800 caratteri per la descrizione, pulisci markdown
    const clean = text.slice(0, 800)
      .replace(/^#{1,4}\s+.+$/gm, '') // rimuovi heading markdown
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^>\s+(.+)$/gm, '<span class="text-cyan-400">$1</span>')
      .replace(/^[-*]\s+(.+)$/gm, '<span class="block ml-2">&#8226; $1</span>')
      .replace(/\n\n+/g, '<br><br>')
      .replace(/\n/g, '<br>')
      .trim();
    // Tronca alla fine di una frase
    const lastDot = clean.lastIndexOf('.');
    return lastDot > 200 ? clean.slice(0, lastDot + 1) : clean;
  }

  const config = CATEGORY_CONFIG[product.category];
  const isInCart = items.some(item => item.product.id === product.id);
  const features: string[] = Array.isArray(product.features) ? product.features : [];

  return (
    <>
      <GuideHeader />
      <CartDrawer />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <nav className="mb-8 text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors">
            Catalogo
          </Link>
          <span className="text-gray-600 mx-2">/</span>
          <span className={config.textColor}>{config.label}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="relative">
            <div className="sticky top-24 space-y-6">
              {/* Cover */}
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/5"
                   style={{ boxShadow: `0 0 60px ${config.glowColor}` }}>
                {product.cover_image ? (
                  <img
                    src={product.cover_image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo} opacity-30 flex items-center justify-center`}>
                    <span className="text-8xl font-bold text-white/20">{product.title.charAt(0)}</span>
                  </div>
                )}
              </div>

              {/* Anteprima prime pagine */}
              <GuidePreview description={product.description} title={product.title} color={config.glowColor} slug={product.slug} pdfPath={product.pdf_path} />
            </div>
          </div>

          <div>
            <div className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${config.bgColor} ${config.textColor} border ${config.borderColor} mb-4`}>
              {config.label}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
              {product.title}
            </h1>

            <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
              {product.page_count && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  {product.page_count} pagine
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {product.download_count} download
              </span>
              <span>PDF</span>
            </div>

            <div className="prose prose-invert prose-sm max-w-none mb-8">
              <div className="text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderDescription(product.description) }} />
            </div>

            {features.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Cosa troverai</h3>
                <ul className="space-y-2">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-400">
                      <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-6 rounded-xl border border-white/5 bg-[#0a0a1a]">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <span className="text-3xl font-bold text-white">{formatPrice(product.price)}</span>
                  <span className="text-sm text-gray-500 ml-2">IVA inclusa</span>
                </div>
              </div>

              <button
                onClick={() => isInCart ? removeItem(product.id) : addItem(product)}
                className={`w-full py-3 rounded-lg text-sm font-semibold transition-all ${
                  isInCart
                    ? 'bg-white/5 text-gray-400 border border-white/10 hover:bg-red-500/10 hover:text-red-400'
                    : `bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white hover:opacity-90 shadow-lg`
                }`}
                style={!isInCart ? { boxShadow: `0 4px 20px ${config.glowColor}` } : undefined}
              >
                {isInCart ? 'Rimuovi dal carrello' : 'Aggiungi al carrello'}
              </button>

              <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  Garanzia 30 giorni
                </span>
                <span>Download immediato</span>
                <span>Pagamento sicuro</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-violet-500/5 border border-violet-500/10 text-center">
              <p className="text-xs text-violet-400">
                Acquista 2 o piu guide e risparmia il 20% automaticamente
              </p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-xl font-bold text-white mb-6">Altre guide {config.label}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map(r => (
                <Link key={r.id} href={`/${r.slug}`}
                      className="group rounded-xl border border-white/5 bg-[#0a0a1a] p-4 hover:border-white/10 transition-all">
                  <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors mb-1">
                    {r.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{r.short_description}</p>
                  <span className="text-sm font-bold text-white">{formatPrice(r.price)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <GuideFooter />
    </>
  );
}
