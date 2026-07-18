/// <reference lib="deno.ns" />
export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    id: number;
    metadata: { invoice_id?: string; tenant_id?: string };
  };
}

export async function verifyPaystackTransaction(
  reference: string
): Promise<PaystackVerifyResponse> {
  const secretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
  if (!secretKey) throw new Error('PAYSTACK_SECRET_KEY is not configured');

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  if (!response.ok) throw new Error(`Paystack verification request failed: ${response.status}`);
  return response.json();
}

export function generateReceiptNumber() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RCT-${year}-${random}`;
}
