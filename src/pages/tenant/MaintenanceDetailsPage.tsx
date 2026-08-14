import { useParams, Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMaintenanceDetail } from '@/features/maintenance/hooks/useMaintenance';
import { MaintenanceStatusTimeline } from '@/features/maintenance/components/MaintenanceStatusTimeline';

export function MaintenanceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useMaintenanceDetail(id);

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-24" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (isError || !data) return <p className="text-destructive">Couldn&apos;t load this request.</p>;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link
        to="/tenant/maintenance"
        className="flex w-fit items-center gap-1 text-small text-muted-foreground transition-colors duration-150 hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Maintenance
      </Link>

      <div>
        <h1 className="text-h4 text-foreground">{data.subject}</h1>
        <p className="text-small capitalize text-muted-foreground">
          {data.category.replace('_', ' ')} · {data.priority} priority · Reported{' '}
          {new Date(data.createdAt).toLocaleDateString()}
        </p>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-6">
          <MaintenanceStatusTimeline status={data.status} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-2 text-h6 text-foreground">Description</h2>
          <p className="text-body text-muted-foreground">{data.description}</p>
        </CardContent>
      </Card>

      {data.images.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-3 text-h6 text-foreground">Photos</h2>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {data.images.map((url, i) => (
                <img key={i} src={url} alt="" className="aspect-square rounded-md object-cover" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
