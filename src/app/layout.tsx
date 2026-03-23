// E:\guide-digitali\src\app\layout.tsx
// Root layout con CartProvider

import type { Metadata } from 'next';
import { CartProvider } from '@/components/CartProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'GuideDigitali - Guide Premium per la Crescita',
  description: 'Store di guide digitali premium: fitness, business, mindset e personal branding. Acquista e scarica subito.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <CartProvider>
          <div className="min-h-screen bg-[#050510] text-gray-100">
            {children}
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
