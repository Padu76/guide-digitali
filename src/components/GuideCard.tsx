// E:\guide-digitali\src\components\GuideCard.tsx
// Card singola guida nel catalogo con stile cyberpunk

'use client';

import Link from 'next/link';
import { GuideProduct } from '@/lib/guide-types';
import { CATEGORY_CONFIG, formatPrice } from '@/lib/guide-utils';
import { useCart } from './CartProvider';

interface GuideCardProps {
  product: GuideProduct;
}

export default function GuideCard({ product }: GuideCardProps) {
  const { addItem, removeItem, items } = useCart();
  const config = CATEGORY_CONFIG[product.category];
  const isInCart = items.some(item => item.product.id === product.id);

  return (
    <div className="group relative rounded-xl border border-white/5 bg-[#0a0a1a] overflow-hidden transition-all duration-300 hover:border-white/10"
         style={{ boxShadow: `0 0 0 0 ${config.glowColor}` }}
         onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 30px ${config.glowColor}`; }}
         onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 0 0 ${config.glowColor}`; }}
    >
      <Link href={`/${product.slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
          {product.cover_image ? (
            <img
              src={product.cover_image}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo} opacity-20 flex items-center justify-center`}>
              <span className="text-6xl font-bold text-white/20">{product.title.charAt(0)}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-transparent to-transparent" />

          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
            {config.label}
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="text-[10px] text-gray-400">{product.download_count}</span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/${product.slug}`}>
          <h3 className="text-base font-semibold text-white mb-1 line-clamp-2 group-hover:text-cyan-400 transition-colors">
            {product.title}
          </h3>
        </Link>

        {product.short_description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
            {product.short_description}
          </p>
        )}

        {product.page_count && (
          <p className="text-[10px] text-gray-600 mb-3">
            {product.page_count} pagine
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-white">
            {formatPrice(product.price)}
          </span>

          <button
            onClick={() => isInCart ? removeItem(product.id) : addItem(product)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isInCart
                ? 'bg-white/5 text-gray-400 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                : `bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white hover:opacity-90`
            }`}
          >
            {isInCart ? 'Rimuovi' : 'Aggiungi'}
          </button>
        </div>
      </div>
    </div>
  );
}
