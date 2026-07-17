import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { PropertyFilters as PropertyFiltersType } from '../services/propertyService';

const PROPERTY_TYPES = ['apartment', 'house', 'duplex', 'bungalow', 'studio', 'office'];
const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];

interface PropertyFiltersProps {
  filters: PropertyFiltersType;
  onChange: (filters: PropertyFiltersType) => void;
}

export function PropertyFilters({ filters, onChange }: PropertyFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-card border bg-card p-4 shadow-card md:flex-row md:flex-wrap md:items-end">
      <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
        <label htmlFor="search" className="text-caption font-medium text-muted-foreground">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Property name..."
            className="pl-9"
            value={filters.search ?? ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="city" className="text-caption font-medium text-muted-foreground">
          City
        </label>
        <Input
          id="city"
          placeholder="e.g. Lagos"
          className="w-full md:w-36"
          value={filters.city ?? ''}
          onChange={(e) => onChange({ ...filters, city: e.target.value || undefined })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="propertyType" className="text-caption font-medium text-muted-foreground">
          Property type
        </label>
        <select
          id="propertyType"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:w-40"
          value={filters.propertyType ?? ''}
          onChange={(e) => onChange({ ...filters, propertyType: e.target.value || undefined })}
        >
          <option value="">Any type</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type} className="capitalize">
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bedrooms" className="text-caption font-medium text-muted-foreground">
          Bedrooms
        </label>
        <select
          id="bedrooms"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:w-32"
          value={filters.bedrooms ?? ''}
          onChange={(e) =>
            onChange({ ...filters, bedrooms: e.target.value ? Number(e.target.value) : undefined })
          }
        >
          <option value="">Any</option>
          {BEDROOM_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}+ bed
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="minPrice" className="text-caption font-medium text-muted-foreground">
          Min price
        </label>
        <Input
          id="minPrice"
          type="number"
          placeholder="₦"
          className="w-full md:w-28"
          value={filters.minPrice ?? ''}
          onChange={(e) =>
            onChange({
              ...filters,
              minPrice: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="maxPrice" className="text-caption font-medium text-muted-foreground">
          Max price
        </label>
        <Input
          id="maxPrice"
          type="number"
          placeholder="₦"
          className="w-full md:w-28"
          value={filters.maxPrice ?? ''}
          onChange={(e) =>
            onChange({
              ...filters,
              maxPrice: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
      </div>

      <Button variant="outline" onClick={() => onChange({})}>
        Clear
      </Button>
    </div>
  );
}
