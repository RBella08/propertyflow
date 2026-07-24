import { supabase } from '@/lib/supabase';
import type { InspectionFormInput } from '../schemas';

export async function createInspection(
  propertyId: string,
  propertyName: string,
  input: InspectionFormInput
): Promise<void> {
  const { error } = await supabase.from('inspections').insert({
    property_id: propertyId,
    visitor_name: input.visitorName,
    visitor_phone: input.phone,
    visitor_email: input.email,
    preferred_date: input.preferredDate,
    preferred_time: input.preferredTime,
    status: 'pending',
    notes: input.notes || null,
  });
  if (error) throw error;

  try {
    await supabase.functions.invoke('notify-property-inquiry', {
      body: {
        propertyId,
        propertyName,
        visitorName: input.visitorName,
        visitorEmail: input.email,
        visitorPhone: input.phone,
        message:
          input.notes ||
          `Requested inspection on ${input.preferredDate} at ${input.preferredTime}.`,
        kind: 'inspection',
      },
    });
  } catch (notifyError) {
    console.error('Failed to notify landlord of inspection request:', notifyError);
  }
}
