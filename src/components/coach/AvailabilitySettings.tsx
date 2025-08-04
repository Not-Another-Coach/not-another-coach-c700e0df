import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useWaitlist, type CoachAvailabilityStatus } from '@/hooks/useWaitlist';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Users, MessageCircle, Settings } from 'lucide-react';

export function AvailabilitySettings() {
  const { availabilitySettings, updateAvailabilitySettings, loading } = useWaitlist();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<CoachAvailabilityStatus>('accepting');
  const [nextAvailableDate, setNextAvailableDate] = useState('');
  const [allowDiscoveryCalls, setAllowDiscoveryCalls] = useState(true);
  const [autoFollowUpDays, setAutoFollowUpDays] = useState(14);
  const [waitlistMessage, setWaitlistMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (availabilitySettings) {
      setStatus(availabilitySettings.availability_status);
      setNextAvailableDate(availabilitySettings.next_available_date || '');
      setAllowDiscoveryCalls(availabilitySettings.allow_discovery_calls_on_waitlist);
      setAutoFollowUpDays(availabilitySettings.auto_follow_up_days);
      setWaitlistMessage(availabilitySettings.waitlist_message || '');
    }
  }, [availabilitySettings]);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const result = await updateAvailabilitySettings({
        availability_status: status,
        next_available_date: nextAvailableDate || null,
        allow_discovery_calls_on_waitlist: allowDiscoveryCalls,
        auto_follow_up_days: autoFollowUpDays,
        waitlist_message: waitlistMessage || null
      });

      if (result.error) {
        toast({
          title: "Error",
          description: "Failed to save availability settings.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Settings Saved",
          description: "Your availability settings have been updated."
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusInfo = (currentStatus: CoachAvailabilityStatus) => {
    switch (currentStatus) {
      case 'accepting':
        return {
          label: 'Accepting New Clients',
          description: 'Actively taking on new clients',
          color: 'text-green-600',
          icon: Users
        };
      case 'waitlist':
        return {
          label: 'Waitlist Only',
          description: 'Not taking new clients, building waitlist',
          color: 'text-yellow-600',
          icon: Calendar
        };
      case 'unavailable':
        return {
          label: 'Currently Unavailable',
          description: 'Not accepting new clients or waitlist',
          color: 'text-red-600',
          icon: MessageCircle
        };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStatusInfo = getStatusInfo(status);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Availability Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-medium">Current Status</Label>
          <RadioGroup value={status} onValueChange={(value: CoachAvailabilityStatus) => setStatus(value)}>
            {(['accepting', 'waitlist', 'unavailable'] as const).map((statusOption) => {
              const statusInfo = getStatusInfo(statusOption);
              const Icon = statusInfo.icon;
              
              return (
                <div key={statusOption} className="flex items-center space-x-2 p-3 rounded-lg border">
                  <RadioGroupItem value={statusOption} id={statusOption} />
                  <div className="flex items-center gap-2 flex-1">
                    <Icon className={`w-4 h-4 ${statusInfo.color}`} />
                    <div>
                      <Label htmlFor={statusOption} className="font-medium cursor-pointer">
                        {statusInfo.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        {(status === 'waitlist' || status === 'accepting') && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="next-available">Next Available Date</Label>
              <Input
                id="next-available"
                type="date"
                value={nextAvailableDate}
                onChange={(e) => setNextAvailableDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-sm text-muted-foreground">
                {status === 'waitlist' 
                  ? 'When you expect to have availability for new clients'
                  : 'Optional: When your next slots will be available'
                }
              </p>
            </div>

            {status === 'waitlist' && (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="discovery-calls">Allow Discovery Calls</Label>
                    <p className="text-sm text-muted-foreground">
                      Can clients still book discovery calls while you're waitlisted?
                    </p>
                  </div>
                  <Switch
                    id="discovery-calls"
                    checked={allowDiscoveryCalls}
                    onCheckedChange={setAllowDiscoveryCalls}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="follow-up-days">Auto Follow-up Days</Label>
                  <Input
                    id="follow-up-days"
                    type="number"
                    min="1"
                    max="60"
                    value={autoFollowUpDays}
                    onChange={(e) => setAutoFollowUpDays(parseInt(e.target.value) || 14)}
                  />
                  <p className="text-sm text-muted-foreground">
                    How many days before the estimated start date to remind you to follow up
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="waitlist-message">Custom Waitlist Message (Optional)</Label>
                  <Textarea
                    id="waitlist-message"
                    placeholder="Add a personal message for clients joining your waitlist..."
                    value={waitlistMessage}
                    onChange={(e) => setWaitlistMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
        )}

        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
}