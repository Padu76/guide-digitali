// E:\guide-digitali\src\lib\guide-types.ts
// Tipi TypeScript per GuideDigitali store

export type GuideCategory = 'fitness' | 'business' | 'mindset' | 'biohacking' | 'alimentazione';

export interface GuideProduct {
  id: string;
  slug: string;
  title: string;
  category: GuideCategory;
  price: number;
  description: string;
  short_description: string | null;
  pdf_path: string;
  cover_image: string;
  preview_pages: number;
  download_count: number;
  features: string[];
  page_count: number | null;
  active: boolean;
  created_at: string;
}

export interface GuideOrder {
  id: string;
  email: string;
  paypal_order_id: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  download_token: string | null;
  download_count: number;
  download_expires_at: string | null;
  amount: number;
  discount_amount: number;
  coupon_code: string | null;
  items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  slug: string;
  title: string;
  price: number;
}

export interface GuideCoupon {
  id: string;
  code: string;
  discount_percent: number;
  active: boolean;
  uses_remaining: number | null;
  valid_until: string | null;
  created_at: string;
}

export interface CartItem {
  product: GuideProduct;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  coupon: { code: string; discount_percent: number } | null;
}

export interface CheckoutRequest {
  items: { product_id: string; slug: string }[];
  email: string;
  coupon_code?: string;
}

export interface AdminStats {
  total_revenue: number;
  total_orders: number;
  total_downloads: number;
  by_category: Record<GuideCategory, { revenue: number; orders: number }>;
  recent_orders: GuideOrder[];
}
