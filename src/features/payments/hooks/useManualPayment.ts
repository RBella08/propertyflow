import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTenantOutstandingInvoices,
  recordManualPayment,
} from '../services/manualPaymentService';

export function useTenantOutstandingInvoicesForLandlord(tenantId: string | null) {
  return useQuery({
    queryKey: ['tenant-outstanding-invoices', tenantId],
    queryFn: () => getTenantOutstandingInvoices(tenantId as string),
    enabled: !!tenantId,
  });
}

export function useRecordManualPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      invoiceId,
      tenantId,
      amount,
      note,
    }: {
      invoiceId: string;
      tenantId: string;
      amount: number;
      note: string;
    }) => recordManualPayment(invoiceId, tenantId, amount, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-summary-report'] });
      queryClient.invalidateQueries({ queryKey: ['payment-summary-report-manager'] });
      queryClient.invalidateQueries({ queryKey: ['landlord-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
  });
}
