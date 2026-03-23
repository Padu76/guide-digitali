// E:\guide-digitali\src\lib\guide-utils.ts
// Utility per GuideDigitali store — colori categoria, formattazione

import { GuideCategory } from './guide-types';

// Mappa colori neon per categoria
export const CATEGORY_CONFIG: Record<GuideCategory, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
}> = {
  fitness: {
    label: 'Fitness & Allenamento',
    color: 'cyan',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    gradientFrom: 'from-cyan-500',
    gradientTo: 'to-cyan-700',
    textColor: 'text-cyan-400',
  },
  business: {
    label: 'Business & AI Automation',
    color: 'violet',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    gradientFrom: 'from-violet-500',
    gradientTo: 'to-violet-700',
    textColor: 'text-violet-400',
  },
  mindset: {
    label: 'Mindset & Produttivita',
    color: 'amber',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-amber-700',
    textColor: 'text-amber-400',
  },
  branding: {
    label: 'Personal Branding',
    color: 'rose',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    gradientFrom: 'from-rose-500',
    gradientTo: 'to-rose-700',
    textColor: 'text-rose-400',
  },
};

// Tutte le categorie in ordine
export const ALL_CATEGORIES: GuideCategory[] = ['fitness', 'business', 'mindset', 'branding'];

// Calcola prezzo bundle (-20% per 2+ guide)
export function calculateBundleDiscount(itemCount: number, subtotal: number): number {
  if (itemCount >= 2) {
    return Math.round(subtotal * 0.20 * 100) / 100;
  }
  return 0;
}

// Calcola prezzo totale con sconto coupon
export function calculateTotal(
  subtotal: number,
  bundleDiscount: number,
  couponPercent: number
): number {
  const afterBundle = subtotal - bundleDiscount;
  const couponDiscount = couponPercent > 0 ? Math.round(afterBundle * (couponPercent / 100) * 100) / 100 : 0;
  return Math.max(0, Math.round((afterBundle - couponDiscount) * 100) / 100);
}

// Formatta prezzo in EUR
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

// Formatta data in italiano
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
