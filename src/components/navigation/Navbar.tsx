import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from './UserMenu';
import { NotificationBell } from './NotificationBell';
import { publicNav } from '@/config/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="text-h6 font-bold text-primary">
          PropertyFlow
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {publicNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'text-small font-medium text-muted-foreground transition-colors hover:text-foreground',
                  isActive && 'text-foreground'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>PropertyFlow</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-4">
              {publicNav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setMobileOpen(false)}
                  className="text-body font-medium text-foreground"
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Button variant="outline" asChild onClick={() => setMobileOpen(false)}>
                      <Link to="/favorites">My Favorites</Link>
                    </Button>
                    <Button asChild onClick={() => setMobileOpen(false)}>
                      <Link to="/profile">My Profile</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild onClick={() => setMobileOpen(false)}>
                      <Link to="/login">Log in</Link>
                    </Button>
                    <Button asChild onClick={() => setMobileOpen(false)}>
                      <Link to="/register">Register</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
