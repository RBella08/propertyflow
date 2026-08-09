import { Fragment } from 'react';
import { Link } from 'react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { MobileSidebar } from './MobileSidebar';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';

export function DashboardHeader() {
  const crumbs = useBreadcrumbs();

  return (
    <header className="flex h-16 items-center gap-2 border-b bg-background px-3 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        <MobileSidebar />
        <div className="min-w-0 flex-1 overflow-x-auto">
          <Breadcrumb>
            <BreadcrumbList className="flex-nowrap whitespace-nowrap">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {crumbs.map((crumb, index) => (
                <Fragment key={crumb.path}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {index === crumbs.length - 1 ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.path}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <ThemeToggle />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
