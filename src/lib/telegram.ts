// Notifiche Telegram per vendite GuideDigitali

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

export async function sendTelegramNotification(message: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Telegram: TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID mancanti');
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Telegram errore:', err);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Telegram errore invio:', err);
    return false;
  }
}

export function formatSaleNotification(params: {
  email: string;
  items: { title: string; price: number }[];
  amount: number;
  coupon?: string | null;
}): string {
  const guideList = params.items.map(i => `  - ${i.title} (${i.price.toFixed(2)} EUR)`).join('\n');

  let msg = `<b>💰 Nuova vendita GuideDigitali!</b>\n\n`;
  msg += `<b>Importo:</b> ${params.amount.toFixed(2)} EUR\n`;
  msg += `<b>Cliente:</b> ${params.email}\n`;
  msg += `<b>Guide:</b>\n${guideList}\n`;
  if (params.coupon) {
    msg += `<b>Coupon:</b> ${params.coupon}\n`;
  }
  msg += `\n<i>${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}</i>`;

  return msg;
}
