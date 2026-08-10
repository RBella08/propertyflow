import { useQuery } from '@tanstack/react-query';
import { getPropertiesByCity } from '@/features/properties/services/propertyService';

export function usePropertiesByCity() {
  return useQuery({ queryKey: ['properties-by-city'], queryFn: getPropertiesByCity });
}
