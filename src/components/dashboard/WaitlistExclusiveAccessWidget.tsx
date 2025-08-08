import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { WaitlistExclusiveAccess } from '@/components/client/WaitlistExclusiveAccess';
import { Loader2 } from 'lucide-react';

interface ExclusiveTrainer {
  id: string;
  first_name?: string;
  last_name?: string;
  profile_photo_url?: string;
  tagline?: string;
  location?: string;
  hourly_rate?: number;
  rating?: number;
  package_options?: any;
  exclusive_until: string;
}

export function WaitlistExclusiveAccessWidget() {
  const { user } = useAuth();
  const [exclusiveTrainers, setExclusiveTrainers] = useState<ExclusiveTrainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExclusiveAccess = async () => {
      if (!user?.id) return;

      try {
        // Get active exclusive periods for trainers where user is on waitlist
        const { data: exclusivePeriods, error: periodsError } = await supabase
          .from('waitlist_exclusive_periods')
          .select(`
            coach_id,
            expires_at,
            coach_waitlists!inner(client_id)
          `)
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString())
          .eq('coach_waitlists.client_id', user.id)
          .eq('coach_waitlists.status', 'active');

        if (periodsError) throw periodsError;

        if (exclusivePeriods && exclusivePeriods.length > 0) {
          // Get trainer profiles for exclusive periods
          const coachIds = exclusivePeriods.map(p => p.coach_id);
          
          const { data: trainers, error: trainersError } = await supabase
            .from('profiles')
            .select(`
              id,
              first_name,
              last_name,
              profile_photo_url,
              tagline,
              location,
              hourly_rate,
              rating,
              package_options
            `)
            .in('id', coachIds)
            .eq('user_type', 'trainer');

          if (trainersError) throw trainersError;

          // Combine trainer data with exclusive period info
          const exclusiveData = trainers?.map(trainer => {
            const period = exclusivePeriods.find(p => p.coach_id === trainer.id);
            return {
              ...trainer,
              package_options: Array.isArray(trainer.package_options) ? trainer.package_options : [],
              exclusive_until: period?.expires_at || ''
            };
          }).filter(t => t.exclusive_until) || [];

          setExclusiveTrainers(exclusiveData);
        }
      } catch (error) {
        console.error('Error fetching exclusive access:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExclusiveAccess();

    // Set up real-time subscription for exclusive periods
    const subscription = supabase
      .channel('exclusive-periods-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waitlist_exclusive_periods'
        },
        () => {
          fetchExclusiveAccess();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Checking for early access...</span>
        </CardContent>
      </Card>
    );
  }

  if (exclusiveTrainers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {exclusiveTrainers.map(trainer => (
        <WaitlistExclusiveAccess
          key={trainer.id}
          trainer={trainer}
          exclusiveUntil={trainer.exclusive_until}
        />
      ))}
    </div>
  );
}