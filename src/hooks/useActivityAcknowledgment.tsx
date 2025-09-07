import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useActivityAcknowledgment = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const acknowledgeActivity = async (alertId: string, note?: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('acknowledge_activity', {
        p_alert_id: alertId,
        p_note: note
      });

      if (error) throw error;

      toast({
        title: "Activity acknowledged",
        description: "The activity has been marked as acknowledged.",
      });

      return true;
    } catch (error: any) {
      console.error('Error acknowledging activity:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to acknowledge activity",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkIfAcknowledged = async (alertId: string) => {
    try {
      const { data, error } = await supabase.rpc('is_activity_acknowledged', {
        p_alert_id: alertId
      });

      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error('Error checking acknowledgment status:', error);
      return false;
    }
  };

  return {
    acknowledgeActivity,
    checkIfAcknowledged,
    loading
  };
};