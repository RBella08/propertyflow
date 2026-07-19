import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  getAuditLogs,
} from '../services/adminService';
import type { UserRole } from '@/types/auth';

export function useAdminUsers() {
  return useQuery({ queryKey: ['admin-users'], queryFn: getAllUsers });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'active' | 'suspended' }) =>
      updateUserStatus(userId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      updateUserRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useAuditLogs() {
  return useQuery({ queryKey: ['audit-logs'], queryFn: () => getAuditLogs() });
}
