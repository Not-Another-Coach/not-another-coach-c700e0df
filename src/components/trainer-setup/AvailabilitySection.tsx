import { useWaitlist } from "@/hooks/useWaitlist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Pause, Calendar, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface AvailabilitySectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export function AvailabilitySection({ formData, updateFormData }: AvailabilitySectionProps) {
  const { availabilitySettings, updateAvailabilitySettings, loading } = useWaitlist();
  const { toast } = useToast();
  const [availabilityStatus, setAvailabilityStatus] = useState('accepting');
  const [nextAvailableDate, setNextAvailableDate] = useState('');
  const [allowDiscoveryCalls, setAllowDiscoveryCalls] = useState(true);
  const [autoFollowUpDays, setAutoFollowUpDays] = useState(14);
  const [waitlistMessage, setWaitlistMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize state from availability settings
  useEffect(() => {
    if (availabilitySettings) {
      setAvailabilityStatus(availabilitySettings.availability_status || 'accepting');
      setNextAvailableDate(availabilitySettings.next_available_date || '');
      setAllowDiscoveryCalls(availabilitySettings.allow_discovery_calls_on_waitlist ?? true);
      setAutoFollowUpDays(availabilitySettings.auto_follow_up_days || 14);
      setWaitlistMessage(availabilitySettings.waitlist_message || '');
    }
  }, [availabilitySettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateAvailabilitySettings({
        availability_status: availabilityStatus as any,
        next_available_date: nextAvailableDate || null,
        allow_discovery_calls_on_waitlist: allowDiscoveryCalls,
        auto_follow_up_days: autoFollowUpDays,
        waitlist_message: waitlistMessage || null,
      });

      // Also update the profile client_status to match availability status
      const statusMap = {
        'accepting': 'open',
        'waitlist': 'waitlist', 
        'unavailable': 'paused'
      };
      updateFormData({ client_status: statusMap[availabilityStatus] });

      toast({
        title: "Availability Updated",
        description: "Your availability settings have been saved successfully.",
      });
    } catch (error) {
      console.error('Failed to update availability settings:', error);
      toast({
        title: "Error",
        description: "Failed to update availability settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'accepting':
        return {
          label: 'Accepting Clients',
          description: 'Your profile is visible and you\'re actively taking new clients',
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
          icon: CheckCircle
        };
      case 'waitlist':
        return {
          label: 'Waitlist Only', 
          description: 'Your profile is visible but clients can only join a waitlist',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50 border-amber-200',
          icon: Clock
        };
      case 'unavailable':
        return {
          label: 'Not Available',
          description: 'Your profile is hidden from client searches',
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200',
          icon: Pause
        };
      default:
        return {
          label: 'Unknown',
          description: '',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          icon: Pause
        };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStatus = getStatusInfo(availabilityStatus);

  return (
    <div className="space-y-6">
      <Card className={currentStatus.bgColor}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <currentStatus.icon className={`h-5 w-5 ${currentStatus.color}`} />
            <div>
              <p className={`font-medium ${currentStatus.color}`}>
                Current Status: {currentStatus.label}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentStatus.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Availability Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Select your current availability status</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Accepting Clients */}
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  availabilityStatus === 'accepting'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
                onClick={() => setAvailabilityStatus('accepting')}
              >
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Accepting Clients</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your profile is visible and you're actively taking new clients
                </p>
              </div>

              {/* Waitlist Only */}
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  availabilityStatus === 'waitlist'
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-amber-300'
                }`}
                onClick={() => setAvailabilityStatus('waitlist')}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <span className="font-medium">Waitlist Only</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your profile is visible but clients can only join a waitlist
                </p>
              </div>

              {/* Not Available */}
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  availabilityStatus === 'unavailable'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
                onClick={() => setAvailabilityStatus('unavailable')}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Pause className="h-5 w-5 text-red-600" />
                  <span className="font-medium">Not Available</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your profile is hidden from client searches
                </p>
              </div>
            </div>
          </div>

          {availabilityStatus === 'waitlist' && (
            <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-amber-600" />
                <Label className="text-amber-900">Waitlist Settings</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="next_available_date">Next Available Date</Label>
                <Input
                  id="next_available_date"
                  type="date"
                  value={nextAvailableDate}
                  onChange={(e) => setNextAvailableDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-amber-700">
                  Let potential clients know when you'll next have availability
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Discovery Calls</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow clients on waitlist to book discovery calls
                  </p>
                </div>
                <Switch
                  checked={allowDiscoveryCalls}
                  onCheckedChange={setAllowDiscoveryCalls}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auto_follow_up">Auto Follow-up Days</Label>
                <Input
                  id="auto_follow_up"
                  type="number"
                  value={autoFollowUpDays}
                  onChange={(e) => setAutoFollowUpDays(parseInt(e.target.value) || 14)}
                  min="1"
                  max="90"
                />
                <p className="text-xs text-muted-foreground">
                  Days before automatically following up with waitlist clients
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="waitlist_message">Custom Waitlist Message</Label>
                <Textarea
                  id="waitlist_message"
                  value={waitlistMessage}
                  onChange={(e) => setWaitlistMessage(e.target.value)}
                  placeholder="Optional message to show clients joining your waitlist..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Custom message shown to clients joining your waitlist
                </p>
              </div>
            </div>
          )}

          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? 'Saving...' : 'Save Availability Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}