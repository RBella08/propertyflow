import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuditLogs } from '@/features/admin/hooks/useAdmin';

const actionVariant: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  INSERT: 'success',
  UPDATE: 'warning',
  DELETE: 'destructive',
};

export function AdminAuditLogsPage() {
  const { data: logs, isLoading } = useAuditLogs();
  const [search, setSearch] = useState('');

  const filtered = logs?.filter(
    (l) =>
      l.resource.toLowerCase().includes(search.toLowerCase()) ||
      (l.userEmail ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground">
          Immutable record of sensitive actions across the platform.
        </p>
      </div>

      <Input
        placeholder="Search by table or user email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col divide-y">
              {filtered?.map((log) => (
                <div key={log.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={actionVariant[log.action] ?? 'secondary'}>{log.action}</Badge>
                      <span className="text-small font-medium capitalize text-foreground">
                        {log.resource.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-caption text-muted-foreground">
                      {log.userEmail ?? 'System'} · {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {filtered?.length === 0 && (
                <p className="p-8 text-center text-muted-foreground">No matching audit logs.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
