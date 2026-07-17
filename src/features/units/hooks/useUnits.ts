import { useQuery } from '@tanstack/react-query';
import { getLandlordUnits, getLandlordPropertyOptions } from '../services/unitService';
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
