// E:\guide-digitali\src\app\api\admin\export\route.ts
// GET — Export CSV ordini completati (protetto)

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

    const header = 'Data,Email,Guide,Importo,Sconto,Coupon,Download Usato\n';
    const rows = (orders || []).map(o => {
      const items = o.items as { title: string }[];
      const titles = items.map(i => i.title).join(' + ');
      const date = new Date(o.created_at).toLocaleDateString('it-IT');
      return `"${date}","${o.email}","${titles}",${o.amount},${o.discount_amount || 0},"${o.coupon_code || ''}",${o.download_used ? 'Si' : 'No'}`;
    }).join('\n');

    const csv = header + rows;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="ordini-guide-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Errore export';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
