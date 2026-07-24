import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePaymentStatus } from '../services/paymentManagementService';

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reference,
      status,
    }: {
      reference: string;
      status: 'pending' | 'processing' | 'successful' | 'failed' | 'refunded';
    }) => updatePaymentStatus(reference, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-summary-report'] });
      queryClient.invalidateQueries({ queryKey: ['payment-summary-report-manager'] });
      queryClient.invalidateQueries({ queryKey: ['landlord-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-payments'] });
    },
  });
}
