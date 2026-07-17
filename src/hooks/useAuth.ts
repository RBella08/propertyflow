import { useAuthContext } from '@/providers/AuthProvider';

export function useAuth() {
  const { isAuthenticated, role, isLoading } = useAuthContext();
  return { isAuthenticated, role, isLoading };
}
