// E:\guide-digitali\src\lib\guide-email.ts
// Template email post-acquisto e invio con Resend

import { Resend } from 'resend';
import { OrderItem } from './guide-types';
import { formatPrice } from './guide-utils';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 'placeholder');
}
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'guide@tornoinforma.it';

// Invia email post-acquisto con link download
export async function sendPurchaseEmail(params: {
  to: string;
  items: OrderItem[];
  amount: number;
  downloadUrl: string;
}) {
  const itemsList = params.items
    .map(item => `<li style="padding:4px 0;color:#e5e7eb;">${item.title} - ${formatPrice(item.price)}</li>`)
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050510;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#fff;font-size:28px;margin:0;letter-spacing:-0.5px;">GuideDigitali</h1>
      <p style="color:#6b7280;font-size:14px;margin:8px 0 0;">Il tuo acquisto e confermato</p>
    </div>

    <div style="background:#111827;border:1px solid #1f2937;border-radius:12px;padding:32px;margin-bottom:24px;">
      <h2 style="color:#22d3ee;font-size:18px;margin:0 0 16px;">Grazie per il tuo acquisto!</h2>

      <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Ecco il riepilogo del tuo ordine:
      </p>

      <ul style="list-style:none;padding:0;margin:0 0 20px;">
        ${itemsList}
      </ul>

      <div style="border-top:1px solid #1f2937;padding-top:16px;margin-bottom:24px;">
        <p style="color:#fff;font-size:16px;font-weight:600;margin:0;">
          Totale: ${formatPrice(params.amount)}
        </p>
      </div>

      <div style="text-align:center;">
        <a href="${params.downloadUrl}"
           style="display:inline-block;background:linear-gradient(135deg,#06b6d4,#8b5cf6);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;">
          Scarica le tue guide
        </a>
      </div>

      <p style="color:#6b7280;font-size:12px;text-align:center;margin:16px 0 0;">
        Il link di download e valido per 48 ore e utilizzabile fino a 2 volte.
      </p>
    </div>

    <div style="text-align:center;padding:20px 0;border-top:1px solid #1f2937;">
      <p style="color:#6b7280;font-size:13px;margin:0;">
        Hai bisogno di aiuto? Scrivi a <a href="mailto:andrea.padoan@gmail.com" style="color:#06b6d4;">andrea.padoan@gmail.com</a>
        oppure contattaci su <a href="https://wa.me/393478881515" style="color:#22c55e;">WhatsApp</a>.
      </p>
      <p style="color:#4b5563;font-size:12px;margin:8px 0 0;">
        Guide digitali premium.
      </p>
    </div>

  </div>
</body>
</html>`;

  try {
    const result = await getResend().emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Il tuo ordine GuideDigitali - ${params.items.length} ${params.items.length === 1 ? 'guida' : 'guide'}`,
      html,
    });
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Errore invio email:', error);
    return { success: false, error };
  }
}
