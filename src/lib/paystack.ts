declare global {
  interface Window {
    PaystackPop?: { setup: (config: PaystackConfig) => { openIframe: () => void } };
  }
}

interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  subaccount?: string;
  bearer?: 'account' | 'subaccount';
  metadata: Record<string, unknown>;
  callback: (response: { reference: string }) => void;
  onClose: () => void;
}

let scriptPromise: Promise<void> | null = null;

export function loadPaystackScript(): Promise<void> {
  if (window.PaystackPop) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack'));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export function generatePaymentReference() {
  return `PF-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function openPaystackCheckout(config: {
  email: string;
  amountNaira: number;
  invoiceId: string;
  tenantId: string;
  subaccountCode?: string | null;
  metadata?: Record<string, string>;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}) {
  await loadPaystackScript();

  const reference = generatePaymentReference();
  const handler = window.PaystackPop!.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    email: config.email,
    amount: Math.round(config.amountNaira * 100),
    currency: 'NGN',
    ref: reference,
    subaccount: config.subaccountCode ?? undefined,
    bearer: config.subaccountCode ? 'subaccount' : undefined,
    metadata: { invoice_id: config.invoiceId, tenant_id: config.tenantId },
    callback: (response) => config.onSuccess(response.reference),
    onClose: config.onClose,
  });

  handler.openIframe();
}
