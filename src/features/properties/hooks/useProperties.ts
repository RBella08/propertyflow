import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getProperties, type PropertyFilters } from '../services/propertyService';

export function useProperties(filters: PropertyFilters, page: number, limit = 12) {
  return useQuery({
    queryKey: ['properties', filters, page, limit],
    queryFn: () => getProperties(filters, page, limit),
    placeholderData: keepPreviousData,
  });
}
