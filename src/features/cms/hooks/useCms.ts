import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCmsPages, getCmsPageBySlug, updateCmsPage } from '../services/cmsService';

export function useCmsPages() {
  return useQuery({ queryKey: ['cms-pages'], queryFn: getCmsPages });
}

export function useCmsPage(slug: string | undefined) {
  return useQuery({
    queryKey: ['cms-page', slug],
    queryFn: () => getCmsPageBySlug(slug as string),
    enabled: !!slug,
  });
}

export function useUpdateCmsPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      pageId,
      updates,
    }: {
      pageId: string;
      updates: { title: string; content: string; metaDescription: string; published: boolean };
    }) => updateCmsPage(pageId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      queryClient.invalidateQueries({ queryKey: ['cms-page'] });
    },
  });
}
