import { useState, useEffect } from 'react';
import { useProperties } from '@/features/properties/hooks/useProperties';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import { PropertyCardSkeleton } from '@/features/properties/components/PropertyCardSkeleton';
import { PropertyFilters } from '@/features/properties/components/PropertyFilters';
import { Button } from '@/components/ui/button';
import type {
  PropertyFilters as Filters,
  PropertyListItem,
} from '@/features/properties/services/propertyService';

const PAGE_SIZE = 9;

export function PropertyListingsPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<PropertyListItem[]>([]);

  const { data, isLoading, isError, isFetching } = useProperties(filters, page, PAGE_SIZE);

  // Reset accumulated results whenever filters change (new search)
  useEffect(() => {
    setPage(1);
    setAccumulated([]);
  }, [filters]);

  // Append each new page's results rather than replacing them
  useEffect(() => {
    if (!data) return;
    setAccumulated((prev) => (page === 1 ? data.items : [...prev, ...data.items]));
  }, [data, page]);

  const handleFiltersChange = (next: Filters) => setFilters(next);

  const hasMore = data ? accumulated.length < data.total : false;

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-h3 text-foreground">Find your next home</h1>
        <p className="text-muted-foreground">Browse verified rental properties across Nigeria.</p>
      </div>

      <div className="mb-6">
        <PropertyFilters filters={filters} onChange={handleFiltersChange} />
      </div>

      {isError && (
        <p className="text-destructive">
          Something went wrong loading properties. Please try again.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {accumulated.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
        {isLoading &&
          page === 1 &&
          Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
      </div>

      {!isLoading && accumulated.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-h5 text-foreground">No properties match your search</p>
          <p className="text-muted-foreground">Try adjusting your filters.</p>
        </div>
      )}

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline" loading={isFetching} onClick={() => setPage((p) => p + 1)}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
