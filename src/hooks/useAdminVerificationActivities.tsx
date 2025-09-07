import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';

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
      const sevenDaysAgo = subDays(new Date(), 7);
      
      // Fetch verification admin actions from alerts
      const { data: alertData, error: alertError } = await supabase
        .from('alerts')
        .select('*')
        .eq('alert_type', 'verification_admin_action')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      const alertActivities: VerificationActivity[] = [];

      if (alertData && !alertError) {
        alertData.forEach(alert => {
          const metadata = alert.metadata as any || {};
          const checkTypeLabel = metadata.check_type === 'cimspa_membership' ? 'CIMSPA Membership' :
                                metadata.check_type === 'insurance_proof' ? 'Professional Insurance' :
                                metadata.check_type === 'first_aid_certification' ? 'First Aid Certification' :
                                'Document';
          
          alertActivities.push({
            id: alert.id,
            activity_type: 'admin_verification_action',
            trainer_id: metadata.trainer_id || '',
            trainer_name: metadata.trainer_name || 'Unknown Trainer',
            check_type: checkTypeLabel,
            status: metadata.action || 'unknown',
            created_at: alert.created_at,
            priority: 'normal'
          });
        });
      }

      // Try to fetch from RPC function as well (if it works)
      let rpcActivities: VerificationActivity[] = [];
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_verification_activities', {
          days_back: 7
        });

        if (rpcData && !rpcError) {
          rpcActivities = (rpcData || []).map(item => ({
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
        }
      } catch (rpcError) {
        console.log('RPC function not available, using alerts only');
      }

      // Combine both sources
      const allActivities = [...alertActivities, ...rpcActivities];
      setActivities(allActivities);
      
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