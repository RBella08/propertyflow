import { CalendarView } from '@/features/calendar/components/CalendarView';
import { useLandlordCalendarEvents } from '@/features/calendar/hooks/useCalendar';

export function LandlordCalendarPage() {
  const { data: events, isLoading } = useLandlordCalendarEvents();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Calendar</h1>
        <p className="text-muted-foreground">
          Rent due dates, lease expiries, and inspections across your portfolio.
        </p>
      </div>
      <CalendarView events={events} isLoading={isLoading} />
    </div>
  );
}
