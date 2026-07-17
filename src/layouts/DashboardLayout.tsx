import { Outlet } from 'react-router';
import { Sidebar } from '@/components/navigation/Sidebar';
import { DashboardHeader } from '@/components/navigation/DashboardHeader';

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
        <footer className="border-t bg-background px-6 py-4 text-caption text-muted-foreground">
          © {new Date().getFullYear()} PropertyFlow
        </footer>
      </div>
    </div>
  );
}
