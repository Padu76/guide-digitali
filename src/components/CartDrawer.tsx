// E:\guide-digitali\src\components\CartDrawer.tsx
// Drawer laterale carrello con checkout

'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';
import { formatPrice, calculateBundleDiscount, calculateTotal } from '@/lib/guide-utils';
import { CATEGORY_CONFIG } from '@/lib/guide-utils';
import CouponInput from './CouponInput';
import PayPalCheckout from './PayPalCheckout';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, subtotal, coupon, setCoupon } = useCart();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');

  const bundleDiscount = calculateBundleDiscount(items.length, subtotal);
  const couponPercent = coupon?.discount_percent || 0;
  const total = calculateTotal(subtotal, bundleDiscount, couponPercent);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-[#0a0a1a] border-l border-white/5 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">
            {step === 'cart' ? 'Carrello' : 'Checkout'}
          </h2>
          <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <p className="text-gray-500 text-sm">Il carrello e vuoto</p>
            </div>
          ) : step === 'cart' ? (
            <div className="space-y-3">
              {items.map(({ product }) => {
                const config = CATEGORY_CONFIG[product.category];
                return (
                  <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                    <div className={`w-12 h-16 rounded-md flex-shrink-0 bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo} opacity-30 flex items-center justify-center`}>
                      <span className="text-white/50 text-xs font-bold">{product.title.charAt(0)}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{product.title}</p>
                      <p className={`text-[10px] ${config.textColor}`}>{config.label}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-white">{formatPrice(product.price)}</p>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-[10px] text-gray-500 hover:text-red-400 transition-colors"
                      >
                        Rimuovi
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Email per il download</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="la-tua@email.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:border-cyan-500/30 focus:outline-none transition-colors"
                />
              </div>

              <CouponInput />

              {email && (
                <PayPalCheckout email={email} total={total} />
              )}

              <button
                onClick={() => setStep('cart')}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Torna al carrello
              </button>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-white/5 p-4 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotale ({items.length} {items.length === 1 ? 'guida' : 'guide'})</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {bundleDiscount > 0 && (
                <div className="flex justify-between text-violet-400">
                  <span>Sconto bundle -20%</span>
                  <span>-{formatPrice(bundleDiscount)}</span>
                </div>
              )}

              {coupon && (
                <div className="flex justify-between text-green-400">
                  <span>Coupon {coupon.code} (-{coupon.discount_percent}%)</span>
                  <span>-{formatPrice((subtotal - bundleDiscount) * coupon.discount_percent / 100)}</span>
                </div>
              )}

              <div className="flex justify-between text-white font-semibold pt-1.5 border-t border-white/5">
                <span>Totale</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {step === 'cart' && (
              <button
                onClick={() => setStep('checkout')}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                style={{ boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)' }}
              >
                Procedi al checkout
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
