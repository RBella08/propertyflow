import { useState } from 'react';
import { useProperties } from '@/features/properties/hooks/useProperties';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import { PropertyCardSkeleton } from '@/features/properties/components/PropertyCardSkeleton';
import { PropertyFilters } from '@/features/properties/components/PropertyFilters';
import { Button } from '@/components/ui/button';
import type { PropertyFilters as Filters } from '@/features/properties/services/propertyService';

const PAGE_SIZE = 12;

export function PropertyListingsPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, isPlaceholderData } = useProperties(filters, page, PAGE_SIZE);

  const handleFiltersChange = (next: Filters) => {
    setFilters(next);
    setPage(1);
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

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
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)
          : data?.items.map((property) => <PropertyCard key={property.id} property={property} />)}
      </div>

      {!isLoading && data?.items.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-h5 text-foreground">No properties match your search</p>
          <p className="text-muted-foreground">Try adjusting your filters.</p>
        </div>
      )}

      {data && data.total > PAGE_SIZE && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-small text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={isPlaceholderData || page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
