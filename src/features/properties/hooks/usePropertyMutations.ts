import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createProperty,
  updateProperty,
  archiveProperty,
  publishProperty,
  deleteProperty,
  getLandlordId,
} from '../services/propertyManagementService';
import { useAuthContext } from '@/providers/AuthProvider';
import type { PropertyFormInput } from '../schemas';

export function useCreateProperty() {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      input,
      imageFiles,
      coverIndex,
    }: {
      input: PropertyFormInput;
      imageFiles: File[];
      coverIndex: number;
    }) => {
      const landlordId = await getLandlordId(profile!.id);
      return createProperty(landlordId, input, imageFiles, coverIndex);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landlord-properties'] }),
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, input }: { propertyId: string; input: PropertyFormInput }) =>
      updateProperty(propertyId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['landlord-properties'] });
      queryClient.invalidateQueries({ queryKey: ['property-edit', variables.propertyId] });
    },
  });
}

export function useArchiveProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (propertyId: string) => archiveProperty(propertyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landlord-properties'] }),
  });
}

export function usePublishProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (propertyId: string) => publishProperty(propertyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landlord-properties'] }),
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (propertyId: string) => deleteProperty(propertyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landlord-properties'] }),
  });
}
