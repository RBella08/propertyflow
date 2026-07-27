import { supabase } from '@/lib/supabase';
import { getLandlordId } from '@/features/properties/services/propertyManagementService';

export type CalendarEventType = 'rent_due' | 'lease_expiry' | 'inspection';

export interface CalendarEvent {
  date: string; // YYYY-MM-DD
  type: CalendarEventType;
  title: string;
}

async function getPropertyIdsForLandlord(profileId: string): Promise<string[]> {
  const landlordId = await getLandlordId(profileId);
  const { data } = await supabase.from('properties').select('id').eq('landlord_id', landlordId);
  return (data ?? []).map((p) => p.id);
}

async function getPropertyIdsForManager(profileId: string): Promise<string[]> {
  const { data } = await supabase.from('properties').select('id').eq('manager_id', profileId);
  return (data ?? []).map((p) => p.id);
}

async function buildEventsForProperties(propertyIds: string[]): Promise<CalendarEvent[]> {
  if (propertyIds.length === 0) return [];

  const events: CalendarEvent[] = [];

  const { data: units } = await supabase
    .from('units')
    .select('id, property_id')
    .in('property_id', propertyIds);
  const unitIds = (units ?? []).map((u) => u.id);

  if (unitIds.length > 0) {
    const { data: leases } = await supabase
      .from('leases')
      .select('id, unit_id, end_date, lease_number')
      .in('unit_id', unitIds)
      .eq('status', 'active');

    (leases ?? []).forEach((l) => {
      events.push({
        date: l.end_date,
        type: 'lease_expiry',
        title: `Lease ${l.lease_number} expires`,
      });
    });

    const leaseIds = (leases ?? []).map((l) => l.id);
    if (leaseIds.length > 0) {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('due_date, invoice_number, status')
        .in('lease_id', leaseIds)
        .in('status', ['pending', 'partial', 'overdue']);

      (invoices ?? []).forEach((i) => {
        events.push({
          date: i.due_date,
          type: 'rent_due',
          title: `Rent due — ${i.invoice_number}`,
        });
      });
    }
  }

  const { data: inspections } = await supabase
    .from('inspections')
    .select('preferred_date, visitor_name')
    .in('property_id', propertyIds)
    .neq('status', 'cancelled');

  (inspections ?? []).forEach((i) => {
    events.push({
      date: i.preferred_date,
      type: 'inspection',
      title: `Inspection — ${i.visitor_name}`,
    });
  });

  return events;
}

export async function getLandlordCalendarEvents(profileId: string): Promise<CalendarEvent[]> {
  const propertyIds = await getPropertyIdsForLandlord(profileId);
  return buildEventsForProperties(propertyIds);
}

export async function getManagerCalendarEvents(profileId: string): Promise<CalendarEvent[]> {
  const propertyIds = await getPropertyIdsForManager(profileId);
  return buildEventsForProperties(propertyIds);
}

export async function getTenantCalendarEvents(tenantId: string): Promise<CalendarEvent[]> {
  const events: CalendarEvent[] = [];

  const { data: leases } = await supabase
    .from('leases')
    .select('id, end_date, lease_number')
    .eq('tenant_id', tenantId)
    .eq('status', 'active');

  (leases ?? []).forEach((l) => {
    events.push({ date: l.end_date, type: 'lease_expiry', title: `Your lease expires` });
  });

  const leaseIds = (leases ?? []).map((l) => l.id);
  if (leaseIds.length > 0) {
    const { data: invoices } = await supabase
      .from('invoices')
      .select('due_date, invoice_number, status')
      .in('lease_id', leaseIds)
      .in('status', ['pending', 'partial', 'overdue']);

    (invoices ?? []).forEach((i) => {
      events.push({ date: i.due_date, type: 'rent_due', title: `Rent due — ${i.invoice_number}` });
    });
  }

  return events;
}
