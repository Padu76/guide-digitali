// E:\guide-digitali\src\app\api\admin\stats\route.ts
// GET — Statistiche vendite (protetto)

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get('guide_admin_auth');
  if (!authCookie || authCookie.value !== 'authenticated') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  try {
    const supabase = getSupabase();

    const { data: orders, error } = await supabase
      .from('guide_orders')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const allOrders = orders || [];
    const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.amount), 0);
    const totalOrders = allOrders.length;
    const totalDownloads = allOrders.filter(o => o.download_used).length;

    const byCategory: Record<string, { revenue: number; orders: number }> = {};
    for (const order of allOrders) {
      const items = order.items as { product_id: string; slug: string; title: string; price: number }[];
      for (const item of items) {
        if (!byCategory['totale']) {
          byCategory['totale'] = { revenue: 0, orders: 0 };
        }
        byCategory['totale'].revenue += item.price;
        byCategory['totale'].orders += 1;
      }
    }

    const recentOrders = allOrders.slice(0, 10);

    return NextResponse.json({
      total_revenue: Math.round(totalRevenue * 100) / 100,
      total_orders: totalOrders,
      total_downloads: totalDownloads,
      by_category: byCategory,
      recent_orders: recentOrders,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Errore server';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
