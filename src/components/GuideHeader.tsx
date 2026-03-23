// E:\guide-digitali\src\components\GuideHeader.tsx
// Header/navbar con logo e carrello

'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';

export default function GuideHeader() {
  const { itemCount, toggleCart } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050510]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              GuideDigitali
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block"
            >
              Catalogo
            </Link>

            <button
              onClick={toggleCart}
              className="relative flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              <span className="text-sm text-gray-300">Carrello</span>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
