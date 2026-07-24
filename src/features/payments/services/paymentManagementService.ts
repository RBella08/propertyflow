import { supabase } from '@/lib/supabase';

export async function updatePaymentStatus(
  reference: string,
  status: 'pending' | 'processing' | 'successful' | 'failed' | 'refunded'
): Promise<void> {
  const { error } = await supabase.from('payments').update({ status }).eq('reference', reference);

  if (error) throw error;
}
