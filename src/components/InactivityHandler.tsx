import { useInactivityLogout } from '@/hooks/useInactivityLogout';
import { InactivityWarningModal } from './InactivityWarningModal';
import { useAuth } from '@/hooks/useAuth';

interface InactivityHandlerProps {
  timeoutMinutes?: number;
  warningMinutes?: number;
}

export function InactivityHandler({
  timeoutMinutes = 30,
  warningMinutes = 2,
}: InactivityHandlerProps) {
  const { user } = useAuth();
  const { showWarning, remainingSeconds, dismissWarning } = useInactivityLogout({
    timeoutMinutes,
    warningMinutes,
  });

  // Only render if user is logged in
  if (!user) return null;

  return (
    <InactivityWarningModal
      open={showWarning}
      remainingSeconds={remainingSeconds}
      onStayLoggedIn={dismissWarning}
    />
  );
}
