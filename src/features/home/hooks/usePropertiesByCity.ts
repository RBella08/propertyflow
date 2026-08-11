import { useQuery } from '@tanstack/react-query';
import { getPropertiesByCity } from '../services/propertiesByCityService';

export function usePropertiesByCity() {
  return useQuery({ queryKey: ['properties-by-city'], queryFn: getPropertiesByCity });
}
