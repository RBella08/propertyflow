import { CalendarView } from '@/features/calendar/components/CalendarView';
import { useTenantCalendarEvents } from '@/features/calendar/hooks/useCalendar';

export function TenantCalendarPage() {
  const { data: events, isLoading } = useTenantCalendarEvents();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Calendar</h1>
        <p className="text-muted-foreground">Your rent due dates and lease timeline.</p>
      </div>
      <CalendarView events={events} isLoading={isLoading} />
    </div>
  );
}
