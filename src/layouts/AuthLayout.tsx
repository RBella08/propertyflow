import { Outlet } from 'react-router';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-h4 font-bold text-primary">PropertyFlow</span>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
