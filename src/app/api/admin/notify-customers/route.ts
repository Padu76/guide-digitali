// Notifica via email tutti i clienti che hanno già acquistato
// POST { guideTitle, guideSlug, guideCategory }

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'guide@tornoinforma.it';

export async function POST(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('guide_admin_auth');
    if (authCookie?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { guideTitle, guideSlug, guideCategory } = await request.json();
    if (!guideTitle || !guideSlug) {
      return NextResponse.json({ error: 'Titolo e slug richiesti' }, { status: 400 });
    }

    // Recupera email da ordini completati + promo claims
    const { data: orders } = await supabase
      .from('guide_orders')
      .select('email')
      .eq('status', 'completed');

    const { data: promoClaims } = await supabase
      .from('guide_promo_claims')
      .select('email');

    // Email uniche da entrambe le fonti
    const emailSet = new Set<string>();
    (orders || []).forEach(o => { if (o.email) emailSet.add(o.email); });
    (promoClaims || []).forEach(p => { if (p.email) emailSet.add(p.email); });
    const emails = Array.from(emailSet);

    if (emails.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'Nessun contatto trovato' });
    }

    const guideUrl = `https://guidedigitali.vercel.app/${guideSlug}`;

    const categoryColors: Record<string, string> = {
      fitness: '#06b6d4',
      business: '#8b5cf6',
      mindset: '#f59e0b',
      biohacking: '#10b981',
      alimentazione: '#22c55e',
    };
    const accentColor = categoryColors[guideCategory] || '#06b6d4';

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050510;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#fff;font-size:28px;margin:0;letter-spacing:-0.5px;">GuideDigitali</h1>
      <p style="color:#6b7280;font-size:14px;margin:8px 0 0;">Nuova guida disponibile!</p>
    </div>

    <div style="background:#111827;border:1px solid #1f2937;border-radius:12px;padding:32px;margin-bottom:24px;">
      <div style="text-align:center;margin-bottom:20px;">
        <span style="background:${accentColor};color:white;padding:6px 16px;border-radius:20px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">${guideCategory}</span>
      </div>

      <h2 style="color:#fff;font-size:22px;text-align:center;margin:0 0 16px;line-height:1.3;">${guideTitle}</h2>

      <p style="color:#9ca3af;font-size:14px;line-height:1.6;text-align:center;margin:0 0 24px;">
        Abbiamo appena pubblicato una nuova guida che potrebbe interessarti. Scoprila subito!
      </p>

      <div style="text-align:center;">
        <a href="${guideUrl}"
           style="display:inline-block;background:linear-gradient(135deg,${accentColor},${accentColor}dd);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;">
          Scopri la guida
        </a>
      </div>
    </div>

    <div style="text-align:center;padding:20px 0;border-top:1px solid #1f2937;">
      <p style="color:#6b7280;font-size:13px;margin:0;">
        Ricevi questa email perche hai gia acquistato su GuideDigitali.
      </p>
      <p style="color:#4b5563;font-size:12px;margin:8px 0 0;">
        <a href="https://guidedigitali.vercel.app" style="color:${accentColor};text-decoration:none;">Visita lo store</a>
      </p>
    </div>

  </div>
</body>
</html>`;

    // Invia email con Resend (batch max 100 per chiamata)
    const resend = new Resend(process.env.RESEND_API_KEY || '');
    let sent = 0;
    let failed = 0;

    // Resend supporta batch fino a 100 destinatari
    const batchSize = 50;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const promises = batch.map(email =>
        resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: `Nuova guida: ${guideTitle}`,
          html,
        }).then(() => { sent++; }).catch(() => { failed++; })
      );
      await Promise.all(promises);
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: emails.length,
    });
  } catch (error: unknown) {
    console.error('Errore notifica clienti:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Errore interno' },
      { status: 500 }
    );
  }
}
