import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createMaintenanceRequest,
  updateMaintenanceStatus,
  getTenantId,
} from '../services/maintenanceService';
import type { Database } from '@/types/database';
import type { MaintenanceFormInput } from '../schemas';
import { useAuthContext } from '@/providers/AuthProvider';

export function useCreateMaintenanceRequest() {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      input,
      imageFiles,
    }: {
      input: MaintenanceFormInput;
      imageFiles: File[];
    }) => {
      const tenantId = await getTenantId(profile!.id);
      return createMaintenanceRequest(tenantId, input, imageFiles);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-dashboard'] });
    },
  });
}

export function useUpdateMaintenanceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      status,
    }: {
      requestId: string;
      status: Database['public']['Enums']['maintenance_status'];
    }) => updateMaintenanceStatus(requestId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlord-maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-detail'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-maintenance'] });
    },
  });
}
