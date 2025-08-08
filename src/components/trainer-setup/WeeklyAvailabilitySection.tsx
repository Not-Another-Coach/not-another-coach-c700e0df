import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Trash2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
}

interface WeeklySchedule {
  [key: string]: DaySchedule;
}

interface WeeklyAvailabilitySectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export function WeeklyAvailabilitySection({ formData, updateFormData }: WeeklyAvailabilitySectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState<WeeklySchedule>({
    monday: { enabled: false, slots: [] },
    tuesday: { enabled: false, slots: [] },
    wednesday: { enabled: false, slots: [] },
    thursday: { enabled: false, slots: [] },
    friday: { enabled: false, slots: [] },
    saturday: { enabled: false, slots: [] },
    sunday: { enabled: false, slots: [] }
  });

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const timeOptions = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
  ];

  // Load existing schedule from coach_availability_settings
  useEffect(() => {
    if (user) {
      fetchSchedule();
    }
  }, [user]);

  const fetchSchedule = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('coach_availability_settings')
        .select('*')
        .eq('coach_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching schedule:', error);
        return;
      }

      // For now, initialize with empty schedule - we'll add a new column later
      setSchedule({
        monday: { enabled: false, slots: [] },
        tuesday: { enabled: false, slots: [] },
        wednesday: { enabled: false, slots: [] },
        thursday: { enabled: false, slots: [] },
        friday: { enabled: false, slots: [] },
        saturday: { enabled: false, slots: [] },
        sunday: { enabled: false, slots: [] }
      });
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (dayKey: string, enabled: boolean) => {
    setSchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        enabled
      }
    }));
  };

  const addTimeSlot = (dayKey: string) => {
    const newSlot = { start: '09:00', end: '10:00' };
    setSchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: [...prev[dayKey].slots, newSlot]
      }
    }));
  };

  const removeTimeSlot = (dayKey: string, slotIndex: number) => {
    setSchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: prev[dayKey].slots.filter((_, index) => index !== slotIndex)
      }
    }));
  };

  const updateTimeSlot = (dayKey: string, slotIndex: number, field: 'start' | 'end', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: prev[dayKey].slots.map((slot, index) => 
          index === slotIndex ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  const setQuickSchedule = (type: 'weekdays' | 'weekends' | 'clear') => {
    const newSchedule = { ...schedule };
    
    if (type === 'clear') {
      Object.keys(newSchedule).forEach(day => {
        newSchedule[day] = { enabled: false, slots: [] };
      });
    } else if (type === 'weekdays') {
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
        newSchedule[day] = { 
          enabled: true, 
          slots: [{ start: '09:00', end: '17:00' }] 
        };
      });
    } else if (type === 'weekends') {
      ['saturday', 'sunday'].forEach(day => {
        newSchedule[day] = { 
          enabled: true, 
          slots: [{ start: '10:00', end: '16:00' }] 
        };
      });
    }
    
    setSchedule(newSchedule);
  };

  const saveSchedule = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // For now, just save to formData - we'll need to add a proper column later
      updateFormData({ weekly_availability_schedule: schedule });
      
      toast({
        title: "Schedule Saved",
        description: "Your weekly availability has been saved.",
      });
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: "Error",
        description: "Failed to save schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Weekly Availability
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Set your general availability for training sessions throughout the week
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Schedule Templates */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Templates</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickSchedule('weekdays')}
              disabled={saving}
            >
              Weekdays (9AM-5PM)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickSchedule('weekends')}
              disabled={saving}
            >
              Weekends (10AM-4PM)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickSchedule('clear')}
              disabled={saving}
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="space-y-4">
          {days.map(({ key, label }) => {
            const daySchedule = schedule[key];
            
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
                    {daySchedule.enabled && daySchedule.slots.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {daySchedule.slots.length} slot{daySchedule.slots.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
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
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map(time => (
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
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map(time => (
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
                            <Trash2 className="w-4 h-4 text-destructive" />
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

        {/* Bank Holiday Setting */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Bank Holiday Availability</Label>
              <p className="text-sm text-muted-foreground">
                Are you available to work on UK bank holidays?
              </p>
            </div>
            <Switch
              checked={formData.works_bank_holidays || false}
              onCheckedChange={(checked) => updateFormData({ works_bank_holidays: checked })}
              disabled={saving}
            />
          </div>
        </div>

        <Button 
          onClick={saveSchedule} 
          disabled={saving}
          className="w-full"
        >
          {saving ? 'Saving...' : 'Save Weekly Schedule'}
        </Button>
      </CardContent>
    </Card>
  );
}