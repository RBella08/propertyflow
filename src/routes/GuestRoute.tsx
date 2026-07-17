import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/auth';

const roleDashboardMap: Record<UserRole, string> = {
  tenant: '/tenant/dashboard',
  landlord: '/landlord/dashboard',
  manager: '/manager/dashboard',
  admin: '/admin/dashboard',
  super_admin: '/admin/dashboard',
};

export function GuestRoute() {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated && role) {
    return <Navigate to={roleDashboardMap[role]} replace />;
  }

  return <Outlet />;
}
