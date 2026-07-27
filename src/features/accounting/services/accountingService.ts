import { supabase } from '@/lib/supabase';
import { getLandlordId } from '@/features/properties/services/propertyManagementService';

const EXPENSE_CATEGORIES = [
  'maintenance',
  'utilities',
  'insurance',
  'tax',
  'agent_commission',
  'other',
];

export interface PropertyOption {
  id: string;
  propertyName: string;
}

export interface ExpenseInput {
  propertyId: string;
  category: string;
  description: string;
  amount: number;
  expenseDate: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  propertyName: string;
  amount: number;
  runningBalance: number;
}

export interface OwnerStatement {
  propertyName: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  incomeByMonth: { month: string; amount: number }[];
  expensesByCategory: { category: string; amount: number }[];
}

export interface ROIData {
  propertyId: string;
  propertyName: string;
  purchasePrice: number | null;
  purchaseDate: string | null;
  annualIncome: number;
  annualExpenses: number;
  netAnnualIncome: number;
  roiPercentage: number | null;
  grossYieldPercentage: number | null;
}

async function getLandlordPropertyScope(profileId: string) {
  const landlordId = await getLandlordId(profileId);
  const { data: properties } = await supabase
    .from('properties')
    .select('id, property_name, purchase_price, purchase_date')
    .eq('landlord_id', landlordId);
  return properties ?? [];
}

async function getManagerPropertyScope(profileId: string) {
  const { data: properties } = await supabase
    .from('properties')
    .select('id, property_name, purchase_price, purchase_date')
    .eq('manager_id', profileId);
  return properties ?? [];
}

export async function getLandlordPropertyOptionsForAccounting(
  profileId: string
): Promise<PropertyOption[]> {
  const properties = await getLandlordPropertyScope(profileId);
  return properties.map((p) => ({ id: p.id, propertyName: p.property_name }));
}

export async function getManagerPropertyOptionsForAccounting(
  profileId: string
): Promise<PropertyOption[]> {
  const properties = await getManagerPropertyScope(profileId);
  return properties.map((p) => ({ id: p.id, propertyName: p.property_name }));
}

export async function addExpense(profileId: string, input: ExpenseInput): Promise<void> {
  const { error } = await supabase.from('property_expenses').insert({
    property_id: input.propertyId,
    category: input.category,
    description: input.description || null,
    amount: input.amount,
    expense_date: input.expenseDate,
    created_by_profile_id: profileId,
  });
  if (error) throw error;
}

async function getIncomeEntries(propertyIds: string[], startDate: string, endDate: string) {
  if (propertyIds.length === 0) return [];

  const { data: units } = await supabase
    .from('units')
    .select('id, property_id')
    .in('property_id', propertyIds);
  const unitIds = (units ?? []).map((u) => u.id);
  const unitPropertyMap = new Map((units ?? []).map((u) => [u.id, u.property_id]));
  if (unitIds.length === 0) return [];

  const { data: leases } = await supabase
    .from('leases')
    .select('id, unit_id')
    .in('unit_id', unitIds);
  const leaseIds = (leases ?? []).map((l) => l.id);
  const leaseUnitMap = new Map((leases ?? []).map((l) => [l.id, l.unit_id]));
  if (leaseIds.length === 0) return [];

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, lease_id')
    .in('lease_id', leaseIds);
  const invoiceIds = (invoices ?? []).map((i) => i.id);
  const invoiceLeaseMap = new Map((invoices ?? []).map((i) => [i.id, i.lease_id]));
  if (invoiceIds.length === 0) return [];

  const { data: payments } = await supabase
    .from('payments')
    .select('id, amount, paid_at, created_at, invoice_id')
    .in('invoice_id', invoiceIds)
    .eq('status', 'successful')
    .gte('created_at', startDate)
    .lte('created_at', `${endDate}T23:59:59.999`);

  return (payments ?? []).map((p) => {
    const leaseId = invoiceLeaseMap.get(p.invoice_id);
    const unitId = leaseId ? leaseUnitMap.get(leaseId) : undefined;
    const propertyId = unitId ? unitPropertyMap.get(unitId) : undefined;
    return {
      id: p.id,
      date: (p.paid_at ?? p.created_at!).slice(0, 10),
      amount: p.amount,
      propertyId: propertyId ?? '',
    };
  });
}

async function getExpenseEntries(propertyIds: string[], startDate: string, endDate: string) {
  if (propertyIds.length === 0) return [];

  const { data, error } = await supabase
    .from('property_expenses')
    .select('id, category, description, amount, expense_date, property_id')
    .in('property_id', propertyIds)
    .gte('expense_date', startDate)
    .lte('expense_date', endDate);
  if (error) throw error;
  return data ?? [];
}

