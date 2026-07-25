import { useMutation, useQueryClient } from '@tanstack/react-query';
import { importRows, type ParsedRow, type ImportRowResult } from '../services/bulkImportService';
import { useAuthContext } from '@/providers/AuthProvider';

export function useBulkImport() {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation<ImportRowResult[], Error, ParsedRow[]>({
    mutationFn: (rows) => importRows(profile!.id, rows),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlord-properties'] });
      queryClient.invalidateQueries({ queryKey: ['landlord-units'] });
    },
  });
}
