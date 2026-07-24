import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLandlordUnits,
  getLandlordPropertyOptions,
  getManagerPropertyOptions,
  getManagerUnits,
  createUnit,
  updateUnit,
} from '../services/unitService';
import type { UnitFormInput } from '../schemas';
import { useAuthContext } from '@/providers/AuthProvider';

export function useLandlordUnits() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['landlord-units', profile?.id],
    queryFn: () => getLandlordUnits(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useLandlordPropertyOptions() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['landlord-property-options', profile?.id],
    queryFn: () => getLandlordPropertyOptions(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useManagerPropertyOptions() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['manager-property-options', profile?.id],
    queryFn: () => getManagerPropertyOptions(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useManagerUnits() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['manager-units', profile?.id],
    queryFn: () => getManagerUnits(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UnitFormInput) => createUnit(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlord-units'] });
      queryClient.invalidateQueries({ queryKey: ['landlord-property-options'] });
      queryClient.invalidateQueries({ queryKey: ['manager-units'] });
      queryClient.invalidateQueries({ queryKey: ['manager-property-options'] });
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
      queryClient.invalidateQueries({ queryKey: ['manager-units'] });
    },
  });
}
