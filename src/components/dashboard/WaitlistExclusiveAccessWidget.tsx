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

      console.log('🔥 WaitlistExclusiveAccessWidget: Fetching exclusive access for user:', user.id);

      try {
        // First, get active exclusive periods
        const { data: exclusivePeriods, error: periodsError } = await supabase
          .from('waitlist_exclusive_periods')
          .select('coach_id, expires_at, created_at')
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString());

        console.log('🔥 WaitlistExclusiveAccessWidget: All exclusive periods:', { exclusivePeriods, periodsError });

        if (periodsError) throw periodsError;

        if (!exclusivePeriods || exclusivePeriods.length === 0) {
          console.log('🔥 WaitlistExclusiveAccessWidget: No active exclusive periods found');
          setLoading(false);
          return;
        }

        // Then check which ones the user has waitlist access to
        const coachIds = exclusivePeriods.map(p => p.coach_id);
        const { data: waitlistEntries, error: waitlistError } = await supabase
          .from('coach_waitlists')
          .select('coach_id, joined_at')
          .eq('client_id', user.id)
          .eq('status', 'active')
          .in('coach_id', coachIds);

        console.log('🔥 WaitlistExclusiveAccessWidget: User waitlist entries:', { waitlistEntries, waitlistError });

        if (waitlistError) throw waitlistError;

        if (!waitlistEntries || waitlistEntries.length === 0) {
          console.log('🔥 WaitlistExclusiveAccessWidget: User not on any relevant waitlists');
          setLoading(false);
          return;
        }

        // Filter exclusive periods to only those where user joined waitlist BEFORE the exclusive period started
        const relevantPeriods = exclusivePeriods.filter(period => {
          const waitlistEntry = waitlistEntries.find(entry => entry.coach_id === period.coach_id);
          if (!waitlistEntry) return false;
          
          // Only show access if client joined waitlist before exclusive period started
          const joinedAt = new Date(waitlistEntry.joined_at);
          const periodStarted = new Date(period.created_at);
          return joinedAt < periodStarted;
        });

        console.log('🔥 WaitlistExclusiveAccessWidget: Relevant periods for user:', relevantPeriods);

        if (relevantPeriods.length > 0) {
          console.log('🔥 WaitlistExclusiveAccessWidget: Found exclusive periods, fetching trainer profiles');
          // Get trainer profiles for exclusive periods
          const relevantCoachIds = relevantPeriods.map(p => p.coach_id);
          
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
            .in('id', relevantCoachIds)
            .eq('user_type', 'trainer');

          console.log('🔥 WaitlistExclusiveAccessWidget: Trainer profiles query result:', { trainers, trainersError });

          if (trainersError) throw trainersError;

          // Combine trainer data with exclusive period info
          const exclusiveData = trainers?.map(trainer => {
            const period = relevantPeriods.find(p => p.coach_id === trainer.id);
            return {
              ...trainer,
              package_options: Array.isArray(trainer.package_options) ? trainer.package_options : [],
              exclusive_until: period?.expires_at || ''
            };
          }).filter(t => t.exclusive_until) || [];

          console.log('🔥 WaitlistExclusiveAccessWidget: Final exclusive trainers data:', exclusiveData);
          setExclusiveTrainers(exclusiveData);
        } else {
          console.log('🔥 WaitlistExclusiveAccessWidget: No relevant exclusive periods for this user');
        }
      } catch (error) {
        console.error('🔥 WaitlistExclusiveAccessWidget: Error fetching exclusive access:', error);
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