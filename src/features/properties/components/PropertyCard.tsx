import type { MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Bed, MapPin, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useFavoriteIds, useToggleFavorite } from '@/features/favorites/hooks/useFavorites';
import type { PropertyListItem } from '../services/propertyService';

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

interface PropertyCardProps {
  property: PropertyListItem;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: favoriteIds } = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();

  const isFavorited = favoriteIds?.includes(property.id) ?? false;

  const handleToggleFavorite = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Log in to save properties');
      navigate('/login');
      return;
    }

    toggleFavorite.mutate(
      { propertyId: property.id, isFavorited },
      {
        onSuccess: () =>
          toast.success(isFavorited ? 'Removed from favorites' : 'Saved to favorites'),
        onError: () => toast.error('Could not update favorites'),
      }
    );
  };

  const priceLabel =
    property.minRent && property.maxRent
      ? property.minRent === property.maxRent
        ? `${formatNaira(property.minRent)}/yr`
        : `${formatNaira(property.minRent)} – ${formatNaira(property.maxRent)}/yr`
      : 'Price on request';

  const bedroomLabel =
    property.minBedrooms !== null && property.maxBedrooms !== null
      ? property.minBedrooms === property.maxBedrooms
        ? `${property.minBedrooms} bed`
        : `${property.minBedrooms}-${property.maxBedrooms} beds`
      : '—';

  return (
    <Card className="group overflow-hidden">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {property.coverImage ? (
          <img
            src={property.coverImage}
            alt={property.propertyName}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        <button
          onClick={handleToggleFavorite}
          disabled={toggleFavorite.isPending}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-card transition-colors hover:text-destructive"
          aria-label={isFavorited ? 'Remove from favorites' : 'Save property'}
        >
          <Heart className={cn('h-4 w-4', isFavorited && 'fill-destructive text-destructive')} />
        </button>
        {property.availableUnits > 0 ? (
          <Badge variant="success" className="absolute left-3 top-3">
            {property.availableUnits} available
          </Badge>
        ) : (
          <Badge variant="secondary" className="absolute left-3 top-3">
            Fully occupied
          </Badge>
        )}
      </div>
      <CardContent className="flex flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-1 text-h6 font-semibold text-foreground">
            {property.propertyName}
          </h3>
          <p className="flex items-center gap-1 text-small text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {property.city}, {property.state}
          </p>
        </div>
        <div className="flex items-center gap-4 text-small text-muted-foreground">
          <span className="flex items-center gap-1">
            <Bed className="h-4 w-4" /> {bedroomLabel}
          </span>
          <span className="capitalize">{property.propertyType}</span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-body font-semibold text-primary">{priceLabel}</span>
          <Button size="sm" asChild>
            <Link to={`/properties/${property.slug}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
