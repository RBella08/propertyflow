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
  const currentCrumb = crumbs[crumbs.length - 1];

  return (
    <header className="flex h-16 items-center gap-2 border-b bg-background px-3 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <MobileSidebar />

        {/* Mobile: collapsed "Home ... Current" only, guaranteed to never overlap */}
        <div className="flex min-w-0 items-center gap-1 text-small text-muted-foreground md:hidden">
          <Link to="/" className="shrink-0 hover:text-foreground">
            Home
          </Link>
          {crumbs.length > 0 && (
            <>
              <span className="shrink-0">›</span>
              <span className="truncate font-medium text-foreground">{currentCrumb?.label}</span>
            </>
          )}
        </div>

        {/* Desktop/tablet: full breadcrumb trail */}
        <div className="hidden min-w-0 md:block">
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
