import { supabase } from '@/lib/supabase';

interface ContactOwnerInput {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export async function contactPropertyOwner(
  propertyId: string,
  propertyName: string,
  input: ContactOwnerInput
): Promise<void> {
  const { error } = await supabase.from('contact_messages').insert({
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    subject: `Inquiry about ${propertyName}`,
    message: input.message,
  });
  if (error) throw error;

  try {
    await supabase.functions.invoke('notify-property-inquiry', {
      body: {
        propertyId,
        propertyName,
        visitorName: input.name,
        visitorEmail: input.email,
        visitorPhone: input.phone,
        message: input.message,
        kind: 'inquiry',
      },
    });
  } catch (notifyError) {
    console.error('Failed to notify landlord of property inquiry:', notifyError);
  }
}
