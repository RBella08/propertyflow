import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSetting } from '../services/settingsService';

export function useSettings() {
  return useQuery({ queryKey: ['system-settings'], queryFn: getSettings });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ settingId, value }: { settingId: string; value: string }) =>
      updateSetting(settingId, value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['system-settings'] }),
  });
}
