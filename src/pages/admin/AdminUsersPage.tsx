import { useState } from 'react';
import { toast } from 'sonner';
import { Ban, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAdminUsers,
  useUpdateUserStatus,
  useUpdateUserRole,
} from '@/features/admin/hooks/useAdmin';
import type { UserRole } from '@/types/auth';

const ROLES: UserRole[] = ['tenant', 'landlord', 'manager', 'admin', 'super_admin'];
const PAGE_SIZE = 10;

export function AdminUsersPage() {
  const { data: users, isLoading } = useAdminUsers();
  const updateStatus = useUpdateUserStatus();
  const updateRole = useUpdateUserRole();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = users?.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = filtered ? Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)) : 1;
  const pageItems = filtered?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await updateStatus.mutateAsync({ userId, status: newStatus });
      toast.success(newStatus === 'suspended' ? 'User suspended' : 'User reactivated');
    } catch {
      toast.error('Could not update user status');
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      await updateRole.mutateAsync({ userId, role });
      toast.success('Role updated');
    } catch {
      toast.error('Could not update role');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Users</h1>
        <p className="text-muted-foreground">Manage every account on the platform.</p>
      </div>

      <Input
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="max-w-sm"
      />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {pageItems?.map((u) => (
              <Card key={u.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-medium text-foreground">{u.fullName}</p>
                    <p className="text-small text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="h-9 rounded-md border border-input bg-background px-2 text-small capitalize"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r} className="capitalize">
                          {r.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                    <Badge
                      variant={u.status === 'active' ? 'success' : 'destructive'}
                      className="capitalize"
                    >
                      {u.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(u.id, u.status)}
                    >
                      {u.status === 'active' ? (
                        <>
                          <Ban className="mr-1.5 h-3.5 w-3.5" /> Suspend
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Reactivate
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filtered && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-center gap-3">
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
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
