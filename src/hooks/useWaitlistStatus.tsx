import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface WaitlistStatus {
  isOnWaitlist: boolean;
  waitlistEntry?: any;
  loading: boolean;
}

interface UseWaitlistStatusProps {
  trainerId?: string;
  onEngagementChange?: () => void;
}

export function useWaitlistStatus(trainerId?: string, onEngagementChange?: () => void) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<WaitlistStatus>({
    isOnWaitlist: false,
    loading: true
  });

  const checkWaitlistStatus = async () => {
    if (!user?.id || !trainerId) {
      setStatus({ isOnWaitlist: false, loading: false });
      return;
    }

    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase
        .from('coach_waitlists')
        .select('*')
        .eq('client_id', user.id)
        .eq('coach_id', trainerId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('Error checking waitlist status:', error);
        setStatus({ isOnWaitlist: false, loading: false });
        return;
      }

      setStatus({
        isOnWaitlist: !!data,
        waitlistEntry: data,
        loading: false
      });
    } catch (error) {
      console.error('Error in checkWaitlistStatus:', error);
      setStatus({ isOnWaitlist: false, loading: false });
    }
  };

  const joinWaitlist = async (goals?: string, estimatedStartDate?: string) => {
    if (!user?.id || !trainerId) {
      toast({
        title: "Error",
        description: "Please log in to join the waitlist",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('coach_waitlists')
        .insert({
          client_id: user.id,
          coach_id: trainerId,
          client_goals: goals,
          estimated_start_date: estimatedStartDate,
          status: 'active'
        });

      if (error) {
        console.error('Error joining waitlist:', error);
        toast({
          title: "Error",
          description: "Failed to join waitlist. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Joined Waitlist",
        description: "You've been added to the trainer's waitlist successfully!"
      });

      // Refresh status and trigger engagement change
      await checkWaitlistStatus();
      onEngagementChange?.();
      return true;
    } catch (error) {
      console.error('Error in joinWaitlist:', error);
      toast({
        title: "Error",
        description: "Failed to join waitlist. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const leaveWaitlist = async () => {
    if (!user?.id || !trainerId || !status.waitlistEntry) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('coach_waitlists')
        .delete()
        .eq('id', status.waitlistEntry.id);

      if (error) {
        console.error('Error leaving waitlist:', error);
        toast({
          title: "Error",
          description: "Failed to leave waitlist. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Left Waitlist",
        description: "You've been removed from the waitlist successfully."
      });

      // Refresh status and trigger engagement change
      await checkWaitlistStatus();
      onEngagementChange?.();
      return true;
    } catch (error) {
      console.error('Error in leaveWaitlist:', error);
      toast({
        title: "Error",
        description: "Failed to leave waitlist. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    checkWaitlistStatus();
  }, [user?.id, trainerId]);

  return {
    ...status,
    joinWaitlist,
    leaveWaitlist,
    refreshStatus: checkWaitlistStatus
  };
}