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
    const schedule = trainerSettings?.availability_schedule?.[dayName];
    
    if (!schedule?.enabled) {
      return [];
    }

    // Generate basic time slots (this will be enhanced in Phase 3 with real calendar integration)
    const baseSlots = [
      '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
    ];

    return baseSlots.map(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const datetime = new Date(date);
      datetime.setHours(hours, minutes, 0, 0);
      
      return {
        time,
        available: datetime > new Date(), // Only future slots are available
        datetime
      };
    });
  };

  const getTrainerSettings = async (trainerId: string) => {
    try {
      const { data, error } = await supabase
        .from('trainer_availability_settings')
        .select('*')
        .eq('trainer_id', trainerId)
        .eq('offers_discovery_call', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching trainer settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching trainer settings:', error);
      return null;
    }
  };

  const getAvailableSlots = async (trainerId: string, date: Date) => {
    setLoading(true);
    try {
      const trainerSettings = await getTrainerSettings(trainerId);
      
      if (!trainerSettings) {
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

      const bookedTimes = new Set(
        existingBookings?.map(booking => 
          new Date(booking.scheduled_for).toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        ) || []
      );

      const allSlots = generateTimeSlots(date, trainerSettings);
      
      return allSlots.map(slot => ({
        ...slot,
        available: slot.available && !bookedTimes.has(slot.time)
      }));
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
    notes?: string
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