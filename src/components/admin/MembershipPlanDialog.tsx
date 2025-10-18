import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MembershipPlanDefinition, CreateMembershipPlanRequest, UpdateMembershipPlanRequest } from '@/services/admin/types';

interface MembershipPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: MembershipPlanDefinition;
  onSave: (request: CreateMembershipPlanRequest | UpdateMembershipPlanRequest) => Promise<boolean>;
}

export const MembershipPlanDialog = ({ open, onOpenChange, plan, onSave }: MembershipPlanDialogProps) => {
  const isEdit = !!plan;
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    plan_name: '',
    display_name: '',
    description: '',
    monthly_price_cents: 0,
    has_package_commission: false,
    commission_fee_type: 'percentage' as 'percentage' | 'flat',
    commission_fee_value_percent: 0,
    commission_fee_value_flat_cents: 0,
    is_available_to_new_trainers: true,
    stripe_product_id: '',
    stripe_price_id: ''
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        plan_name: plan.plan_name,
        display_name: plan.display_name,
        description: plan.description || '',
        monthly_price_cents: plan.monthly_price_cents,
        has_package_commission: plan.has_package_commission,
        commission_fee_type: plan.commission_fee_type || 'percentage',
        commission_fee_value_percent: plan.commission_fee_value_percent || 0,
        commission_fee_value_flat_cents: plan.commission_fee_value_flat_cents || 0,
        is_available_to_new_trainers: plan.is_available_to_new_trainers,
        stripe_product_id: plan.stripe_product_id || '',
        stripe_price_id: plan.stripe_price_id || ''
      });
    } else {
      setFormData({
        plan_name: '',
        display_name: '',
        description: '',
        monthly_price_cents: 0,
        has_package_commission: false,
        commission_fee_type: 'percentage',
        commission_fee_value_percent: 0,
        commission_fee_value_flat_cents: 0,
        is_available_to_new_trainers: true,
        stripe_product_id: '',
        stripe_price_id: ''
      });
    }
  }, [plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const request = isEdit
      ? {
          plan_id: plan!.id,
          plan_name: formData.plan_name,
          display_name: formData.display_name,
          description: formData.description || null,
          monthly_price_cents: formData.monthly_price_cents,
          has_package_commission: formData.has_package_commission,
          commission_fee_type: formData.has_package_commission ? formData.commission_fee_type : null,
          commission_fee_value_percent: formData.has_package_commission && formData.commission_fee_type === 'percentage' 
            ? formData.commission_fee_value_percent 
            : null,
          commission_fee_value_flat_cents: formData.has_package_commission && formData.commission_fee_type === 'flat' 
            ? formData.commission_fee_value_flat_cents 
            : null,
          is_available_to_new_trainers: formData.is_available_to_new_trainers,
          stripe_product_id: formData.stripe_product_id || null,
          stripe_price_id: formData.stripe_price_id || null
        } as UpdateMembershipPlanRequest
      : {
          ...formData,
          description: formData.description || null,
          commission_fee_type: formData.has_package_commission ? formData.commission_fee_type : null,
          commission_fee_value_percent: formData.has_package_commission && formData.commission_fee_type === 'percentage' 
            ? formData.commission_fee_value_percent 
            : null,
          commission_fee_value_flat_cents: formData.has_package_commission && formData.commission_fee_type === 'flat' 
            ? formData.commission_fee_value_flat_cents 
            : null,
          stripe_product_id: formData.stripe_product_id || null,
          stripe_price_id: formData.stripe_price_id || null
        } as CreateMembershipPlanRequest;

    const success = await onSave(request);
    setLoading(false);
    
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Membership Plan' : 'Create Membership Plan'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the membership plan details' : 'Create a new membership plan for trainers'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plan_name">Plan Name (Internal Identifier)</Label>
            <Input
              id="plan_name"
              value={formData.plan_name}
              onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
              placeholder="e.g., professional_plan"
              required
              disabled={isEdit}
            />
            <p className="text-xs text-muted-foreground">
              {isEdit ? 'Plan name cannot be changed after creation' : 'Use a unique identifier (lowercase, underscores)'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              placeholder="e.g., High Subscription"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain what this plan offers to trainers..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_price">Monthly Price (£)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
              <Input
                id="monthly_price"
                type="text"
                inputMode="decimal"
                className="pl-7"
                value={(formData.monthly_price_cents / 100).toFixed(2)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                    const cents = value === '' ? 0 : Math.round(parseFloat(value || '0') * 100);
                    setFormData({ ...formData, monthly_price_cents: cents });
                  }
                }}
                placeholder="0.00"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">Enter amount in pounds (e.g., 49.99)</p>
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1">
              <Label htmlFor="has_commission">Package Commission</Label>
              <p className="text-xs text-muted-foreground">
                Charge a commission on client package payments
              </p>
            </div>
            <Switch
              id="has_commission"
              checked={formData.has_package_commission}
              onCheckedChange={(checked) => setFormData({ ...formData, has_package_commission: checked })}
            />
          </div>

          {formData.has_package_commission && (
            <>
              <div className="space-y-2">
                <Label htmlFor="commission_type">Commission Type</Label>
                <Select
                  value={formData.commission_fee_type}
                  onValueChange={(value: 'percentage' | 'flat') => setFormData({ ...formData, commission_fee_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="flat">Flat Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.commission_fee_type === 'percentage' ? (
                <div className="space-y-2">
                  <Label htmlFor="commission_percent">Commission Percentage (%)</Label>
                  <div className="relative">
                    <Input
                      id="commission_percent"
                      type="text"
                      inputMode="decimal"
                      className="pr-7"
                      value={formData.commission_fee_value_percent}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                          setFormData({ ...formData, commission_fee_value_percent: parseFloat(value || '0') });
                        }
                      }}
                      placeholder="0.00"
                      required={formData.has_package_commission}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Enter percentage (e.g., 10 for 10%)</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="commission_flat">Commission Flat Amount (£)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                    <Input
                      id="commission_flat"
                      type="text"
                      inputMode="decimal"
                      className="pl-7"
                      value={(formData.commission_fee_value_flat_cents / 100).toFixed(2)}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                          const cents = value === '' ? 0 : Math.round(parseFloat(value || '0') * 100);
                          setFormData({ ...formData, commission_fee_value_flat_cents: cents });
                        }
                      }}
                      placeholder="0.00"
                      required={formData.has_package_commission}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Enter amount in pounds (e.g., 5.00)</p>
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="available">Available to New Trainers</Label>
            <Switch
              id="available"
              checked={formData.is_available_to_new_trainers}
              onCheckedChange={(checked) => setFormData({ ...formData, is_available_to_new_trainers: checked })}
            />
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="text-sm font-semibold">Stripe Integration</h3>
            
            <div className="space-y-2">
              <Label htmlFor="stripe_product_id">Stripe Product ID</Label>
              <Input
                id="stripe_product_id"
                value={formData.stripe_product_id}
                onChange={(e) => setFormData({ ...formData, stripe_product_id: e.target.value })}
                placeholder="prod_..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stripe_price_id">Stripe Price ID</Label>
              <Input
                id="stripe_price_id"
                value={formData.stripe_price_id}
                onChange={(e) => setFormData({ ...formData, stripe_price_id: e.target.value })}
                placeholder="price_..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
