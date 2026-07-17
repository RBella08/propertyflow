import { useQuery } from '@tanstack/react-query';
import {
  getLandlordId,
  getLandlordProperties,
  type LandlordPropertyListItem,
} from '../services/propertyManagementService';
import { useAuthContext } from '@/providers/AuthProvider';

export function useLandlordProperties() {
  const { profile } = useAuthContext();

  return useQuery<LandlordPropertyListItem[]>({
    queryKey: ['landlord-properties', profile?.id],
    queryFn: async () => {
      const landlordId = await getLandlordId(profile!.id);
      return getLandlordProperties(landlordId);
    },
    enabled: !!profile?.id,
  });
}
