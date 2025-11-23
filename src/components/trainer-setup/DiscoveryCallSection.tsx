import { useState, useEffect } from "react";
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

// Helper function to check if two time slots overlap
const checkTimeOverlap = (slot1: { start: string; end: string }, slot2: { start: string; end: string }) => {
  // Convert time strings to minutes for easier comparison
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const slot1Start = timeToMinutes(slot1.start);
  const slot1End = timeToMinutes(slot1.end);
  const slot2Start = timeToMinutes(slot2.start);
  const slot2End = timeToMinutes(slot2.end);

  // Check if slots overlap: slot1 starts before slot2 ends AND slot2 starts before slot1 ends
  return slot1Start < slot2End && slot2Start < slot1End;
};

// Helper function to find a non-overlapping default time slot
const findAvailableDefaultSlot = (existingSlots: { start: string; end: string }[]) => {
  const timeSlots = [
    { start: '07:00', end: '08:00' },
    { start: '08:00', end: '09:00' },
    { start: '09:00', end: '10:00' },
    { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' },
    { start: '12:00', end: '13:00' },
    { start: '13:00', end: '14:00' },
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' },
    { start: '16:00', end: '17:00' },
    { start: '17:00', end: '18:00' },
    { start: '18:00', end: '19:00' },
    { start: '19:00', end: '20:00' },
  ];

  for (const timeSlot of timeSlots) {
    const hasOverlap = existingSlots.some(existingSlot => 
      checkTimeOverlap(timeSlot, existingSlot)
    );
    if (!hasOverlap) {
      return timeSlot;
    }
  }
  
  // If all standard slots overlap, return a late evening slot
  return { start: '20:00', end: '21:00' };
};

export function DiscoveryCallSection({ formData, updateFormData, errors }: DiscoveryCallSectionProps) {
  const { settings: discoverySettings, loading: discoveryLoading, updateSettings } = useDiscoveryCallSettings();
  const { toast } = useToast();
  const [prepNotesLocal, setPrepNotesLocal] = useState("");
  
  // Sync local state when settings load/update
  useEffect(() => {
    if (discoverySettings?.prep_notes && prepNotesLocal === "") {
      setPrepNotesLocal(discoverySettings.prep_notes);
    }
  }, [discoverySettings?.prep_notes, prepNotesLocal]);

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
                  checked={discoverySettings.offers_discovery_call === true}
                  onCheckedChange={(checked) => {
                    updateSettings({ offers_discovery_call: checked });
                    // Sync with profile form for step completion logic
                    updateFormData({ free_discovery_call: checked });
                  }}
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

                  {/* Prep Notes */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Preparation Notes (Optional)
                    </Label>
                    <Textarea
                      placeholder="What should clients know before the call? What should they prepare?"
                      value={prepNotesLocal}
                      onChange={(e) => setPrepNotesLocal(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => updateSettings({ prep_notes: prepNotesLocal })}>
                        Save Notes
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        These notes will be shown to clients when they book a discovery call
                      </p>
                    </div>
                  </div>

                  {/* Booking Method Selection */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Booking Method</Label>
                    
                    {/* Calendly Option */}
                    <div className="space-y-2">
                      <Label htmlFor="calendar_link">Booking Link (Calendly, etc.)</Label>
                      <Input
                        id="calendar_link"
                        value={formData.calendar_link || ""}
                        onChange={(e) => updateFormData({ calendar_link: e.target.value })}
                        placeholder="https://calendly.com/your-username or your booking link"
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
                      <p className="text-xs text-muted-foreground">
                        Add your Calendly link or other booking system URL
                      </p>
                    </div>

                    {/* Availability Schedule */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Set Your Weekly Availability</Label>
                        <Badge variant="outline" className="text-xs">
                          For discovery calls only
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                          const daySchedule = discoverySettings.availability_schedule?.[day] || { enabled: false, slots: [] };
                          const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
                          
                          return (
                            <div key={day} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <Switch
                                    checked={daySchedule.enabled}
                                    onCheckedChange={(enabled) => {
                                      const newSchedule = {
                                        ...discoverySettings.availability_schedule,
                                        [day]: { ...daySchedule, enabled }
                                      };
                                      updateSettings({ availability_schedule: newSchedule });
                                    }}
                                  />
                                  <Label className="font-medium">{dayLabel}</Label>
                                </div>
                                {daySchedule.enabled && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      // Find a non-overlapping default time slot
                                      const newSlot = findAvailableDefaultSlot(daySchedule.slots);
                                      
                                      const newSchedule = {
                                        ...discoverySettings.availability_schedule,
                                        [day]: {
                                          ...daySchedule,
                                          slots: [...daySchedule.slots, newSlot]
                                        }
                                      };
                                      updateSettings({ availability_schedule: newSchedule });
                                    }}
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
                                     daySchedule.slots.map((slot, slotIndex) => {
                                       // Check if this slot overlaps with any other slot
                                       const otherSlots = daySchedule.slots.filter((_, i) => i !== slotIndex);
                                       const hasOverlap = otherSlots.some(existingSlot => 
                                         checkTimeOverlap(slot, existingSlot)
                                       );
                                       
                                       return (
                                       <div key={slotIndex} className={`flex items-center space-x-2 ${hasOverlap ? 'bg-red-50 border border-red-200 rounded p-2' : ''}`}>
                                         {hasOverlap && (
                                           <Badge variant="destructive" className="text-xs">
                                             Overlaps
                                           </Badge>
                                         )}
                                        <Select
                                          value={slot.start}
                                          onValueChange={(value) => {
                                            const updatedSlot = { ...slot, start: value };
                                            const otherSlots = daySchedule.slots.filter((_, i) => i !== slotIndex);
                                            
                                            // Check for overlaps with other slots
                                            const hasOverlap = otherSlots.some(existingSlot => 
                                              checkTimeOverlap(updatedSlot, existingSlot)
                                            );
                                            
                                            if (hasOverlap) {
                                              toast({
                                                title: "Time Slot Overlap",
                                                description: "This time slot would overlap with another slot. Please choose a different time.",
                                                variant: "destructive",
                                              });
                                              return;
                                            }
                                            
                                            const newSlots = daySchedule.slots.map((s, i) => 
                                              i === slotIndex ? updatedSlot : s
                                            );
                                            const newSchedule = {
                                              ...discoverySettings.availability_schedule,
                                              [day]: { ...daySchedule, slots: newSlots }
                                            };
                                            updateSettings({ availability_schedule: newSchedule });
                                          }}
                                        >
                                          <SelectTrigger className="w-24">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                             {['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map(time => (
                                              <SelectItem key={time} value={time}>{time}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <span className="text-sm text-muted-foreground">to</span>
                                        <Select
                                          value={slot.end}
                                          onValueChange={(value) => {
                                            const updatedSlot = { ...slot, end: value };
                                            const otherSlots = daySchedule.slots.filter((_, i) => i !== slotIndex);
                                            
                                            // Check for overlaps with other slots
                                            const hasOverlap = otherSlots.some(existingSlot => 
                                              checkTimeOverlap(updatedSlot, existingSlot)
                                            );
                                            
                                            if (hasOverlap) {
                                              toast({
                                                title: "Time Slot Overlap",
                                                description: "This time slot would overlap with another slot. Please choose a different time.",
                                                variant: "destructive",
                                              });
                                              return;
                                            }
                                            
                                            const newSlots = daySchedule.slots.map((s, i) => 
                                              i === slotIndex ? updatedSlot : s
                                            );
                                            const newSchedule = {
                                              ...discoverySettings.availability_schedule,
                                              [day]: { ...daySchedule, slots: newSlots }
                                            };
                                            updateSettings({ availability_schedule: newSchedule });
                                          }}
                                        >
                                          <SelectTrigger className="w-24">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map(time => (
                                              <SelectItem key={time} value={time}>{time}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            const newSlots = daySchedule.slots.filter((_, i) => i !== slotIndex);
                                            const newSchedule = {
                                              ...discoverySettings.availability_schedule,
                                              [day]: { ...daySchedule, slots: newSlots }
                                            };
                                            updateSettings({ availability_schedule: newSchedule });
                                          }}
                                        >
                                           <Trash2 className="w-4 h-4 text-red-500" />
                                          </Button>
                                        </div>
                                      );
                                    })
                                  )}
                                 </div>
                               )}
                             </div>
                           );
                         })}
                       </div>
                     </div>
                  </div>

                  {/* Status Summary */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-green-900">
                          Discovery Call Setup
                        </p>
                        <ul className="text-green-800 space-y-1">
                          <li>✓ Discovery calls enabled</li>
                          <li>✓ {discoverySettings.discovery_call_duration} minute duration set</li>
                          {formData.calendar_link ? (
                            <li>✓ External booking link configured</li>
                          ) : (
                            <li>✓ Manual availability schedule available</li>
                          )}
                          {discoverySettings.prep_notes && <li>✓ Preparation notes added</li>}
                        </ul>
                      </div>
                    </div>
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