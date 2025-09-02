import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface OptimizedTrainer {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  specialties: string[];
  location: string;
  hourlyRate: number;
  profilePhotoUrl?: string;
  rating: number;
  status: 'saved' | 'shortlisted' | 'discovery' | 'declined' | 'waitlist';
  statusLabel: string;
  statusColor: string;
  hasExclusiveAccess?: boolean;
}

// Cache for trainer data to prevent refetching
const trainerCache = new Map<string, any>();
const cacheExpiry = new Map<string, number>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useOptimizedTrainers() {
  const { user } = useAuth();
  const [trainers, setTrainers] = useState<OptimizedTrainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [engagements, setEngagements] = useState<any[]>([]);

  // Memoized trainer IDs to prevent unnecessary re-fetches
  const trainerIds = useMemo(() => {
    return [...new Set(engagements.map(e => e.trainer_id))];
  }, [engagements]);

  // Fetch engagement data only
  const fetchEngagements = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('client_trainer_engagement')
        .select('*')
        .eq('client_id', user.id);

      if (error) {
        console.error('Error fetching engagements:', error);
        return;
      }

      setEngagements(data || []);
    } catch (error) {
      console.error('Error in fetchEngagements:', error);
    }
  }, [user?.id]);

  // Optimized trainer data fetching with caching
  const fetchTrainerData = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return [];

    // Check cache first
    const cachedTrainers: any[] = [];
    const uncachedIds: string[] = [];

    ids.forEach(id => {
      const cached = trainerCache.get(id);
      const expiry = cacheExpiry.get(id);
      
      if (cached && expiry && Date.now() < expiry) {
        cachedTrainers.push(cached);
      } else {
        uncachedIds.push(id);
      }
    });

    // Fetch uncached trainers
    if (uncachedIds.length > 0) {
      try {
        const { data: trainerProfiles, error: profileError } = await supabase
          .from('v_trainers')
          .select(`
            id,
            first_name,
            last_name,
            location,
            specializations,
            profile_photo_url,
            hourly_rate
          `)
          .in('id', uncachedIds);

        if (profileError) {
          console.error('Error fetching trainer data:', profileError);
          return cachedTrainers;
        }

        // Cache the new data
        trainerProfiles?.forEach(trainer => {
          trainerCache.set(trainer.id, trainer);
          cacheExpiry.set(trainer.id, Date.now() + CACHE_DURATION);
        });

        return [...cachedTrainers, ...(trainerProfiles || [])];
      } catch (error) {
        console.error('Error in fetchTrainerData:', error);
        return cachedTrainers;
      }
    }

    return cachedTrainers;
  }, []);

  // Transform trainers with engagement status
  const transformTrainers = useCallback((trainerData: any[], engagementData: any[]): OptimizedTrainer[] => {
    return trainerData.map(trainer => {
      const engagement = engagementData.find(e => e.trainer_id === trainer.id);
      
      let status: OptimizedTrainer['status'] = 'saved';
      let statusLabel = 'Saved';
      let statusColor = 'bg-blue-100 text-blue-800';

      if (engagement) {
        switch (engagement.stage) {
          case 'shortlisted':
            status = 'shortlisted';
            statusLabel = 'Shortlisted';
            statusColor = 'bg-yellow-100 text-yellow-800';
            break;
          case 'discovery_in_progress':
          case 'getting_to_know_your_coach':
          case 'discovery_completed':
            status = 'discovery';
            statusLabel = 'Discovery Active';
            statusColor = 'bg-purple-100 text-purple-800';
            break;
          case 'matched':
            status = 'discovery';
            statusLabel = 'Matched';
            statusColor = 'bg-green-100 text-green-800';
            break;
          case 'declined':
            status = 'declined';
            statusLabel = 'Declined';
            statusColor = 'bg-red-100 text-red-800';
            break;
        }
      }

      return {
        id: trainer.id,
        name: `${trainer.first_name || ''} ${trainer.last_name || ''}`.trim() || 'Unnamed Trainer',
        firstName: trainer.first_name,
        lastName: trainer.last_name,
        specialties: trainer.specializations || [],
        location: trainer.location || '',
        hourlyRate: trainer.hourly_rate || 0,
        profilePhotoUrl: trainer.profile_photo_url,
        rating: 4.5, // Default rating
        status,
        statusLabel,
        statusColor
      };
    });
  }, []);

  // Main data fetching effect
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchEngagements();
    };

    loadData();
  }, [fetchEngagements]);

  // Fetch trainer data when engagement data changes
  useEffect(() => {
    const loadTrainers = async () => {
      if (trainerIds.length === 0) {
        setTrainers([]);
        setLoading(false);
        return;
      }

      const trainerData = await fetchTrainerData(trainerIds);
      const transformedTrainers = transformTrainers(trainerData, engagements);
      
      setTrainers(transformedTrainers);
      setLoading(false);
    };

    loadTrainers();
  }, [trainerIds, engagements, fetchTrainerData, transformTrainers]);

  // Filter functions
  const getTrainersByStatus = useCallback((status: OptimizedTrainer['status']) => {
    return trainers.filter(t => t.status === status);
  }, [trainers]);

  const getCounts = useMemo(() => ({
    all: trainers.length,
    saved: trainers.filter(t => t.status === 'saved').length,
    shortlisted: trainers.filter(t => t.status === 'shortlisted').length,
    discovery: trainers.filter(t => t.status === 'discovery').length,
    declined: trainers.filter(t => t.status === 'declined').length,
    waitlist: trainers.filter(t => t.status === 'waitlist').length
  }), [trainers]);

  return {
    trainers,
    loading,
    getTrainersByStatus,
    getCounts,
    refresh: fetchEngagements
  };
}