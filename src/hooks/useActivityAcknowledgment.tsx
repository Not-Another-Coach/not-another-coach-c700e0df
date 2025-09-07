import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useActivityAcknowledgment = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const markAsRead = async (alertId: string, note?: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('acknowledge_activity', {
        p_alert_id: alertId,
        p_note: note
      });

      if (error) throw error;

      toast({
        title: "Marked as read",
        description: "The activity has been marked as read.",
      });

      return true;
    } catch (error: any) {
      console.error('Error marking activity as read:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to mark activity as read",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkIfRead = async (alertId: string) => {
    try {
      const { data, error } = await supabase.rpc('is_activity_acknowledged', {
        p_alert_id: alertId
      });

      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error('Error checking read status:', error);
      return false;
    }
  };

  return {
    markAsRead,
    checkIfRead,
    loading
  };
};