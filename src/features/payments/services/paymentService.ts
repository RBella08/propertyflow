import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export interface OutstandingInvoice {
  id: string;
  invoiceNumber: string;
  balance: number;
  dueDate: string;
  billingPeriod: string;
}

type PaymentStatus = Database['public']['Enums']['payment_status'];

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  reference: string;
  gateway: string;
  status: PaymentStatus;
  paidAt: string | null;
}

export interface ReceiptItem {
  id: string;
  receiptNumber: string;
  amount: number;
  issuedAt: string;
}

export async function getTenantId(profileId: string): Promise<string> {
  const { data, error } = await supabase
    .from('tenants')
    .select('id')
    .eq('profile_id', profileId)
    .single();
  if (error || !data) throw new Error('No tenant record found for this account.');
  return data.id;
}

export async function getOutstandingInvoices(tenantId: string): Promise<OutstandingInvoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, balance, due_date, billing_period, leases!inner(tenant_id)')
    .eq('leases.tenant_id', tenantId)
    .in('status', ['pending', 'partial', 'overdue'])
    .order('due_date');

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    invoiceNumber: row.invoice_number,
    balance: row.balance,
    dueDate: row.due_date,
    billingPeriod: row.billing_period,
  }));
}

export async function verifyPaymentServerSide(
  reference: string
): Promise<{ success: boolean; message?: string }> {
  const { data, error } = await supabase.functions.invoke('verify-payment', {
    body: { reference },
  });
  if (error) throw error;
  return data;
}

export async function getPaymentHistory(tenantId: string): Promise<PaymentHistoryItem[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('id, amount, reference, gateway, status, paid_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((p) => ({
    id: p.id,
    amount: p.amount,
    reference: p.reference,
    gateway: p.gateway,
    status: p.status ?? 'pending',
    paidAt: p.paid_at,
  }));
}

export async function getReceipts(tenantId: string): Promise<ReceiptItem[]> {
  const { data, error } = await supabase
    .from('receipts')
    .select('id, receipt_number, issued_at, payments!inner(amount, tenant_id)')
    .eq('payments.tenant_id', tenantId)
    .order('issued_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    receiptNumber: row.receipt_number,
    amount: row.payments.amount,
    issuedAt: row.issued_at,
  }));
}
