import { useQuery } from '@tanstack/react-query';
import {
  getTenantId,
  getOutstandingInvoices,
  getPaymentHistory,
  getReceipts,
} from '../services/paymentService';
import { useAuthContext } from '@/providers/AuthProvider';

export function useOutstandingInvoices() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['outstanding-invoices', profile?.id],
    queryFn: async () => getOutstandingInvoices(await getTenantId(profile!.id)),
    enabled: !!profile?.id,
  });
}

export function usePaymentHistory() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['payment-history', profile?.id],
    queryFn: async () => getPaymentHistory(await getTenantId(profile!.id)),
    enabled: !!profile?.id,
  });
}

export function useReceipts() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['receipts', profile?.id],
    queryFn: async () => getReceipts(await getTenantId(profile!.id)),
    enabled: !!profile?.id,
  });
}
