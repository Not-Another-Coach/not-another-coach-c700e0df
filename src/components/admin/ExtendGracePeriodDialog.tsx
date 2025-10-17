import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ExtendGracePeriodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainerId: string;
  currentGraceEnd: string;
  onSuccess: () => void;
}

export function ExtendGracePeriodDialog({
  open,
  onOpenChange,
  trainerId,
  currentGraceEnd,
  onSuccess
}: ExtendGracePeriodDialogProps) {
  const [additionalDays, setAdditionalDays] = useState<number>(7);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const newGraceEnd = new Date(currentGraceEnd);
  newGraceEnd.setDate(newGraceEnd.getDate() + additionalDays);

  const handleExtend = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for the extension');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('extend_grace_period' as any, {
        p_trainer_id: trainerId,
        p_additional_days: additionalDays,
        p_reason: reason
      });

      if (error) throw error;

      toast.success('Grace Period Extended', {
        description: `Extended by ${additionalDays} days`
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Extension Failed', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extend Grace Period</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Current Grace End Date</Label>
            <Input value={currentGraceEnd} disabled />
          </div>

          <div>
            <Label>Additional Days</Label>
            <Input 
              type="number"
              min={1}
              max={30}
              value={additionalDays}
              onChange={(e) => setAdditionalDays(Number(e.target.value))}
            />
          </div>

          <div>
            <Label>New Grace End Date</Label>
            <Input value={newGraceEnd.toISOString().split('T')[0]} disabled />
          </div>

          <div>
            <Label>Reason for Extension (Required)</Label>
            <Textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Payment method update in progress, temporary hardship..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleExtend} disabled={loading || !reason.trim()} className="flex-1">
              {loading ? 'Extending...' : 'Extend Grace Period'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
