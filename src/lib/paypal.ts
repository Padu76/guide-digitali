// E:\guide-digitali\src\lib\paypal.ts
// Helper server-side per PayPal REST API v2

const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';

// Ottieni access token PayPal
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const res = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth fallita: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

// Crea un ordine PayPal
export async function createPayPalOrder(params: {
  amount: number;
  description: string;
  customId?: string;
}): Promise<{ id: string; status: string }> {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'EUR',
          value: params.amount.toFixed(2),
        },
        description: params.description,
        custom_id: params.customId,
      }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal create order fallita: ${res.status} ${text}`);
  }

  return res.json();
}

// Cattura un ordine PayPal (dopo approvazione utente)
export async function capturePayPalOrder(orderId: string): Promise<{
  id: string;
  status: string;
  payer?: { email_address?: string };
}> {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal capture fallita: ${res.status} ${text}`);
  }

  return res.json();
}
