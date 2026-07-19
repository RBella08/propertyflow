import { Link } from 'react-router';
import { Heart, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFavoriteProperties } from '@/features/favorites/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';

export function FavoritesPage() {
  const { isAuthenticated } = useAuth();
  const { data: favorites, isLoading } = useFavoriteProperties();

  if (!isAuthenticated) {
    return (
      <div className="container flex flex-col items-center gap-3 py-24 text-center">
        <Heart className="h-10 w-10 text-muted-foreground" />
        <p className="text-h5 text-foreground">Log in to see your saved properties</p>
        <Button asChild>
          <Link to="/login">Log In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-h3 text-foreground">Favorite Properties</h1>

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((property) => (
            <Link key={property.id} to={`/properties/${property.slug}`}>
              <Card className="overflow-hidden transition-shadow hover:shadow-modal">
                <div className="aspect-video bg-muted">
                  {property.coverImage && (
                    <img
                      src={property.coverImage}
                      alt={property.propertyName}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="font-semibold text-foreground">{property.propertyName}</p>
                  <p className="flex items-center gap-1 text-small text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {property.city}, {property.state}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Heart className="h-10 w-10 text-muted-foreground" />
          <p className="text-h5 text-foreground">No favorites yet</p>
          <p className="text-muted-foreground">
            Browse properties and tap the heart icon to save them here.
          </p>
          <Button asChild>
            <Link to="/properties">Browse Properties</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
