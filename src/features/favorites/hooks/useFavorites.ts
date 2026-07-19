import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFavoriteIds,
  addFavorite,
  removeFavorite,
  getFavoriteProperties,
} from '../services/favoritesService';
import { useAuthContext } from '@/providers/AuthProvider';

export function useFavoriteIds() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['favorite-ids', profile?.id],
    queryFn: () => getFavoriteIds(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useFavoriteProperties() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['favorite-properties', profile?.id],
    queryFn: () => getFavoriteProperties(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useToggleFavorite() {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      propertyId,
      isFavorited,
    }: {
      propertyId: string;
      isFavorited: boolean;
    }) => {
      if (!profile) throw new Error('Not logged in');
      if (isFavorited) {
        await removeFavorite(profile.id, propertyId);
      } else {
        await addFavorite(profile.id, propertyId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-ids', profile?.id] });
      queryClient.invalidateQueries({ queryKey: ['favorite-properties', profile?.id] });
    },
  });
}