async function getLedger(
  propertyIds: string[],
  propertyNameMap: Map<string, string>,
  startDate: string,
  endDate: string
): Promise<LedgerEntry[]> {
  const [incomeRows, expenseRows] = await Promise.all([
    getIncomeEntries(propertyIds, startDate, endDate),
    getExpenseEntries(propertyIds, startDate, endDate),
  ]);

  const combined: Omit<LedgerEntry, 'runningBalance'>[] = [
    ...incomeRows.map((r) => ({
      id: r.id,
      date: r.date,
      type: 'income' as const,
      category: 'Rent Payment',
      description: 'Rent payment received',
      propertyName: propertyNameMap.get(r.propertyId) ?? 'Unknown',
      amount: r.amount,
    })),
    ...expenseRows.map((r) => ({
      id: r.id,
      date: r.expense_date,
      type: 'expense' as const,
      category: r.category,
      description: r.description ?? '',
      propertyName: propertyNameMap.get(r.property_id) ?? 'Unknown',
      amount: r.amount,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  let balance = 0;
  const withBalance: LedgerEntry[] = combined.map((entry) => {
    balance += entry.type === 'income' ? entry.amount : -entry.amount;
    return { ...entry, runningBalance: balance };
  });

  return withBalance.reverse();
}

export async function getLandlordLedger(
  profileId: string,
  startDate: string,
  endDate: string
): Promise<LedgerEntry[]> {
  const properties = await getLandlordPropertyScope(profileId);
  const propertyIds = properties.map((p) => p.id);
  const propertyNameMap = new Map(properties.map((p) => [p.id, p.property_name]));
  return getLedger(propertyIds, propertyNameMap, startDate, endDate);
}

export async function getManagerLedger(
  profileId: string,
  startDate: string,
  endDate: string
): Promise<LedgerEntry[]> {
  const properties = await getManagerPropertyScope(profileId);
  const propertyIds = properties.map((p) => p.id);
  const propertyNameMap = new Map(properties.map((p) => [p.id, p.property_name]));
  return getLedger(propertyIds, propertyNameMap, startDate, endDate);
}

export async function getOwnerStatement(
  profileId: string,
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<OwnerStatement> {
  const properties = await getLandlordPropertyScope(profileId);
  const property = properties.find((p) => p.id === propertyId);

  const [incomeRows, expenseRows] = await Promise.all([
    getIncomeEntries([propertyId], startDate, endDate),
    getExpenseEntries([propertyId], startDate, endDate),
  ]);

  const totalIncome = incomeRows.reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = expenseRows.reduce((sum, r) => sum + r.amount, 0);

  const monthMap = new Map<string, number>();
  incomeRows.forEach((r) => {
    const key = new Date(r.date).toLocaleString('en-US', { month: 'short', year: 'numeric' });
    monthMap.set(key, (monthMap.get(key) ?? 0) + r.amount);
  });

  const categoryMap = new Map<string, number>();
  expenseRows.forEach((r) => {
    categoryMap.set(r.category, (categoryMap.get(r.category) ?? 0) + r.amount);
  });

  return {
    propertyName: property?.property_name ?? 'Unknown',
    startDate,
    endDate,
    totalIncome,
    totalExpenses,
    netIncome: totalIncome - totalExpenses,
    incomeByMonth: Array.from(monthMap.entries()).map(([month, amount]) => ({ month, amount })),
    expensesByCategory: Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
    })),
  };
}

export async function updatePropertyInvestment(
  propertyId: string,
  purchasePrice: number,
  purchaseDate: string
): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .update({ purchase_price: purchasePrice, purchase_date: purchaseDate })
    .eq('id', propertyId);
  if (error) throw error;
}

export async function getROIData(profileId: string): Promise<ROIData[]> {
  const properties = await getLandlordPropertyScope(profileId);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const startDate = oneYearAgo.toISOString().slice(0, 10);
  const endDate = new Date().toISOString().slice(0, 10);

  const results: ROIData[] = [];

  for (const property of properties) {
    const [incomeRows, expenseRows] = await Promise.all([
      getIncomeEntries([property.id], startDate, endDate),
      getExpenseEntries([property.id], startDate, endDate),
    ]);

    const annualIncome = incomeRows.reduce((sum, r) => sum + r.amount, 0);
    const annualExpenses = expenseRows.reduce((sum, r) => sum + r.amount, 0);
    const netAnnualIncome = annualIncome - annualExpenses;

    results.push({
      propertyId: property.id,
      propertyName: property.property_name,
      purchasePrice: property.purchase_price,
      purchaseDate: property.purchase_date,
      annualIncome,
      annualExpenses,
      netAnnualIncome,
      roiPercentage: property.purchase_price
        ? Number(((netAnnualIncome / property.purchase_price) * 100).toFixed(2))
        : null,
      grossYieldPercentage: property.purchase_price
        ? Number(((annualIncome / property.purchase_price) * 100).toFixed(2))
        : null,
    });
  }

  return results;
}

export { EXPENSE_CATEGORIES };
