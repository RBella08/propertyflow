import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminDashboardStats,
  getAllProperties,
  getAllUnits,
  getAllLeases,
  getAllPayments,
  getAllMaintenance,
  adminSetMaintenanceStatus,
  adminUpdatePaymentStatus,
} from '../services/adminOversightService';

export function useAdminDashboardStats() {
  return useQuery({ queryKey: ['admin-dashboard-stats'], queryFn: getAdminDashboardStats });
}
export function useAdminAllProperties() {
  return useQuery({ queryKey: ['admin-all-properties'], queryFn: getAllProperties });
}
export function useAdminAllUnits() {
  return useQuery({ queryKey: ['admin-all-units'], queryFn: getAllUnits });
}
export function useAdminAllLeases() {
  return useQuery({ queryKey: ['admin-all-leases'], queryFn: getAllLeases });
}
export function useAdminAllPayments() {
  return useQuery({ queryKey: ['admin-all-payments'], queryFn: getAllPayments });
}
export function useAdminAllMaintenance() {
  return useQuery({ queryKey: ['admin-all-maintenance'], queryFn: getAllMaintenance });
}
export function useAdminSetMaintenanceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      status,
    }: {
      requestId: string;
      status: 'submitted' | 'assigned' | 'in_progress' | 'waiting_parts' | 'completed' | 'closed';
    }) => adminSetMaintenanceStatus(requestId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-all-maintenance'] }),
  });
}

export function useAdminUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reference,
      status,
    }: {
      reference: string;
      status: 'pending' | 'processing' | 'successful' | 'failed' | 'refunded';
    }) => adminUpdatePaymentStatus(reference, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    },
  });
}
