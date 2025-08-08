import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface DiscoveryCallBooking {
  id?: string;
  trainer_id: string;
  client_id: string;
  scheduled_for: string;
  duration_minutes: number;
  status: string;
  booking_notes?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  datetime: Date;
}

export function useDiscoveryCallBooking() {
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateTimeSlots = (date: Date, trainerSettings: any): TimeSlot[] => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const schedule = trainerSettings?.discovery_call_availability_schedule?.[dayName];
    
    if (!schedule?.enabled || !schedule?.slots || schedule.slots.length === 0) {
      return [];
    }

    // Use the actual time slots defined by the trainer
    const slots: TimeSlot[] = [];
    
    schedule.slots.forEach((slot: { start: string; end: string }) => {
      // Generate 15-minute slots within the defined time range
      const startTime = new Date(`2000-01-01T${slot.start}:00`);
      const endTime = new Date(`2000-01-01T${slot.end}:00`);
      const duration = trainerSettings.discovery_call_duration || 15;
      
      while (startTime < endTime) {
        const timeString = startTime.toLocaleTimeString('en-GB', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        const datetime = new Date(date);
        datetime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
        
        slots.push({
          time: timeString,
          available: datetime > new Date(), // Only future slots are available
          datetime
        });
        
        // Add the duration to get the next slot
        startTime.setMinutes(startTime.getMinutes() + duration);
      }
    });

    return slots.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
  };

  const getTrainerSettings = async (trainerId: string) => {
    console.log('🔍 Fetching trainer settings for booking modal, trainerId:', trainerId);
    try {
      const { data, error } = await supabase
        .from('discovery_call_settings')
        .select('*')
        .eq('trainer_id', trainerId)
        .eq('offers_discovery_call', true)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching trainer settings:', error);
        return null;
      }

      console.log('✅ Trainer settings fetched for booking:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching trainer settings:', error);
      return null;
    }
  };

  const getAvailableSlots = async (trainerId: string, date: Date) => {
    console.log('Getting available slots for trainer:', trainerId, 'on date:', date);
    setLoading(true);
    try {
      const trainerSettings = await getTrainerSettings(trainerId);
      console.log('Trainer settings:', trainerSettings);
      
      if (!trainerSettings) {
        console.log('No trainer settings found');
        return [];
      }

      // Get existing bookings for this date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: existingBookings } = await supabase
        .from('discovery_calls')
        .select('scheduled_for')
        .eq('trainer_id', trainerId)
        .gte('scheduled_for', startOfDay.toISOString())
        .lte('scheduled_for', endOfDay.toISOString())
        .in('status', ['scheduled', 'rescheduled']);

      console.log('Existing bookings:', existingBookings);

      const bookedTimes = new Set(
        existingBookings?.map(booking => 
          new Date(booking.scheduled_for).toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        ) || []
      );

      const allSlots = generateTimeSlots(date, trainerSettings);
      console.log('Generated slots:', allSlots);
      
      const finalSlots = allSlots.map(slot => ({
        ...slot,
        available: slot.available && !bookedTimes.has(slot.time)
      }));
      
      console.log('Final available slots:', finalSlots);
      return finalSlots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const bookDiscoveryCall = async (
    trainerId: string, 
    selectedDateTime: Date, 
    duration: number,
    notes?: string,
    isReschedule?: boolean
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book a discovery call",
        variant: "destructive",
      });
      return null;
    }

    setBooking(true);
    try {
      const { data, error } = await supabase
        .from('discovery_calls')
        .insert({
          trainer_id: trainerId,
          client_id: user.id,
          scheduled_for: selectedDateTime.toISOString(),
          duration_minutes: duration,
          status: 'scheduled',
          booking_notes: notes
        })
        .select()
        .single();

      if (error) {
        console.error('Error booking discovery call:', error);
        toast({
          title: "Booking failed",
          description: "Failed to book your discovery call. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      // The engagement stage will be updated automatically by the database trigger
      // when the discovery call is inserted, so we don't need to manually update it here
      console.log('Discovery call created successfully, database trigger will update engagement stage');

      // Create activity alert for trainer (skip if this is a reschedule)
      if (!isReschedule) {
        console.log('Creating activity alert for trainer:', trainerId);
        try {
          const alertResult = await supabase
            .from('alerts')
            .insert({
              alert_type: 'discovery_call_booked',
              title: 'New Discovery Call Booked!',
              content: `A client has booked a discovery call for ${selectedDateTime.toLocaleDateString()} at ${selectedDateTime.toLocaleTimeString()}`,
              created_by: trainerId,
              target_audience: ["trainers"],
              metadata: {
                client_id: user.id,
                discovery_call_id: data.id,
                scheduled_for: selectedDateTime.toISOString(),
                trainer_id: trainerId
              },
              is_active: true,
              priority: 1
            });
          
          console.log('Alert creation result:', alertResult);
          if (alertResult.error) {
            console.error('Error creating activity alert:', alertResult.error);
          }
        } catch (alertError) {
          console.error('Error creating activity alert:', alertError);
        }
      } else {
        console.log('Skipping alert creation for reschedule booking');
      }

      // Send confirmation emails in the background
      try {
        // Send confirmation email to client
        await supabase.functions.invoke('send-discovery-call-email', {
          body: {
            type: 'confirmation',
            discoveryCallId: data.id
          }
        });

        // Send notification email to trainer
        await supabase.functions.invoke('send-discovery-call-email', {
          body: {
            type: 'trainer_notification',
            discoveryCallId: data.id,
            notificationType: 'new_booking'
          }
        });
      } catch (emailError) {
        console.error('Error sending confirmation emails:', emailError);
        // Don't fail the booking if emails fail
      }

      toast({
        title: "Discovery call booked!",
        description: "Confirmation emails have been sent to you and the trainer.",
      });

      return data;
    } catch (error) {
      console.error('Error booking discovery call:', error);
      toast({
        title: "Booking failed", 
        description: "Failed to book your discovery call. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setBooking(false);
    }
  };

  return {
    loading,
    booking,
    getTrainerSettings,
    getAvailableSlots,
    bookDiscoveryCall
  };
}