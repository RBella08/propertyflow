import { useState } from 'react';
import { NavLink } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { sidebarNav } from '@/config/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const { role } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!role) return null;
  const items = sidebarNav[role];

  return (
    <aside
      className={cn(
        'hidden shrink-0 border-r bg-secondary text-secondary-foreground transition-all duration-200 md:flex md:flex-col',
        collapsed ? 'md:w-20' : 'md:w-64'
      )}
    >
      <div
        className={cn(
          'flex h-16 items-center px-4',
          collapsed ? 'justify-center' : 'justify-between'
        )}
      >
        {!collapsed && <span className="text-h6 font-bold tracking-tight">PropertyFlow</span>}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-secondary-foreground/70 hover:bg-white/10 hover:text-secondary-foreground"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-small font-medium text-secondary-foreground/80 transition-colors duration-150 hover:bg-white/10 hover:text-secondary-foreground',
                collapsed && 'justify-center px-0',
                isActive &&
                  'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
