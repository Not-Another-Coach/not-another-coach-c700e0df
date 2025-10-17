import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, AlertCircle, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface FailedPaymentConfig {
  grace_period_days: number;
  hard_cutoff: boolean;
  hide_from_search: boolean;
  block_upgrades: boolean;
  allow_downgrades: boolean;
}

interface StripeRetryConfig {
  auto_retry_enabled: boolean;
  retry_days: number[];
  email_on_retry: boolean;
}

export const FailedPaymentConfigPanel = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [paymentConfig, setPaymentConfig] = useState<FailedPaymentConfig>({
    grace_period_days: 7,
    hard_cutoff: false,
    hide_from_search: true,
    block_upgrades: true,
    allow_downgrades: true
  });

  const [retryConfig, setRetryConfig] = useState<StripeRetryConfig>({
    auto_retry_enabled: true,
    retry_days: [3, 5, 7, 10],
    email_on_retry: true
  });

  const [newRetryDay, setNewRetryDay] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data: settings } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['failed_payment_config', 'stripe_retry_schedule']);

      settings?.forEach((setting) => {
        if (setting.setting_key === 'failed_payment_config' && setting.setting_value) {
          setPaymentConfig(prev => ({ ...prev, ...(setting.setting_value as any) }));
        } else if (setting.setting_key === 'stripe_retry_schedule' && setting.setting_value) {
          setRetryConfig(prev => ({ ...prev, ...(setting.setting_value as any) }));
        }
      });
    } catch (error: any) {
      toast.error('Failed to load config', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error: paymentError } = await supabase
        .from('app_settings')
        .upsert([{
          setting_key: 'failed_payment_config',
          setting_value: paymentConfig as any
        }], {
          onConflict: 'setting_key'
        });

      if (paymentError) throw paymentError;

      const { error: retryError } = await supabase
        .from('app_settings')
        .upsert([{
          setting_key: 'stripe_retry_schedule',
          setting_value: retryConfig as any
        }], {
          onConflict: 'setting_key'
        });

      if (retryError) throw retryError;

      toast.success('Payment rules updated successfully');
    } catch (error: any) {
      toast.error('Failed to save config', { description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const addRetryDay = () => {
    const day = parseInt(newRetryDay);
    if (day > 0 && day <= 30 && !retryConfig.retry_days.includes(day)) {
      setRetryConfig(prev => ({
        ...prev,
        retry_days: [...prev.retry_days, day].sort((a, b) => a - b)
      }));
      setNewRetryDay('');
    }
  };

  const removeRetryDay = (day: number) => {
    setRetryConfig(prev => ({
      ...prev,
      retry_days: prev.retry_days.filter(d => d !== day)
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-muted-foreground">Loading configuration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Failure Configuration</CardTitle>
        <CardDescription>
          Configure grace periods, limited mode behavior, and payment retry schedules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Grace Period Configuration */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Grace Period</h3>
            <p className="text-sm text-muted-foreground">
              How long trainers have to fix payment issues before limited mode
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Grace Period Days</Label>
                <span className="text-sm font-medium">{paymentConfig.grace_period_days} days</span>
              </div>
              <Slider
                value={[paymentConfig.grace_period_days]}
                onValueChange={([value]) => setPaymentConfig(prev => ({ ...prev, grace_period_days: value }))}
                min={1}
                max={30}
                step={1}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Hard Cutoff After Grace Period</Label>
                <p className="text-xs text-muted-foreground">
                  Immediately move to limited mode (no grace extension possible)
                </p>
              </div>
              <Switch
                checked={paymentConfig.hard_cutoff}
                onCheckedChange={(checked) => setPaymentConfig(prev => ({ ...prev, hard_cutoff: checked }))}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Limited Mode Behavior */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Limited Mode Behavior</h3>
            <p className="text-sm text-muted-foreground">
              What restrictions apply when trainers enter limited mode
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Hide from Search/Browse</Label>
                <p className="text-xs text-muted-foreground">
                  Trainer profiles won't appear in client search results
                </p>
              </div>
              <Switch
                checked={paymentConfig.hide_from_search}
                onCheckedChange={(checked) => setPaymentConfig(prev => ({ ...prev, hide_from_search: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Block Plan Upgrades</Label>
                <p className="text-xs text-muted-foreground">
                  Prevent upgrading to higher plans during grace period
                </p>
              </div>
              <Switch
                checked={paymentConfig.block_upgrades}
                onCheckedChange={(checked) => setPaymentConfig(prev => ({ ...prev, block_upgrades: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Plan Downgrades</Label>
                <p className="text-xs text-muted-foreground">
                  Let trainers downgrade to cheaper plans during grace period
                </p>
              </div>
              <Switch
                checked={paymentConfig.allow_downgrades}
                onCheckedChange={(checked) => setPaymentConfig(prev => ({ ...prev, allow_downgrades: checked }))}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Stripe Retry Schedule */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Stripe Auto-Retry Schedule</h3>
            <p className="text-sm text-muted-foreground">
              Automatic payment retry attempts after initial failure
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Auto-Retry</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically retry failed payments on specified days
                </p>
              </div>
              <Switch
                checked={retryConfig.auto_retry_enabled}
                onCheckedChange={(checked) => setRetryConfig(prev => ({ ...prev, auto_retry_enabled: checked }))}
              />
            </div>

            {retryConfig.auto_retry_enabled && (
              <>
                <div>
                  <Label>Retry Days</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Days after failure to retry payment
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {retryConfig.retry_days.map((day) => (
                      <Badge key={day} variant="secondary" className="gap-1">
                        Day {day}
                        <button
                          onClick={() => removeRetryDay(day)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      placeholder="Add day..."
                      value={newRetryDay}
                      onChange={(e) => setNewRetryDay(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addRetryDay()}
                      className="w-32"
                    />
                    <Button onClick={addRetryDay} variant="outline" size="sm">
                      Add
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email on Each Retry</Label>
                    <p className="text-xs text-muted-foreground">
                      Send notification email when retry is attempted
                    </p>
                  </div>
                  <Switch
                    checked={retryConfig.email_on_retry}
                    onCheckedChange={(checked) => setRetryConfig(prev => ({ ...prev, email_on_retry: checked }))}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-900">
            Changes take effect immediately and apply to all trainers with payment issues
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
