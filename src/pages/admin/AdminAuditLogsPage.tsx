import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuditLogs } from '@/features/admin/hooks/useAdmin';

const actionVariant: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  INSERT: 'success',
  UPDATE: 'warning',
  DELETE: 'destructive',
};

const ACTION_FILTERS = ['all', 'INSERT', 'UPDATE', 'DELETE'] as const;

export function AdminAuditLogsPage() {
  const { data: logs, isLoading } = useAuditLogs();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<(typeof ACTION_FILTERS)[number]>('all');

  const filtered = logs?.filter((l) => {
    const matchesSearch =
      l.resource.toLowerCase().includes(search.toLowerCase()) ||
      (l.userEmail ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === 'all' || l.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground">
          Immutable record of sensitive actions across the platform.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by table or user email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          {ACTION_FILTERS.map((action) => (
            <Button
              key={action}
              size="sm"
              variant={actionFilter === action ? 'default' : 'outline'}
              onClick={() => setActionFilter(action)}
              className="capitalize"
            >
              {action === 'all' ? 'All' : action}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="flex max-h-[600px] flex-col divide-y overflow-y-auto">
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
