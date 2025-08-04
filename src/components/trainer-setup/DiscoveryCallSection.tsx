import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Info, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useDiscoveryCallSettings } from '@/hooks/useDiscoveryCallSettings';

export const DiscoveryCallSection = () => {
  const { settings, loading, saving, updateSettings } = useDiscoveryCallSettings();
  const [useCalendly, setUseCalendly] = useState(false);
  const [calendlyLink, setCalendlyLink] = useState('');

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const commonTimeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

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

  const handleDayToggle = (dayKey: string, enabled: boolean) => {
    const newSchedule = {
      ...settings.availability_schedule,
      [dayKey]: {
        ...settings.availability_schedule[dayKey],
        enabled
      }
    };
    updateSettings({ availability_schedule: newSchedule });
  };

  const addTimeSlot = (dayKey: string) => {
    const daySchedule = settings.availability_schedule[dayKey];
    const newSlot = { start: '09:00', end: '10:00' };
    const newSchedule = {
      ...settings.availability_schedule,
      [dayKey]: {
        ...daySchedule,
        slots: [...daySchedule.slots, newSlot]
      }
    };
    updateSettings({ availability_schedule: newSchedule });
  };

  const removeTimeSlot = (dayKey: string, slotIndex: number) => {
    const daySchedule = settings.availability_schedule[dayKey];
    const newSlots = daySchedule.slots.filter((_, index) => index !== slotIndex);
    const newSchedule = {
      ...settings.availability_schedule,
      [dayKey]: {
        ...daySchedule,
        slots: newSlots
      }
    };
    updateSettings({ availability_schedule: newSchedule });
  };

  const updateTimeSlot = (dayKey: string, slotIndex: number, field: 'start' | 'end', value: string) => {
    const daySchedule = settings.availability_schedule[dayKey];
    const newSlots = daySchedule.slots.map((slot, index) => 
      index === slotIndex ? { ...slot, [field]: value } : slot
    );
    const newSchedule = {
      ...settings.availability_schedule,
      [dayKey]: {
        ...daySchedule,
        slots: newSlots
      }
    };
    updateSettings({ availability_schedule: newSchedule });
  };

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

            {/* Booking Method Selection */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Booking Method</Label>
              
              {/* Calendly Option */}
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  id="use-calendly"
                  name="booking-method"
                  checked={useCalendly}
                  onChange={(e) => setUseCalendly(e.target.checked)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <Label htmlFor="use-calendly" className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Use Calendly Integration
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Connect your existing Calendly account for booking management
                  </p>
                  {useCalendly && (
                    <div className="mt-2">
                      <Input
                        placeholder="Enter your Calendly link (e.g., https://calendly.com/yourname)"
                        value={calendlyLink}
                        onChange={(e) => setCalendlyLink(e.target.value)}
                        className="max-w-md"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Manual Scheduling Option */}
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  id="use-manual"
                  name="booking-method"
                  checked={!useCalendly}
                  onChange={(e) => setUseCalendly(!e.target.checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="use-manual" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Manual Availability Schedule
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Set your own availability schedule below
                  </p>
                </div>
              </div>
            </div>

            {/* Availability Schedule - Only show if not using Calendly */}
            {!useCalendly && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Weekly Availability</Label>
                  <Badge variant="outline" className="text-xs">
                    Set your available time slots for each day
                  </Badge>
                </div>

                <div className="space-y-4">
                  {days.map(({ key, label }) => {
                    const daySchedule = settings.availability_schedule[key];
                    
                    return (
                      <div key={key} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Switch
                              checked={daySchedule.enabled}
                              onCheckedChange={(enabled) => handleDayToggle(key, enabled)}
                              disabled={saving}
                            />
                            <Label className="font-medium">{label}</Label>
                          </div>
                          {daySchedule.enabled && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addTimeSlot(key)}
                              disabled={saving}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Slot
                            </Button>
                          )}
                        </div>

                        {daySchedule.enabled && (
                          <div className="space-y-2 ml-8">
                            {daySchedule.slots.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                No time slots set. Click "Add Slot" to add availability.
                              </p>
                            ) : (
                              daySchedule.slots.map((slot, slotIndex) => (
                                <div key={slotIndex} className="flex items-center space-x-2">
                                  <Select
                                    value={slot.start}
                                    onValueChange={(value) => updateTimeSlot(key, slotIndex, 'start', value)}
                                    disabled={saving}
                                  >
                                    <SelectTrigger className="w-24">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {commonTimeSlots.map(time => (
                                        <SelectItem key={time} value={time}>{time}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <span className="text-sm text-muted-foreground">to</span>
                                  <Select
                                    value={slot.end}
                                    onValueChange={(value) => updateTimeSlot(key, slotIndex, 'end', value)}
                                    disabled={saving}
                                  >
                                    <SelectTrigger className="w-24">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {commonTimeSlots.map(time => (
                                        <SelectItem key={time} value={time}>{time}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeTimeSlot(key, slotIndex)}
                                    disabled={saving}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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

            {/* Status Summary */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-green-900">
                    Discovery Call Setup Complete
                  </p>
                  <ul className="text-green-800 space-y-1">
                    <li>✓ Discovery calls enabled</li>
                    <li>✓ {settings.discovery_call_duration} minute duration set</li>
                    {useCalendly ? (
                      <li>✓ Calendly integration configured</li>
                    ) : (
                      <li>✓ Manual availability schedule configured</li>
                    )}
                    {settings.prep_notes && <li>✓ Preparation notes added</li>}
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