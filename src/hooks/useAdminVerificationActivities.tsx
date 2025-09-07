import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface VerificationActivity {
  id: string;
  activity_type: 'admin_verification_action' | 'certificate_expiring' | 'certificate_expired';
  trainer_id: string;
  trainer_name: string;
  check_type: string;
  status: string;
  created_at: string;
  expires_at?: string;
  priority: 'high' | 'normal';
  days_until_expiry?: number;
}

export const useAdminVerificationActivities = () => {
  const [activities, setActivities] = useState<VerificationActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_admin_verification_activities', {
        days_back: 7
      });

      if (error) {
        console.error('Error fetching verification activities:', error);
        return;
      }

      // Map the data to match our interface types
      const mappedActivities: VerificationActivity[] = (data || []).map(item => ({
        id: item.id,
        activity_type: item.activity_type as VerificationActivity['activity_type'],
        trainer_id: item.trainer_id,
        trainer_name: item.trainer_name,
        check_type: item.check_type,
        status: item.status,
        created_at: item.created_at,
        expires_at: item.expires_at,
        priority: item.priority as 'high' | 'normal',
        days_until_expiry: item.days_until_expiry
      }));

      setActivities(mappedActivities);
    } catch (error) {
      console.error('Error fetching verification activities:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    loading,
    refetch: fetchActivities
  };
};