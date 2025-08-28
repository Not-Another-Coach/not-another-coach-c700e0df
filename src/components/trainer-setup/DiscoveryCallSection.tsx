import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, ExternalLink, Calendar as CalendarIcon, Clock, Info } from "lucide-react";
import { SectionHeader } from './SectionHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDiscoveryCallSettings } from "@/hooks/useDiscoveryCallSettings";
import { useToast } from "@/hooks/use-toast";

interface DiscoveryCallSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
  errors?: { [key: string]: string };
  clearFieldError?: (field: string) => void;
}

export function DiscoveryCallSection({ formData, updateFormData, errors }: DiscoveryCallSectionProps) {
  const { settings: discoverySettings, loading: discoveryLoading, updateSettings } = useDiscoveryCallSettings();
  const { toast } = useToast();

  const testBookingLink = () => {
    if (formData.calendar_link) {
      window.open(formData.calendar_link, '_blank');
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        icons={[CalendarIcon]}
        title="Discovery Calls"
        description="Configure your free discovery call offerings for potential clients"
      />

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          💡 <strong>Discovery Call Tip:</strong> Free discovery calls help you connect with potential clients, understand their goals, and explain how you can help. They're a great way to build trust before clients commit to a package.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Discovery Call Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {discoveryLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-8 bg-muted rounded"></div>
            </div>
          ) : discoverySettings ? (
            <>
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Offer Free Discovery Call
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow potential clients to book a free discovery call with you
                  </p>
                </div>
                <Switch
                  checked={discoverySettings.offers_discovery_call}
                  onCheckedChange={(checked) => 
                    updateSettings({ offers_discovery_call: checked })
                  }
                />
              </div>

              {discoverySettings.offers_discovery_call && (
                <>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Call Duration
                    </Label>
                    <Select
                      value={discoverySettings.discovery_call_duration.toString()}
                      onValueChange={(value) => 
                        updateSettings({ discovery_call_duration: parseInt(value) })
                      }
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

                  <div className="space-y-2">
                    <Label htmlFor="calendar_link">Booking Link (Calendly, etc.)</Label>
                    <Input
                      id="calendar_link"
                      value={formData.calendar_link || ""}
                      onChange={(e) => updateFormData({ calendar_link: e.target.value })}
                      placeholder="https://calendly.com/your-username"
                      type="url"
                    />
                    {formData.calendar_link && (
                      <div className="flex items-center gap-2">
                        {isValidUrl(formData.calendar_link) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={testBookingLink}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Test Link
                          </Button>
                        ) : (
                          <p className="text-xs text-red-600">Please enter a valid URL</p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Loading discovery call settings...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}