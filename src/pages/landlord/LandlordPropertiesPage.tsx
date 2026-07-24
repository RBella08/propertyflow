import { useState } from 'react';
import { Link } from 'react-router';
import { Plus, Pencil, Archive, Trash2, Send, UserCog, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { ArchiveRestore } from 'lucide-react';
import { useUnarchiveProperty } from '@/features/properties/hooks/usePropertyMutations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useLandlordProperties } from '@/features/properties/hooks/useLandlordProperties';
import {
  useArchiveProperty,
  usePublishProperty,
} from '@/features/properties/hooks/usePropertyMutations';

import { DeletePropertyDialog } from '@/features/properties/components/DeletePropertyDialog';
import { AssignManagerDialog } from '@/features/properties/components/AssignManagerDialog';
import { AnnouncementDialog } from '@/features/announcements/components/AnnouncementDialog';
import { useQueryClient } from '@tanstack/react-query';

const statusVariant: Record<string, 'success' | 'secondary' | 'warning'> = {
  active: 'success',
  draft: 'warning',
  archived: 'secondary',
  inactive: 'secondary',
};

const STATUS_FILTERS = ['all', 'active', 'draft', 'archived'] as const;

export function LandlordPropertiesPage() {
  const { data: properties, isLoading } = useLandlordProperties();
  const archiveProperty = useArchiveProperty();
  const publishProperty = usePublishProperty();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [managerTarget, setManagerTarget] = useState<{
    id: string;
    name: string;
    managerId: string | null;
  } | null>(null);
  const [announceTarget, setAnnounceTarget] = useState<{ id: string; name: string } | null>(null);

  const filtered = properties?.filter((p) => {
    const matchesSearch =
      p.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleArchive = async (id: string) => {
    try {
      await archiveProperty.mutateAsync(id);
      toast.success('Property archived');
    } catch {
      toast.error('Could not archive property');
    }
  };

  const unarchiveProperty = useUnarchiveProperty();

  const handleUnarchive = async (id: string) => {
    try {
      await unarchiveProperty.mutateAsync(id);
      toast.success('Property restored to Draft — publish it when ready');
    } catch {
      toast.error('Could not restore property');
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

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          {STATUS_FILTERS.map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((property) => (
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
                    {property.managerId && (
                      <p className="text-caption text-muted-foreground">Manager assigned</p>
                    )}
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
                    <Button
                      size="sm"
                      variant="outline"
                      title="Publish this property so it's visible to the public"
                      onClick={() => handlePublish(property.id)}
                    >
                      <Send className="mr-1.5 h-3.5 w-3.5" /> Publish
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" title="Edit property details" asChild>
                    <Link to={`/landlord/properties/${property.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" title="Add a unit to this property" asChild>
                    <Link to={`/landlord/units/new?propertyId=${property.id}`}>
                      <Plus className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    title="Assign or change estate manager"
                    onClick={() =>
                      setManagerTarget({
                        id: property.id,
                        name: property.propertyName,
                        managerId: property.managerId,
                      })
                    }
                  >
                    <UserCog className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    title="Post an announcement to this property's tenants"
                    onClick={() =>
                      setAnnounceTarget({ id: property.id, name: property.propertyName })
                    }
                  >
                    <Megaphone className="h-4 w-4" />
                  </Button>
                  {property.status !== 'archived' ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Archive — hides from public listings, keeps all data"
                      onClick={() => handleArchive(property.id)}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Restore to Draft"
                      onClick={() => handleUnarchive(property.id)}
                    >
                      <ArchiveRestore className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    title="Delete permanently (only if no units exist)"
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
          <p className="text-h5 text-foreground">No properties match your filters</p>
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

      {managerTarget && (
        <AssignManagerDialog
          open={!!managerTarget}
          onClose={() => setManagerTarget(null)}
          propertyId={managerTarget.id}
          propertyName={managerTarget.name}
          currentManagerId={managerTarget.managerId}
          onAssigned={() => queryClient.invalidateQueries({ queryKey: ['landlord-properties'] })}
        />
      )}

      {announceTarget && (
        <AnnouncementDialog
          open={!!announceTarget}
          onClose={() => setAnnounceTarget(null)}
          propertyId={announceTarget.id}
          propertyName={announceTarget.name}
        />
      )}
    </div>
  );
}
