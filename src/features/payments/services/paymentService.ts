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

export async function getInvoiceSubaccountCode(invoiceId: string): Promise<string | null> {
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('lease_id')
    .eq('id', invoiceId)
    .single();
  if (invoiceError) throw invoiceError;

  const { data: lease, error: leaseError } = await supabase
    .from('leases')
    .select('unit_id')
    .eq('id', invoice.lease_id)
    .single();
  if (leaseError) throw leaseError;

  const { data: unit, error: unitError } = await supabase
    .from('units')
    .select('property_id')
    .eq('id', lease.unit_id)
    .single();
  if (unitError) throw unitError;

  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('landlord_id')
    .eq('id', unit.property_id)
    .single();
  if (propertyError) throw propertyError;

  const { data: landlord, error: landlordError } = await supabase
    .from('landlord_payment_routing')
    .select('subaccount_code')
    .eq('id', property.landlord_id)
    .single();
  if (landlordError) throw landlordError;

  return landlord.subaccount_code;
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

export interface ReceiptItem {
  id: string;
  receiptNumber: string;
  amount: number;
  issuedAt: string;
  reference: string;
  gateway: string;
  propertyName: string;
  unitNumber: string;
  tenantName: string;
}

export async function getReceipts(tenantId: string): Promise<ReceiptItem[]> {
  const { data: rows, error } = await supabase
    .from('receipts')
    .select(
      `id, receipt_number, issued_at,
       payments!inner(amount, reference, gateway, tenant_id, invoice_id)`
    )
    .eq('payments.tenant_id', tenantId)
    .order('issued_at', { ascending: false });

  if (error) throw error;
  if (!rows || rows.length === 0) return [];

  const invoiceIds = Array.from(new Set(rows.map((r: any) => r.payments.invoice_id)));
  const { data: invoices } = invoiceIds.length
    ? await supabase.from('invoices').select('id, lease_id').in('id', invoiceIds)
    : { data: [] as any[] };

  const leaseIds = Array.from(new Set((invoices ?? []).map((i: any) => i.lease_id)));
  const { data: leases } = leaseIds.length
    ? await supabase.from('leases').select('id, unit_id').in('id', leaseIds)
    : { data: [] as any[] };

  const unitIds = Array.from(new Set((leases ?? []).map((l: any) => l.unit_id)));
  const { data: units } = unitIds.length
    ? await supabase
        .from('units')
        .select('id, unit_number, property_id, properties!inner(property_name)')
        .in('id', unitIds)
    : { data: [] as any[] };

  const invoiceLeaseMap = new Map((invoices ?? []).map((i: any) => [i.id, i.lease_id]));
  const leaseUnitMap = new Map((leases ?? []).map((l: any) => [l.id, l.unit_id]));
  const unitMap = new Map((units ?? []).map((u: any) => [u.id, u]));

  const { data: tenantRow } = await supabase
    .from('tenants')
    .select('profiles!inner(full_name, email)')
    .eq('id', tenantId)
    .single();
  const tenantName =
    (tenantRow as any)?.profiles?.full_name ?? (tenantRow as any)?.profiles?.email ?? 'Tenant';

  return rows.map((r: any) => {
    const leaseId = invoiceLeaseMap.get(r.payments.invoice_id);
    const unitId = leaseId ? leaseUnitMap.get(leaseId) : undefined;
    const unit = unitId ? unitMap.get(unitId) : undefined;

    return {
      id: r.id,
      receiptNumber: r.receipt_number,
      amount: r.payments.amount,
      issuedAt: r.issued_at,
      reference: r.payments.reference,
      gateway: r.payments.gateway,
      propertyName: unit?.properties?.property_name ?? 'Unknown',
      unitNumber: unit?.unit_number ?? '-',
      tenantName,
    };
  });
}
