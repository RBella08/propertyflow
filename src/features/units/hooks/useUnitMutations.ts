import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUnit, updateUnit } from '../services/unitService';
import type { UnitFormInput } from '../schemas';

export function useCreateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UnitFormInput) => createUnit(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlord-units'] });
      queryClient.invalidateQueries({ queryKey: ['landlord-properties'] });
    },
  });
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ unitId, input }: { unitId: string; input: UnitFormInput }) =>
      updateUnit(unitId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlord-units'] });
      queryClient.invalidateQueries({ queryKey: ['landlord-properties'] });
    },
  });
}
