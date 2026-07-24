import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  type ProfileUpdateInput,
} from '../services/profileService';
import { useAuthContext } from '@/providers/AuthProvider';

export function useMyProfile() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: () => getMyProfile(user!.id),
    enabled: !!user?.id,
  });
}

export function useUpdateMyProfile() {
  const { user, profile } = useAuthContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileUpdateInput) => updateMyProfile(profile!.id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-profile', user?.id] }),
  });
}

export function useUploadAvatar() {
  const { user, profile } = useAuthContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadAvatar(profile!.id, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-profile', user?.id] }),
  });
}
