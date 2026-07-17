import { Outlet } from 'react-router';
import { Navbar } from '@/components/navigation/Navbar';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-background">
        <div className="container py-8 text-center text-small text-muted-foreground">
          © {new Date().getFullYear()} PropertyFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
