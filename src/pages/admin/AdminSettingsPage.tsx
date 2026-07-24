import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings, useUpdateSetting } from '@/features/settings/hooks/useSettings';

export function AdminSettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSetting = useUpdateSetting();
  const [dirtyValues, setDirtyValues] = useState<Record<string, string>>({});

  const grouped = settings?.reduce<Record<string, typeof settings>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  const handleSave = async (settingId: string) => {
    const value = dirtyValues[settingId];
    if (value === undefined) return;
    try {
      await updateSetting.mutateAsync({ settingId, value });
      toast.success('Setting saved');
      setDirtyValues((prev) => {
        const next = { ...prev };
        delete next[settingId];
        return next;
      });
    } catch {
      toast.error('Could not save setting');
    }
  };

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Platform Settings</h1>
        <p className="text-muted-foreground">Configure system-wide options.</p>
      </div>

      {grouped &&
        Object.entries(grouped).map(([category, items]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-h6 capitalize">{category}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {items.map((setting) => (
                <div key={setting.id} className="flex flex-col gap-2">
                  <Label htmlFor={setting.key} className="capitalize">
                    {setting.key.replace(/_/g, ' ')}
                  </Label>
                  {setting.description && (
                    <p className="text-caption text-muted-foreground">{setting.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Input
                      id={setting.key}
                      value={dirtyValues[setting.id] ?? setting.value}
                      onChange={(e) =>
                        setDirtyValues((prev) => ({ ...prev, [setting.id]: e.target.value }))
                      }
                    />
                    <Button
                      variant="outline"
                      disabled={dirtyValues[setting.id] === undefined}
                      onClick={() => handleSave(setting.id)}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
