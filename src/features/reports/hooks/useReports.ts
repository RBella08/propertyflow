import { useQuery } from '@tanstack/react-query';
import {
  getRevenueReport,
  getOccupancyReport,
  getPaymentSummaryReport,
} from '../services/reportsService';
import { useAuthContext } from '@/providers/AuthProvider';

export function useRevenueReport(startDate: string, endDate: string) {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['revenue-report', profile?.id, startDate, endDate],
    queryFn: () => getRevenueReport(profile!.id, startDate, endDate),
    enabled: !!profile?.id,
  });
}

export function useOccupancyReport() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['occupancy-report', profile?.id],
    queryFn: () => getOccupancyReport(profile!.id),
    enabled: !!profile?.id,
  });
}

export function usePaymentSummaryReport(startDate: string, endDate: string) {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['payment-summary-report', profile?.id, startDate, endDate],
    queryFn: () => getPaymentSummaryReport(profile!.id, startDate, endDate),
    enabled: !!profile?.id,
  });
}
