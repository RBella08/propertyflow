import { useState } from 'react';
import { Search, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { findTenantByEmail } from '../services/leaseService';

interface TenantLookupProps {
  onFound: (tenantId: string, fullName: string, profileId: string) => void;
}

export function TenantLookup({ onFound }: TenantLookupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'found' | 'error'>('idle');
  const [foundName, setFoundName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLookup = async () => {
    setStatus('loading');
    setErrorMessage('');
    try {
      const result = await findTenantByEmail(email);
      setFoundName(result.fullName);
      setStatus('found');
      onFound(result.tenantId, result.fullName, result.profileId);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Tenant not found');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Tenant's email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setStatus('idle');
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleLookup}
          disabled={!email || status === 'loading'}
        >
          <Search className="mr-1.5 h-4 w-4" /> Find
        </Button>
      </div>
      {status === 'found' && (
        <p className="flex items-center gap-1.5 text-caption text-success">
          <Check className="h-3.5 w-3.5" /> Tenant found: {foundName}
        </p>
      )}
      {status === 'error' && <p className="text-caption text-destructive">{errorMessage}</p>}
    </div>
  );
}
