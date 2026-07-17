import { useState } from 'react';
import { Link } from 'react-router';
import { Plus, Pencil, Archive, Trash2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLandlordProperties } from '@/features/properties/hooks/useLandlordProperties';
import {
  useArchiveProperty,
  usePublishProperty,
} from '@/features/properties/hooks/usePropertyMutations';
import { DeletePropertyDialog } from '@/features/properties/components/DeletePropertyDialog';

const statusVariant: Record<string, 'success' | 'secondary' | 'warning'> = {
  active: 'success',
  draft: 'warning',
  archived: 'secondary',
  inactive: 'secondary',
};

export function LandlordPropertiesPage() {
  const { data: properties, isLoading } = useLandlordProperties();
  const archiveProperty = useArchiveProperty();
  const publishProperty = usePublishProperty();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const handleArchive = async (id: string) => {
    try {
      await archiveProperty.mutateAsync(id);
      toast.success('Property archived');
    } catch {
      toast.error('Could not archive property');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishProperty.mutateAsync(id);
      toast.success('Property published — now visible to the public');
    } catch {
      toast.error('Could not publish property');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h4 text-foreground">Properties</h1>
          <p className="text-muted-foreground">Manage your property portfolio.</p>
        </div>
        <Button asChild>
          <Link to="/landlord/properties/new">
            <Plus className="mr-2 h-4 w-4" /> Add Property
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : properties && properties.length > 0 ? (
        <div className="flex flex-col gap-3">
          {properties.map((property) => (
            <Card key={property.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    {property.coverImage && (
                      <img
                        src={property.coverImage}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{property.propertyName}</p>
                    <p className="text-small text-muted-foreground">
                      {property.city}, {property.state} · {property.totalUnits} unit(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={statusVariant[property.status] ?? 'secondary'}
                    className="capitalize"
                  >
                    {property.status}
                  </Badge>
                  {property.status === 'draft' && (
                    <Button size="sm" variant="outline" onClick={() => handlePublish(property.id)}>
                      <Send className="mr-1.5 h-3.5 w-3.5" /> Publish
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" asChild>
                    <Link to={`/landlord/properties/${property.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <Link to={`/landlord/units/new?propertyId=${property.id}`}>
                      <Plus className="h-4 w-4" />
                    </Link>
                  </Button>
                  {property.status !== 'archived' && (
                    <Button size="sm" variant="ghost" onClick={() => handleArchive(property.id)}>
                      <Archive className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() =>
                      setDeleteTarget({ id: property.id, name: property.propertyName })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-h5 text-foreground">No properties yet</p>
          <p className="text-muted-foreground">Add your first property to get started.</p>
          <Button asChild>
            <Link to="/landlord/properties/new">
              <Plus className="mr-2 h-4 w-4" /> Add Property
            </Link>
          </Button>
        </div>
      )}

      <DeletePropertyDialog
        propertyId={deleteTarget?.id ?? null}
        propertyName={deleteTarget?.name ?? ''}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
