import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, CreditCard, Package, ArrowRight } from "lucide-react";
import { useManualPayment, type PaymentRecord } from "@/hooks/useManualPayment";
import { getCurrencySymbol } from "@/lib/packagePaymentUtils";

interface PaymentHistoryWidgetProps {
  limit?: number;
}

export function PaymentHistoryWidget({ limit = 5 }: PaymentHistoryWidgetProps) {
  const { paymentHistory, processInstallmentPayment, processing, getPaymentSummary } = useManualPayment();
  
  const summary = getPaymentSummary();
  const displayHistory = limit ? paymentHistory.slice(-limit) : paymentHistory;

  const handleInstallmentPayment = async (record: PaymentRecord) => {
    try {
      await processInstallmentPayment(record);
    } catch (error) {
      console.error('Installment payment failed:', error);
    }
  };

  const getProgressPercentage = (record: PaymentRecord) => {
    if (record.paymentMode === 'upfront') return 100;
    return (record.paidAmount / record.totalAmount) * 100;
  };

  if (paymentHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">No payments yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment History
        </CardTitle>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{getCurrencySymbol('GBP')}{summary.totalPaid.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Total Paid</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{summary.activeSubscriptions}</p>
            <p className="text-sm text-muted-foreground">Active Plans</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayHistory.map((record) => (
          <div key={record.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{record.packageName}</span>
              </div>
              <Badge variant={record.status === 'completed' ? 'default' : 'secondary'}>
                {record.status}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>
                  {getCurrencySymbol(record.currency)}{record.paidAmount.toFixed(2)} / {getCurrencySymbol(record.currency)}{record.totalAmount.toFixed(2)}
                </span>
              </div>
              <Progress value={getProgressPercentage(record)} className="h-2" />
            </div>

            {record.paymentMode === 'installments' && record.status === 'active' && (
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Next: {record.nextPaymentDate?.toLocaleDateString()}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleInstallmentPayment(record)}
                  disabled={processing}
                  className="flex items-center gap-1"
                >
                  {processing ? 'Processing...' : (
                    <>
                      Pay {getCurrencySymbol(record.currency)}{record.installmentAmount?.toFixed(2)}
                      <ArrowRight className="h-3 w-3" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        ))}
        
        {paymentHistory.length > limit && (
          <div className="text-center pt-2">
            <Button variant="outline" size="sm">
              View All ({paymentHistory.length} payments)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}