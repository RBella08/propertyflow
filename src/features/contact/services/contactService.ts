import { supabase } from '@/lib/supabase';
import type { ContactInput } from '../schemas';

export async function submitContactMessage(input: ContactInput): Promise<void> {
  const { error } = await supabase.from('contact_messages').insert({
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    subject: input.subject,
    message: input.message,
  });
  if (error) throw error;

  // Best-effort — the message is already saved above even if this fails.
  try {
    await supabase.functions.invoke('send-email', {
      body: {
        to: 'support@propertyflow.com',
        subject: `New Contact Message: ${input.subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${input.name} (${input.email})</p>
          ${input.phone ? `<p><strong>Phone:</strong> ${input.phone}</p>` : ''}
          <p><strong>Subject:</strong> ${input.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${input.message.replace(/\n/g, '<br>')}</p>
        `,
      },
    });
  } catch (emailError) {
    console.error('Contact notification email failed:', emailError);
  }
}
