import { useQuery } from '@tanstack/react-query';
import { getPropertyBySlug } from '../services/propertyService';

export function useProperty(slug: string | undefined) {
  return useQuery({
    queryKey: ['property', slug],
    queryFn: () => getPropertyBySlug(slug as string),
    enabled: !!slug,
  });
}
