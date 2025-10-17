import { AlertCircle, CreditCard } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PaymentStatusBannerProps {
  paymentStatus: 'current' | 'past_due' | 'limited_mode' | 'cancelled';
  graceEndDate?: string | null;
  paymentBlockedReason?: string | null;
}

export const PaymentStatusBanner = ({ 
  paymentStatus, 
  graceEndDate,
  paymentBlockedReason 
}: PaymentStatusBannerProps) => {
  const navigate = useNavigate();

  if (paymentStatus === 'current') return null;

  const getDaysUntil = (date: string) => {
    const target = new Date(date);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (paymentStatus === 'past_due' && graceEndDate) {
    const daysRemaining = getDaysUntil(graceEndDate);
    
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Payment Failed - Action Required</AlertTitle>
        <AlertDescription className="flex items-center justify-between mt-2">
          <div>
            {paymentBlockedReason || 'Your payment failed.'}
            {' '}You have <strong>{daysRemaining} days</strong> to update your payment method before your account enters Limited mode.
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => navigate('/trainer/billing')}
            className="ml-4 flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Update Payment
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (paymentStatus === 'limited_mode') {
    return (
      <Alert variant="destructive" className="mb-6 border-destructive bg-destructive/10">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Account in Limited Mode</AlertTitle>
        <AlertDescription className="flex items-center justify-between mt-2">
          <div>
            Your account has limited functionality due to an unpaid invoice. Update your payment method to restore full access.
          </div>
          <Button 
            size="sm"
            onClick={() => navigate('/trainer/billing')}
            className="ml-4 flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Update Payment
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (paymentStatus === 'cancelled') {
    return (
      <Alert variant="default" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Membership Cancelled</AlertTitle>
        <AlertDescription>
          Your membership has been cancelled. Contact support to reactivate your account.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
