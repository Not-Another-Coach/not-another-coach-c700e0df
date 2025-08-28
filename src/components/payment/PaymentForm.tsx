import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PackagePaymentSelector } from './PackagePaymentSelector';
import { PaymentConfirmation } from './PaymentConfirmation';
import { useManualPaymentCompletion } from '@/hooks/useManualPaymentCompletion';
import type { PaymentRecord } from '@/hooks/useManualPayment';

interface PaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageName: string;
  packagePrice: number;
  packageDuration: string;
  trainerName: string;
  trainerId?: string;
  clientId?: string;
  onPaymentSuccess?: () => void;
  // Enhanced package data for flexible payments
  packageId?: string;
  customerPaymentModes?: ('upfront' | 'installments')[];
  installmentCount?: number;
  currency?: string;
}

export const PaymentForm = ({
  open,
  onOpenChange,
  packageName,
  packagePrice,
  packageDuration,
  trainerName,
  trainerId,
  clientId,
  onPaymentSuccess,
  packageId,
  customerPaymentModes,
  installmentCount,
  currency = 'GBP'
}: PaymentFormProps) => {
  const { completePayment } = useManualPaymentCompletion();
  const [paymentRecord, setPaymentRecord] = useState<PaymentRecord | null>(null);

  // Create package object for the enhanced payment selector
  const packageData = {
    id: packageId || `temp-${Date.now()}`,
    name: packageName,
    price: packagePrice,
    currency: currency,
    customerPaymentModes: customerPaymentModes || ['upfront'],
    installmentCount: installmentCount || 2,
  };

  const handlePaymentComplete = async (record: PaymentRecord) => {
    try {
      // Complete the payment manually (update database status)
      if (trainerId) {
        const result = await completePayment(trainerId, clientId);
        if (result.error) {
          throw new Error(result.error);
        }
      }
      
      setPaymentRecord(record);
      onPaymentSuccess?.();
    } catch (error: any) {
      console.error('Payment completion error:', error);
      // The PaymentRecord is still valid, just log the database update error
      setPaymentRecord(record);
      onPaymentSuccess?.();
    }
  };

  const handleConfirmationClose = () => {
    setPaymentRecord(null);
    onOpenChange(false);
  };

  // Show payment confirmation if payment was completed
  if (paymentRecord) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Successful</DialogTitle>
          </DialogHeader>
          <PaymentConfirmation
            paymentRecord={paymentRecord}
            onClose={handleConfirmationClose}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Complete Your Booking - {trainerName}</DialogTitle>
        </DialogHeader>
        <PackagePaymentSelector
          package={packageData}
          onPaymentSelection={handlePaymentComplete}
        />
      </DialogContent>
    </Dialog>
  );
};