import { useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Wallet, FileWarning, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { CalendarEvent, CalendarEventType } from '../services/calendarService';

const EVENT_STYLES: Record<CalendarEventType, { dot: string; icon: typeof Wallet; label: string }> =
  {
    rent_due: { dot: 'bg-primary', icon: Wallet, label: 'Rent Due' },
    lease_expiry: { dot: 'bg-warning', icon: FileWarning, label: 'Lease Expiry' },
    inspection: { dot: 'bg-info', icon: CalendarClock, label: 'Inspection' },
  };

interface CalendarViewProps {
  events: CalendarEvent[] | undefined;
  isLoading: boolean;
}

export function CalendarView({ events, isLoading }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = gridStart;
  while (day <= gridEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const eventsByDate = new Map<string, CalendarEvent[]>();
  (events ?? []).forEach((e) => {
    const key = e.date;
    if (!eventsByDate.has(key)) eventsByDate.set(key, []);
    eventsByDate.get(key)!.push(e);
  });

  const selectedKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedEvents = eventsByDate.get(selectedKey) ?? [];

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-h6 text-foreground">{format(currentMonth, 'MMMM yyyy')}</h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setCurrentMonth(new Date())}>
                Today
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mb-2 grid grid-cols-7 text-center text-caption font-medium text-muted-foreground">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((d) => {
              const key = format(d, 'yyyy-MM-dd');
              const dayEvents = eventsByDate.get(key) ?? [];
              const inMonth = isSameMonth(d, currentMonth);

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(d)}
                  className={cn(
                    'flex h-16 flex-col items-center gap-1 rounded-md border p-1 text-small transition-colors hover:bg-accent sm:h-20',
                    !inMonth && 'opacity-40',
                    isSameDay(d, selectedDate) && 'border-primary bg-primary/5',
                    isToday(d) && !isSameDay(d, selectedDate) && 'border-primary/40'
                  )}
                >
                  <span className={cn('font-medium', isToday(d) && 'text-primary')}>
                    {format(d, 'd')}
                  </span>
                  <div className="flex gap-1">
                    {dayEvents.slice(0, 3).map((e, i) => (
                      <span
                        key={i}
                        className={cn('h-1.5 w-1.5 rounded-full', EVENT_STYLES[e.type].dot)}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="mb-3 font-medium text-foreground">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          {selectedEvents.length > 0 ? (
            <div className="flex flex-col gap-2">
              {selectedEvents.map((e, i) => {
                const style = EVENT_STYLES[e.type];
                return (
                  <div key={i} className="flex items-center gap-3 rounded-md border p-3">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full text-white',
                        style.dot
                      )}
                    >
                      <style.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-small font-medium text-foreground">{e.title}</p>
                      <p className="text-caption text-muted-foreground">{style.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-small text-muted-foreground">No events on this day.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
