import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, CreditCard, Package } from "lucide-react";
import { getCurrencySymbol } from "@/lib/packagePaymentUtils";
import { useNavigate } from "react-router-dom";
import type { PaymentRecord } from "@/hooks/useManualPayment";

interface PaymentConfirmationProps {
  paymentRecord: PaymentRecord;
  onClose: () => void;
}

export function PaymentConfirmation({ paymentRecord, onClose }: PaymentConfirmationProps) {
  const navigate = useNavigate();

  const handleContinue = () => {
    onClose();
    navigate('/client/dashboard');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-xl">Payment Confirmed!</CardTitle>
        <p className="text-sm text-muted-foreground">
          Transaction ID: {paymentRecord.id}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Package</span>
            </div>
            <span className="font-medium">{paymentRecord.packageName}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Payment Type</span>
            </div>
            <Badge variant={paymentRecord.paymentType === 'one-off' ? 'default' : 'secondary'}>
              {paymentRecord.paymentType === 'one-off' ? 'One-off Payment' : 'Subscription'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Amount Paid</span>
            <span className="font-semibold text-lg">
              {getCurrencySymbol(paymentRecord.currency)}{paymentRecord.paidAmount.toFixed(2)}
            </span>
          </div>
          
          {paymentRecord.paymentMode === 'installments' && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm">Remaining Amount</span>
                <span className="font-medium">
                  {getCurrencySymbol(paymentRecord.currency)}{paymentRecord.remainingAmount.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Installments</span>
                <span className="font-medium">
                  {paymentRecord.paidInstallments} of {paymentRecord.installmentCount} paid
                </span>
              </div>
              
              {paymentRecord.nextPaymentDate && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Next Payment</span>
                  </div>
                  <span className="font-medium">
                    {paymentRecord.nextPaymentDate.toLocaleDateString()}
                  </span>
                </div>
              )}
            </>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Status</span>
            <Badge variant={paymentRecord.status === 'completed' ? 'default' : 'secondary'}>
              {paymentRecord.status === 'completed' ? 'Completed' : 'Active'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Date</span>
            <span className="font-medium">
              {paymentRecord.createdAt.toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <Button onClick={handleContinue} className="w-full">
            Go to Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}