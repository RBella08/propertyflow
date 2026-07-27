import { CalendarView } from '@/features/calendar/components/CalendarView';
import { useManagerCalendarEvents } from '@/features/calendar/hooks/useCalendar';

export function ManagerCalendarPage() {
  const { data: events, isLoading } = useManagerCalendarEvents();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Calendar</h1>
        <p className="text-muted-foreground">
          Rent due dates, lease expiries, and inspections across your assigned properties.
        </p>
      </div>
      <CalendarView events={events} isLoading={isLoading} />
    </div>
  );
}
