// E:\guide-digitali\src\components\PayPalCheckout.tsx
// Wrapper per bottoni PayPal con creazione e cattura ordine

'use client';

import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useCart } from './CartProvider';

interface PayPalCheckoutProps {
  email: string;
  total: number;
}

export default function PayPalCheckout({ email, total }: PayPalCheckoutProps) {
  const router = useRouter();
  const { items, coupon, clearCart } = useCart();
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
        <p className="text-xs text-yellow-400">PayPal non configurato. Imposta NEXT_PUBLIC_PAYPAL_CLIENT_ID.</p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{
      clientId,
      currency: 'EUR',
      intent: 'capture',
    }}>
      <div className="rounded-lg overflow-hidden">
        <PayPalButtons
          style={{ layout: 'vertical', color: 'black', shape: 'rect', label: 'pay' }}
          createOrder={async () => {
            const res = await fetch('/api/checkout/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: items.map(i => ({ product_id: i.product.id, slug: i.product.slug })),
                email,
                coupon_code: coupon?.code,
              }),
            });
            const data = await res.json();
            if (!data.paypal_order_id) throw new Error(data.error || 'Errore creazione ordine');
            return data.paypal_order_id;
          }}
          onApprove={async (data) => {
            const res = await fetch('/api/checkout/capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paypal_order_id: data.orderID }),
            });
            const result = await res.json();
            if (result.success && result.download_token) {
              clearCart();
              router.push(`/success?token=${result.download_token}`);
            } else {
              alert(result.error || 'Errore nel pagamento. Contattaci per assistenza.');
            }
          }}
          onError={(err) => {
            console.error('PayPal error:', err);
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}
