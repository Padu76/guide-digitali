// E:\guide-digitali\src\components\CouponInput.tsx
// Input per codice sconto con validazione

'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';

export default function CouponInput() {
  const { coupon, setCoupon, itemCount } = useCart();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleValidate() {
    if (!code.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase(), item_count: itemCount }),
      });
      const data = await res.json();

      if (data.valid) {
        setCoupon({ code: data.code, discount_percent: data.discount_percent });
      } else {
        setError(data.reason || 'Codice non valido');
      }
    } catch {
      setError('Errore nella validazione');
    } finally {
      setLoading(false);
    }
  }

  if (coupon) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/10">
        <div>
          <p className="text-xs text-green-400 font-medium">Coupon applicato: {coupon.code}</p>
          <p className="text-[10px] text-green-400/60">-{coupon.discount_percent}% di sconto</p>
        </div>
        <button
          onClick={() => { setCoupon(null); setCode(''); }}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors"
        >
          Rimuovi
        </button>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">Codice sconto</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="CODICE"
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:border-cyan-500/30 focus:outline-none transition-colors"
        />
        <button
          onClick={handleValidate}
          disabled={loading || !code.trim()}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 disabled:opacity-50 transition-all"
        >
          {loading ? '...' : 'Applica'}
        </button>
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
