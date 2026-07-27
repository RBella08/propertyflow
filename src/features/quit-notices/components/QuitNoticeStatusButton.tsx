import { useState } from 'react';
import { toast } from 'sonner';
import { FileWarning, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ServeQuitNoticeDialog } from './ServeQuitNoticeDialog';
import { useQuitNoticesForLease, useRevokeQuitNotice } from '../hooks/useQuitNotices';

interface QuitNoticeStatusButtonProps {
  leaseId: string;
  tenantProfileId: string;
  tenantName: string;
  propertyName: string;
}

export function QuitNoticeStatusButton({
  leaseId,
  tenantProfileId,
  tenantName,
  propertyName,
}: QuitNoticeStatusButtonProps) {
  const { data: notices } = useQuitNoticesForLease(leaseId);
  const revokeNotice = useRevokeQuitNotice();
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeNotice = notices?.find((n) => n.status === 'active');

  const handleRevoke = async () => {
    if (!activeNotice) return;
    try {
      await revokeNotice.mutateAsync({
        noticeId: activeNotice.id,
        tenantProfileId,
        propertyName,
        leaseId,
      });
      toast.success('Notice to Quit revoked');
    } catch {
      toast.error('Could not revoke notice');
    }
  };

  if (activeNotice) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="destructive">Quit Notice Active</Badge>
        <Button size="sm" variant="ghost" title="Revoke this notice" onClick={handleRevoke}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="text-destructive"
        title="Serve Notice to Quit"
        onClick={() => setDialogOpen(true)}
      >
        <FileWarning className="h-4 w-4" />
      </Button>
      <ServeQuitNoticeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        leaseId={leaseId}
        tenantProfileId={tenantProfileId}
        tenantName={tenantName}
        propertyName={propertyName}
      />
    </>
  );
}
