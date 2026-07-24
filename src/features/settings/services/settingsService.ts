import { supabase } from '@/lib/supabase';

export interface SettingItem {
  id: string;
  key: string;
  value: string;
  category: string;
  description: string | null;
}

export async function getSettings(): Promise<SettingItem[]> {
  const { data, error } = await supabase
    .from('system_settings')
    .select('id, key, value, group_name, description')
    .order('group_name');

  if (error) throw error;

  return (data ?? []).map((s) => ({
    id: s.id,
    key: s.key,
    value: typeof s.value === 'string' ? s.value : JSON.stringify(s.value ?? ''),
    category: s.group_name ?? 'general',
    description: s.description,
  }));
}

export async function updateSetting(settingId: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('system_settings')
    .update({
      value,
    })
    .eq('id', settingId);

  if (error) throw error;
}
