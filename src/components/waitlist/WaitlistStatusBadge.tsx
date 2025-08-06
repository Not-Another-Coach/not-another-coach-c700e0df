import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useWaitlist } from '@/hooks/useWaitlist';
import { Clock } from 'lucide-react';

interface WaitlistStatusBadgeProps {
  coachId: string;
  className?: string;
  refreshKey?: number; // Add refresh key to force re-checks
}

export function WaitlistStatusBadge({ coachId, className, refreshKey }: WaitlistStatusBadgeProps) {
  const [waitlistEntry, setWaitlistEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { checkClientWaitlistStatus } = useWaitlist();

  useEffect(() => {
    const checkStatus = async () => {
      setLoading(true);
      const entry = await checkClientWaitlistStatus(coachId);
      setWaitlistEntry(entry);
      setLoading(false);
    };

    checkStatus();
  }, [coachId, checkClientWaitlistStatus, refreshKey]); // Include refreshKey in dependency array

  if (loading || !waitlistEntry) {
    return null;
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'On Waitlist', variant: 'secondary' as const };
      case 'contacted':
        return { label: 'Coach Contacted', variant: 'default' as const };
      case 'converted':
        return { label: 'Active Client', variant: 'default' as const };
      case 'archived':
        return { label: 'Archived', variant: 'outline' as const };
      default:
        return { label: 'On Waitlist', variant: 'secondary' as const };
    }
  };

  const statusInfo = getStatusInfo(waitlistEntry.status);

  return (
    <Badge variant={statusInfo.variant} className={className}>
      <Clock className="w-3 h-3 mr-1" />
      {statusInfo.label}
    </Badge>
  );
}