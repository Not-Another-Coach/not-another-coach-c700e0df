import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LimitedModeGuardProps {
  children: React.ReactNode;
  action: 'create_package' | 'book_discovery' | 'new_client';
}

export function LimitedModeGuard({ children, action }: LimitedModeGuardProps) {
  const [isLimited, setIsLimited] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkLimitedMode();
  }, []);

  const checkLimitedMode = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: membership } = await supabase
      .from('trainer_membership')
      .select('payment_status')
      .eq('trainer_id', user.id)
      .eq('is_active', true)
      .single();

    setIsLimited(membership?.payment_status === 'limited_mode');
    setLoading(false);
  };

  if (loading) return null;

  if (isLimited) {
    const actionText = action.replace('_', ' ');
    
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Account in Limited Mode</AlertTitle>
        <AlertDescription>
          Your account is in Limited mode due to an unpaid invoice. 
          You cannot {actionText} until your payment is updated.
          <div className="mt-4 flex gap-2">
            <Button onClick={() => navigate('/settings/membership')}>
              Update Payment
            </Button>
            <Button variant="outline" onClick={() => navigate('/settings/billing')}>
              View Invoices
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
