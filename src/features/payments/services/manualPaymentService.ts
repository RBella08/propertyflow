import { supabase } from '@/lib/supabase';

export interface TenantOutstandingInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  balance: number;
  dueDate: string;
  billingPeriod: string;
}

export async function getTenantOutstandingInvoices(
  tenantId: string
): Promise<TenantOutstandingInvoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select(
      'id, invoice_number, amount, balance, due_date, billing_period, leases!inner(tenant_id)'
    )
    .eq('leases.tenant_id', tenantId)
    .in('status', ['pending', 'partial', 'overdue'])
    .order('due_date');

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    invoiceNumber: row.invoice_number,
    amount: row.amount,
    balance: row.balance,
    dueDate: row.due_date,
    billingPeriod: row.billing_period,
  }));
}

function generateManualReference() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CASH-${year}-${random}`;
}

export async function recordManualPayment(
  invoiceId: string,
  tenantId: string,
  amount: number,
  note: string
): Promise<void> {
  const { error } = await supabase.from('payments').insert({
    invoice_id: invoiceId,
    tenant_id: tenantId,
    amount,
    gateway: 'cash',
    reference: generateManualReference(),
    status: 'pending',
    currency: 'NGN',
  });
  if (error) throw error;

  if (note.trim()) {
    console.info(`Manual payment note (not yet persisted to a column): ${note}`);
  }
}
