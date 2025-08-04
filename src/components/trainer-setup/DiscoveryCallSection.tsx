import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Calendar, Info } from 'lucide-react';
import { useDiscoveryCallSettings } from '@/hooks/useDiscoveryCallSettings';

export const DiscoveryCallSection = () => {
  const { settings, loading, saving, updateSettings } = useDiscoveryCallSettings();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Discovery Call Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-muted rounded mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Discovery Call Settings
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure your free discovery call offerings for potential clients
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle Discovery Calls */}
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-1">
            <Label htmlFor="offers-discovery-call" className="text-base font-medium">
              Offer Free Discovery Call
            </Label>
            <p className="text-sm text-muted-foreground">
              Allow potential clients to book a free discovery call with you
            </p>
          </div>
          <Switch
            id="offers-discovery-call"
            checked={settings.offers_discovery_call}
            onCheckedChange={(checked) => 
              updateSettings({ offers_discovery_call: checked })
            }
            disabled={saving}
          />
        </div>

        {settings.offers_discovery_call && (
          <>
            {/* Duration Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Call Duration
              </Label>
              <Select
                value={settings.discovery_call_duration.toString()}
                onValueChange={(value) => 
                  updateSettings({ discovery_call_duration: parseInt(value) })
                }
                disabled={saving}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="20">20 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prep Notes */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                Preparation Notes (Optional)
              </Label>
              <Textarea
                placeholder="What should clients know before the call? What should they prepare?"
                value={settings.prep_notes || ''}
                onChange={(e) => updateSettings({ prep_notes: e.target.value })}
                disabled={saving}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                These notes will be shown to clients when they book a discovery call
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-blue-900">
                    Next Steps for Full Setup:
                  </p>
                  <ul className="text-blue-800 space-y-1 list-disc list-inside">
                    <li>Set your availability schedule (Phase 2)</li>
                    <li>Connect calendar integration (Phase 3)</li>
                    <li>Configure email notifications (Phase 4)</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};