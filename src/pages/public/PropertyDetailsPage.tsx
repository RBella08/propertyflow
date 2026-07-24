import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { MapPin, Bed, Bath } from 'lucide-react';
import { useProperty } from '@/features/properties/hooks/useProperty';
import { PropertyGallery } from '@/features/properties/components/PropertyGallery';
import { PropertyAmenities } from '@/features/properties/components/PropertyAmenities';
import { ContactManagerDialog } from '@/features/properties/components/ContactManagerDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PropertyDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: property, isLoading, isError } = useProperty(slug);

  const [contactOpen, setContactOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="mb-6 aspect-[21/9] w-full rounded-card" />
        <Skeleton className="mb-2 h-8 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    );
  }

  if (isError || !property) {
    return <NotFoundPage />;
  }

  const availableUnits = property.units.filter((u) => u.status === 'available');

  return (
    <div className="container py-8">
      <PropertyGallery images={property.images} propertyName={property.propertyName} />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-h3 text-foreground">{property.propertyName}</h1>

          <p className="mt-1 flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {property.address}, {property.city}, {property.state}
          </p>

          <div className="mt-6">
            <h2 className="text-h5 text-foreground">About this property</h2>

            <p className="mt-2 text-body text-muted-foreground">
              {property.description ?? 'No description provided yet.'}
            </p>
          </div>

          <div className="mt-6">
            <h2 className="text-h5 text-foreground">Amenities</h2>

            <PropertyAmenities amenities={property.amenities} />
          </div>

          <div className="mt-6">
            <h2 className="text-h5 text-foreground">Available Units</h2>

            <div className="mt-3 flex flex-col gap-3">
              {availableUnits.map((unit) => (
                <Card key={unit.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                    <div className="flex items-center gap-4 text-small text-muted-foreground">
                      <span className="font-medium text-foreground">Unit {unit.unitNumber}</span>

                      <span className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        {unit.bedrooms}
                      </span>

                      <span className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        {unit.bathrooms}
                      </span>
                    </div>

                    <span className="font-semibold text-primary">
                      {formatNaira(unit.rentAmount)}/yr
                    </span>
                  </CardContent>
                </Card>
              ))}

              {availableUnits.length === 0 && (
                <p className="text-muted-foreground">
                  No units currently available in this property.
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent className="flex flex-col gap-4 p-6">
              <Badge variant="secondary" className="w-fit capitalize">
                {property.propertyType}
              </Badge>

              <Button asChild size="lg">
                <Link to={`/inspection/${property.id}`}>Book Inspection</Link>
              </Button>

              <Button variant="outline" size="lg" onClick={() => setContactOpen(true)}>
                Contact Manager
              </Button>

              {property.latitude && property.longitude && (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}#map=16/${property.latitude}/${property.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-small text-primary hover:underline"
                >
                  View on map
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ContactManagerDialog
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        propertyId={property.id}
        propertyName={property.propertyName}
      />
    </div>
  );
}
