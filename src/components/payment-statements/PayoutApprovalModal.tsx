import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Upload, X } from 'lucide-react';
import { PayoutPeriod } from '@/hooks/usePaymentStatements';
import { formatMoney } from '@/utils/paymentStatementHelpers';
import { format } from 'date-fns';

interface PayoutApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: PayoutPeriod | null;
  onSubmit: (reason: string, attachments: Array<{ url: string; kind?: string }>) => void;
}

export const PayoutApprovalModal: React.FC<PayoutApprovalModalProps> = ({
  isOpen,
  onClose,
  period,
  onSubmit
}) => {
  const [reason, setReason] = useState('');
  const [attachments, setAttachments] = useState<Array<{ url: string; kind?: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(reason, attachments);
      setReason('');
      setAttachments([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setAttachments([]);
    onClose();
  };

  const addAttachment = (url: string, kind?: string) => {
    setAttachments(prev => [...prev, { url, kind }]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  if (!period) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Reject Payout Period
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Period Summary */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Period</span>
                  <span className="text-sm font-medium">Period {period.period_index}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Dates</span>
                  <span className="text-sm">
                    {format(new Date(period.period_start), 'MMM d')} - {format(new Date(period.period_end), 'MMM d')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-sm font-medium">
                    {formatMoney({ currency: period.net_payable_currency, amount: period.net_payable_amount })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for rejection *</Label>
            <Textarea
              id="reason"
              placeholder="Please explain why you are rejecting this payout period..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>Supporting documents (optional)</Label>
            
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm truncate">{attachment.url}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const url = prompt('Enter URL for supporting document:');
                if (url) {
                  addAttachment(url);
                }
              }}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Add Document URL
            </Button>
            <p className="text-xs text-muted-foreground">
              You can add URLs to relevant documents or screenshots
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
            variant="destructive"
          >
            {isSubmitting ? 'Rejecting...' : 'Reject Payout'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};