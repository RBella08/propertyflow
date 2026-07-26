import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createProperty,
  updateProperty,
  archiveProperty,
  publishProperty,
  deleteProperty,
  getLandlordId,
  unarchiveProperty,
  addPropertyImages,
  getPropertyImages,
  setPropertyCoverImage,
  deletePropertyImage,
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

export function useUnarchiveProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (propertyId: string) => unarchiveProperty(propertyId),
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

export function useAddPropertyImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, files }: { propertyId: string; files: File[] }) =>
      addPropertyImages(propertyId, files),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property-images', variables.propertyId] });
      queryClient.invalidateQueries({ queryKey: ['landlord-properties'] });
    },
  });
}

export function usePropertyImages(propertyId: string) {
  return useQuery({
    queryKey: ['property-images', propertyId],
    queryFn: () => getPropertyImages(propertyId),
    enabled: !!propertyId,
  });
}

export function useSetCoverImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId,
      imageId,
      imageUrl,
    }: {
      propertyId: string;
      imageId: string;
      imageUrl: string;
    }) => setPropertyCoverImage(propertyId, imageId, imageUrl),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property-images', variables.propertyId] });
      queryClient.invalidateQueries({ queryKey: ['landlord-properties'] });
    },
  });
}

export function useDeletePropertyImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ imageId }: { imageId: string; propertyId: string }) =>
      deletePropertyImage(imageId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property-images', variables.propertyId] });
    },
  });
}
