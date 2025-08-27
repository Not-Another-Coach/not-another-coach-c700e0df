import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, DollarSign, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { usePaymentStatements, StatementSummary, PayoutPeriod, Role } from '@/hooks/usePaymentStatements';
import { formatMoney, formatApprovalStatus, isApprovalOverdue } from '@/utils/paymentStatementHelpers';
import { PayoutApprovalModal } from './PayoutApprovalModal';
import { format } from 'date-fns';

interface PaymentStatementViewProps {
  packageId: string;
  viewerRole: Role;
  onClose?: () => void;
}

export const PaymentStatementView: React.FC<PaymentStatementViewProps> = ({
  packageId,
  viewerRole,
  onClose
}) => {
  const { generatePaymentStatement, approvePayoutPeriod, rejectPayoutPeriod } = usePaymentStatements();
  const [statement, setStatement] = useState<StatementSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PayoutPeriod | null>(null);

  useEffect(() => {
    loadStatement();
  }, [packageId, viewerRole]);

  const loadStatement = async () => {
    setLoading(true);
    const result = await generatePaymentStatement(packageId, viewerRole);
    setStatement(result);
    setLoading(false);
  };

  const handleApprovePeriod = async (periodIndex: number) => {
    const success = await approvePayoutPeriod(packageId, periodIndex);
    if (success) {
      loadStatement(); // Refresh
    }
  };

  const handleRejectPeriod = (period: PayoutPeriod) => {
    setSelectedPeriod(period);
    setApprovalModalOpen(true);
  };

  const handleRejectSubmit = async (reason: string, attachments: Array<{ url: string; kind?: string }>) => {
    if (selectedPeriod) {
      const success = await rejectPayoutPeriod(packageId, selectedPeriod.period_index, reason, attachments);
      if (success) {
        loadStatement(); // Refresh
        setApprovalModalOpen(false);
        setSelectedPeriod(null);
      }
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading payment statement...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!statement) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            Failed to load payment statement
          </div>
        </CardContent>
      </Card>
    );
  }

  const getApprovalStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'auto_approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'auto_approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{statement.packageTitle}</CardTitle>
              <p className="text-muted-foreground mt-1">
                Payment Statement • {statement.durationLabel} • {statement.payoutFrequency} payouts
              </p>
            </div>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Summary Totals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Package Total</p>
              <p className="text-lg font-semibold">{formatMoney(statement.totals.packageGross)}</p>
            </div>
            
            {viewerRole === 'trainer' && statement.totals.commissionOnboardingTotal && (
              <div>
                <p className="text-sm text-muted-foreground">Commission Deducted</p>
                <p className="text-lg font-semibold text-red-600">
                  -{formatMoney(statement.totals.commissionOnboardingTotal)}
                </p>
              </div>
            )}
            
            <div>
              <p className="text-sm text-muted-foreground">
                {viewerRole === 'customer' ? 'Paid to Date' : 'Net Total'}
              </p>
              <p className="text-lg font-semibold text-green-600">
                {formatMoney(viewerRole === 'customer' ? statement.totals.customerPaidToDate : statement.totals.trainerNetTotal)}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">
                {viewerRole === 'customer' ? 'Outstanding' : 'Outstanding Payouts'}
              </p>
              <p className="text-lg font-semibold">
                {formatMoney(viewerRole === 'customer' ? statement.totals.customerOutstanding : statement.totals.trainerOutstanding)}
              </p>
            </div>
          </div>
          
          {viewerRole === 'trainer' && statement.membershipPlanBlurb && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">{statement.membershipPlanBlurb}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {viewerRole === 'customer' ? 'Approval Schedule' : 'Payout Schedule'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {statement.payoutSchedule.map((period) => (
              <div key={period.period_index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">Period {period.period_index}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(period.period_start), 'MMM d')} - {format(new Date(period.period_end), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getApprovalStatusIcon(period.approval_status)}
                    <Badge className={getApprovalStatusColor(period.approval_status)}>
                      {formatApprovalStatus(period.approval_status)}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Gross Amount</p>
                    <p className="font-medium">
                      {formatMoney({ currency: period.gross_portion_currency, amount: period.gross_portion_amount })}
                    </p>
                  </div>
                  
                  {viewerRole === 'trainer' && period.commission_deduction_amount > 0 && (
                    <div>
                      <p className="text-muted-foreground">Commission</p>
                      <p className="font-medium text-red-600">
                        -{formatMoney({ currency: period.commission_deduction_currency, amount: period.commission_deduction_amount })}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-muted-foreground">Net Payable</p>
                    <p className="font-medium text-green-600">
                      {formatMoney({ currency: period.net_payable_currency, amount: period.net_payable_amount })}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Approval Deadline</p>
                    <p className={`font-medium ${isApprovalOverdue(period.approval_deadline_at) && period.approval_status === 'pending' ? 'text-red-600' : ''}`}>
                      {format(new Date(period.approval_deadline_at), 'MMM d, HH:mm')}
                    </p>
                  </div>
                </div>

                {/* Customer approval actions */}
                {viewerRole === 'customer' && period.approval_status === 'pending' && (
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" onClick={() => handleApprovePeriod(period.period_index)}>
                      Approve Payout
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleRejectPeriod(period)}>
                      Reject
                    </Button>
                  </div>
                )}

                {/* Show rejection details if applicable */}
                {period.approval_status === 'rejected' && period.rejection_reason && (
                  <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
                    <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                    <p className="text-sm text-red-700 mt-1">{period.rejection_reason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Payment History */}
      {statement.customerPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statement.customerPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">
                      {formatMoney({ currency: payment.amount_currency, amount: payment.amount_value })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(payment.paid_at), 'MMM d, yyyy HH:mm')} • {payment.payment_method}
                    </p>
                  </div>
                  <Badge variant={payment.status === 'succeeded' ? 'default' : 'destructive'}>
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Modal */}
      <PayoutApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => {
          setApprovalModalOpen(false);
          setSelectedPeriod(null);
        }}
        period={selectedPeriod}
        onSubmit={handleRejectSubmit}
      />
    </div>
  );
};