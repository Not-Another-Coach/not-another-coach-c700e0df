import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Info } from 'lucide-react';
import { usePaymentStatements, MembershipSettings as MembershipSettingsType, MembershipPlanType } from '@/hooks/usePaymentStatements';
import { useAuth } from '@/hooks/useAuth';

export const MembershipSettings: React.FC = () => {
  const { user } = useAuth();
  const { fetchMembershipSettings, updateMembershipSettings } = usePaymentStatements();
  const [settings, setSettings] = useState<Partial<MembershipSettingsType>>({
    plan_type: 'low_sub_with_onboarding',
    onboarding_fee_kind: 'percent',
    onboarding_fee_value: 10
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    setLoading(true);
    const result = await fetchMembershipSettings();
    if (result) {
      setSettings(result as Partial<MembershipSettingsType>);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await updateMembershipSettings(settings);
    if (success) {
      await loadSettings(); // Refresh
    }
    setSaving(false);
  };

  const updateSetting = (key: keyof MembershipSettingsType, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading membership settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Membership Plan Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Type Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Membership Plan Type</Label>
          <RadioGroup
            value={settings.plan_type}
            onValueChange={(value: MembershipPlanType) => updateSetting('plan_type', value)}
          >
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <RadioGroupItem value="high_sub_no_onboarding" id="high-sub" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="high-sub" className="font-medium cursor-pointer">
                    High Subscription (No Onboarding Fees)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Higher monthly subscription with no commission on individual packages. 
                    You keep 100% of package payments.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <RadioGroupItem value="low_sub_with_onboarding" id="low-sub" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="low-sub" className="font-medium cursor-pointer">
                    Low Subscription (With Onboarding Fees)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Lower monthly subscription with commission deducted from package payments.
                  </p>
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Onboarding Fee Configuration */}
        {settings.plan_type === 'low_sub_with_onboarding' && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <Label className="text-base font-medium">Onboarding Fee Configuration</Label>
            
            <div className="space-y-3">
              <Label htmlFor="fee-type">Fee Type</Label>
              <Select
                value={settings.onboarding_fee_kind}
                onValueChange={(value: 'fixed' | 'percent') => updateSetting('onboarding_fee_kind', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="fee-value">
                Fee Value {settings.onboarding_fee_kind === 'percent' ? '(%)' : '(£)'}
              </Label>
              <Input
                id="fee-value"
                type="number"
                min="0"
                step={settings.onboarding_fee_kind === 'percent' ? '0.1' : '1'}
                value={settings.onboarding_fee_value || ''}
                onChange={(e) => updateSetting('onboarding_fee_value', parseFloat(e.target.value) || 0)}
                placeholder={settings.onboarding_fee_kind === 'percent' ? 'e.g., 10' : 'e.g., 50'}
              />
              <p className="text-sm text-muted-foreground">
                {settings.onboarding_fee_kind === 'percent'
                  ? 'Percentage of each package price to be deducted as commission'
                  : 'Fixed amount in GBP to be deducted from each package'
                }
              </p>
            </div>

            {/* Fee Preview */}
            {settings.onboarding_fee_value && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Fee Preview:</p>
                    <p>
                      {settings.onboarding_fee_kind === 'percent'
                        ? `${settings.onboarding_fee_value}% commission will be deducted from each package`
                        : `£${settings.onboarding_fee_value} will be deducted from each package`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        {/* Info Section */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">Important Information:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Your membership plan determines how commissions are handled on package payments</li>
                <li>Monthly subscription fees are handled separately and don't appear on package statements</li>
                <li>Changes to onboarding fees only affect new packages created after the change</li>
                <li>Existing packages retain the fee structure that was active when they were created</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};