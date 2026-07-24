import { supabase } from '@/lib/supabase';

export interface Bank {
  name: string;
  code: string;
}

export interface LandlordPayoutInfo {
  bankName: string | null;
  bankAccountNumber: string | null;
  accountName: string | null;
  subaccountCode: string | null;
  commissionPercentage: number;
}

export async function getBanks(): Promise<Bank[]> {
  const { data, error } = await supabase.functions.invoke('paystack-banks');
  if (error) throw error;
  if (!data.success) throw new Error(data.message);
  return (data.banks as any[]).map((b) => ({ name: b.name, code: b.code }));
}

export async function resolveAccountName(accountNumber: string, bankCode: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('resolve-bank-account', {
    body: { accountNumber, bankCode },
  });
  if (error) throw error;
  if (!data.success) throw new Error(data.message);
  return data.accountName;
}

export async function createSubaccount(input: {
  businessName: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}): Promise<string> {
  const { data, error } = await supabase.functions.invoke('create-paystack-subaccount', {
    body: input,
  });
  if (error) throw error;
  if (!data.success) throw new Error(data.message);
  return data.subaccountCode;
}

export async function getMyPayoutInfo(profileId: string): Promise<LandlordPayoutInfo> {
  const { data, error } = await supabase
    .from('landlords')
    .select('bank_name, bank_account_number, account_name, subaccount_code, commission_percentage')
    .eq('profile_id', profileId)
    .single();
  if (error) throw error;

  return {
    bankName: data.bank_name,
    bankAccountNumber: data.bank_account_number,
    accountName: data.account_name,
    subaccountCode: data.subaccount_code,
    commissionPercentage: data.commission_percentage ?? 10,
  };
}
