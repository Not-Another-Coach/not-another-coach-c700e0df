import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useDataSynchronization } from './useDataSynchronization';
import { toast } from 'sonner';

export interface UnifiedTrainer {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  location: string;
  specializations: string[];
  profilePhotoUrl: string | null;
  hourlyRate: number;
  trainingTypes: string[];
  packageOptions: any[];
  testimonials: any[];
  rating: number;
  reviewCount: number;
  offersDiscoveryCall: boolean;
  
  // Status and engagement
  status: 'saved' | 'shortlisted' | 'discovery' | 'declined' | 'waitlist' | 'browsing';
  statusLabel: string;
  statusColor: string;
  engagementStage?: string;
  engagementId?: string;
  likedAt?: string;
  shortlistedAt?: string;
  
  // Availability and interactions
  hasActiveCall: boolean;
  hasConversation: boolean;
  hasExclusiveAccess: boolean;
  availabilityStatus?: 'available' | 'waitlist' | 'unavailable';
  allowDiscoveryOnWaitlist?: boolean;
}

interface UnifiedTrainerState {
  trainers: UnifiedTrainer[];
  loading: boolean;
  error: string | null;
  counts: {
    all: number;
    saved: number;
    shortlisted: number;
    discovery: number;
    declined: number;
    waitlist: number;
  };
}

interface TrainerActions {
  saveTrainer: (trainerId: string) => Promise<boolean>;
  unsaveTrainer: (trainerId: string) => Promise<boolean>;
  shortlistTrainer: (trainerId: string) => Promise<{ success: boolean; error?: string }>;
  removeFromShortlist: (trainerId: string) => Promise<{ success: boolean; error?: string }>;
  updateEngagementStage: (trainerId: string, stage: string) => Promise<boolean>;
  joinWaitlist: (trainerId: string) => Promise<{ success: boolean; error?: string }>;
  leaveWaitlist: (trainerId: string) => Promise<{ success: boolean; error?: string }>;
  refreshData: () => void;
  filterTrainers: (filter: string) => UnifiedTrainer[];
}

export function useUnifiedTrainerData(): UnifiedTrainerState & TrainerActions {
  const { user } = useAuth();
  const { refreshTrigger, markTrainersLoaded, markEngagementLoaded } = useDataSynchronization();
  
  const [state, setState] = useState<UnifiedTrainerState>({
    trainers: [],
    loading: true,
    error: null,
    counts: { all: 0, saved: 0, shortlisted: 0, discovery: 0, declined: 0, waitlist: 0 }
  });

  const cache = useRef<Map<string, any>>(new Map());
  const lastFetchTime = useRef<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Debounced state updates to prevent excessive re-renders
  const updateStateDebounced = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (updates: Partial<UnifiedTrainerState>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setState(prev => ({ ...prev, ...updates }));
      }, 100);
    };
  }, []);

  const fetchTrainerData = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, trainers: [], loading: false }));
      return;
    }

    const now = Date.now();
    const cacheKey = `trainer-data-${user.id}`;
    
    // Check cache first
    if (cache.current.has(cacheKey) && now - lastFetchTime.current < CACHE_DURATION) {
      const cachedData = cache.current.get(cacheKey);
      setState(prev => ({ ...prev, trainers: cachedData, loading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Fetch data in parallel for better performance
      const [
        engagementsResponse,
        waitlistResponse,
        conversationsResponse,
        discoveryCallsResponse
      ] = await Promise.all([
        supabase
          .from('client_trainer_engagement')
          .select('*')
          .eq('client_id', user.id),
        
        supabase
          .from('coach_waitlists')
          .select('coach_id, status')
          .eq('client_id', user.id)
          .eq('status', 'active'),
        
        supabase
          .from('conversations')
          .select('trainer_id, client_id')
          .or(`client_id.eq.${user.id},trainer_id.eq.${user.id}`),
        
        supabase
          .from('discovery_calls')
          .select('trainer_id, status')
          .eq('client_id', user.id)
          .in('status', ['scheduled', 'rescheduled'])
      ]);

      // Get unique trainer IDs
      const trainerIds = new Set<string>();
      engagementsResponse.data?.forEach(e => trainerIds.add(e.trainer_id));
      waitlistResponse.data?.forEach(w => trainerIds.add(w.coach_id));

      if (trainerIds.size === 0) {
        setState(prev => ({ 
          ...prev, 
          trainers: [], 
          loading: false,
          counts: { all: 0, saved: 0, shortlisted: 0, discovery: 0, declined: 0, waitlist: 0 }
        }));
        return;
      }

      // Fetch trainer profiles and settings
      const [trainersResponse, discoverySettingsResponse, availabilityResponse] = await Promise.all([
        supabase
          .from('v_trainers')
          .select(`
            id, first_name, last_name, location, specializations,
            profile_photo_url, hourly_rate, training_types, 
            package_options, testimonials, rating, total_ratings
          `)
          .in('id', Array.from(trainerIds)),
        
        supabase
          .from('discovery_call_settings')
          .select('id, offers_discovery_call')
          .in('id', Array.from(trainerIds)),
        
        supabase
          .from('coach_availability_settings')
          .select('coach_id, availability_status, allow_discovery_calls_on_waitlist')
          .in('coach_id', Array.from(trainerIds))
      ]);

      // Transform data into unified format
      const trainers: UnifiedTrainer[] = [];
      const engagements = engagementsResponse.data || [];
      const waitlisted = waitlistResponse.data || [];
      const conversations = conversationsResponse.data || [];
      const activeCalls = discoveryCallsResponse.data || [];

      trainersResponse.data?.forEach(trainerData => {
        try {
          const engagement = engagements.find(e => e.trainer_id === trainerData.id);
          const isWaitlisted = waitlisted.some(w => w.coach_id === trainerData.id);
          const hasConversation = conversations.some(c => 
            c.trainer_id === trainerData.id || c.client_id === trainerData.id
          );
          const hasActiveCall = activeCalls.some(c => c.trainer_id === trainerData.id);
          const discoverySettings = discoverySettingsResponse.data?.find(d => d.id === trainerData.id);
          const availability = availabilityResponse.data?.find(a => a.coach_id === trainerData.id);

        // Determine status based on priority
        let status: UnifiedTrainer['status'] = 'browsing';
        let statusLabel = 'Available';
        let statusColor = 'bg-gray-100 text-gray-800';

        if (engagement) {
          switch (engagement.stage) {
            case 'liked':
              status = 'saved';
              statusLabel = 'Saved';
              statusColor = 'bg-blue-100 text-blue-800';
              break;
            case 'shortlisted':
              status = hasActiveCall || hasConversation ? 'discovery' : 'shortlisted';
              statusLabel = hasActiveCall || hasConversation ? 'Discovery Active' : 'Shortlisted';
              statusColor = hasActiveCall || hasConversation ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800';
              break;
            case 'discovery_in_progress':
            case 'getting_to_know_your_coach':
            case 'discovery_completed':
            case 'agreed':
              status = 'discovery';
              statusLabel = engagement.stage === 'agreed' ? 'Agreed' : 'Discovery Active';
              statusColor = engagement.stage === 'agreed' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800';
              break;
            case 'declined':
              status = 'declined';
              statusLabel = 'Declined';
              statusColor = 'bg-red-100 text-red-800';
              break;
          }
        }

        if (isWaitlisted && status === 'browsing') {
          status = 'waitlist';
          statusLabel = 'On Waitlist';
          statusColor = 'bg-orange-100 text-orange-800';
        }

          const trainerName = `${trainerData.first_name || ''} ${trainerData.last_name || ''}`.trim();
          
          trainers.push({
            id: trainerData.id,
            name: trainerName || 'Unknown Trainer',
            firstName: trainerData.first_name || '',
            lastName: trainerData.last_name || '',
            location: trainerData.location || '',
            specializations: Array.isArray(trainerData.specializations) ? trainerData.specializations : [],
            profilePhotoUrl: trainerData.profile_photo_url || null,
            hourlyRate: typeof trainerData.hourly_rate === 'number' ? trainerData.hourly_rate : 0,
            trainingTypes: Array.isArray(trainerData.training_types) ? trainerData.training_types : [],
            packageOptions: Array.isArray(trainerData.package_options) ? trainerData.package_options : [],
            testimonials: Array.isArray(trainerData.testimonials) ? trainerData.testimonials : [],
            rating: typeof trainerData.rating === 'number' ? trainerData.rating : 4.5,
            reviewCount: typeof trainerData.total_ratings === 'number' ? trainerData.total_ratings : 0,
            offersDiscoveryCall: discoverySettings?.offers_discovery_call === true,
            
            status,
            statusLabel,
            statusColor,
            engagementStage: engagement?.stage || undefined,
            engagementId: engagement?.id || undefined,
            likedAt: engagement?.liked_at || undefined,
            shortlistedAt: engagement?.stage === 'shortlisted' ? (engagement?.updated_at || undefined) : undefined,
            
            hasActiveCall,
            hasConversation,
            hasExclusiveAccess: false,
            availabilityStatus: (availability?.availability_status === 'accepting' ? 'available' : availability?.availability_status) as any || 'available',
            allowDiscoveryOnWaitlist: availability?.allow_discovery_calls_on_waitlist === true
          });
        } catch (itemError) {
          console.error('Error processing trainer:', trainerData.id, itemError);
          // Continue processing other trainers
        }
      });

      // Calculate counts - exclude browsing trainers from all count
      const counts = {
        all: trainers.filter(t => t.status !== 'browsing').length,
        saved: trainers.filter(t => t.status === 'saved').length,
        shortlisted: trainers.filter(t => t.status === 'shortlisted').length,
        discovery: trainers.filter(t => t.status === 'discovery').length,
        declined: trainers.filter(t => t.status === 'declined').length,
        waitlist: trainers.filter(t => t.status === 'waitlist').length
      };

      // Cache the results
      cache.current.set(cacheKey, trainers);
      lastFetchTime.current = now;

      console.log('✅ Unified trainer data loaded:', {
        totalTrainers: trainers.length,
        counts,
        trainerIds: trainers.map(t => ({ id: t.id, name: t.name, status: t.status }))
      });

      setState({ trainers, loading: false, error: null, counts });
      markTrainersLoaded();
      markEngagementLoaded();

    } catch (error: any) {
      console.error('Error fetching trainer data:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to load trainer data' 
      }));
    }
  }, [user, refreshTrigger, markTrainersLoaded, markEngagementLoaded]);

  // Actions
  const saveTrainer = useCallback(async (trainerId: string): Promise<boolean> => {
    if (!user) {
      toast.error("Please log in to save trainers");
      return false;
    }

    try {
      const { error } = await supabase.rpc('update_engagement_stage', {
        client_uuid: user.id,
        trainer_uuid: trainerId,
        new_stage: 'liked'
      });

      if (error) throw error;
      
      toast.success("Trainer saved!");
      fetchTrainerData();
      return true;
    } catch (error: any) {
      console.error('Error saving trainer:', error);
      toast.error("Failed to save trainer");
      return false;
    }
  }, [user, fetchTrainerData]);

  const unsaveTrainer = useCallback(async (trainerId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase.rpc('update_engagement_stage', {
        client_uuid: user.id,
        trainer_uuid: trainerId,
        new_stage: 'browsing'
      });

      if (error) throw error;
      
      toast.success("Trainer removed from saved list");
      fetchTrainerData();
      return true;
    } catch (error: any) {
      console.error('Error unsaving trainer:', error);
      toast.error("Failed to remove trainer");
      return false;
    }
  }, [user, fetchTrainerData]);

  const shortlistTrainer = useCallback(async (trainerId: string) => {
    if (!user) {
      toast.error('Please log in to shortlist trainers');
      return { success: false, error: 'No user logged in' };
    }

    // Check shortlist limit
    const currentShortlisted = state.trainers.filter(t => t.status === 'shortlisted' || t.status === 'discovery');
    if (currentShortlisted.length >= 4) {
      toast.error('You can only shortlist up to 4 trainers');
      return { success: false, error: 'Shortlist limit reached' };
    }

    // Store previous state for rollback
    const previousTrainers = [...state.trainers];
    const previousCounts = { ...state.counts };

    // Optimistic update - update local state immediately
    setState(prev => {
      const updatedTrainers = prev.trainers.map(trainer => {
        if (trainer.id === trainerId) {
          return {
            ...trainer,
            status: 'shortlisted' as const,
            statusLabel: 'Shortlisted',
            statusColor: 'bg-yellow-100 text-yellow-800',
            engagementStage: 'shortlisted',
            shortlistedAt: new Date().toISOString()
          };
        }
        return trainer;
      });

      const newCounts = {
        all: updatedTrainers.filter(t => t.status !== 'browsing').length,
        saved: updatedTrainers.filter(t => t.status === 'saved').length,
        shortlisted: updatedTrainers.filter(t => t.status === 'shortlisted').length,
        discovery: updatedTrainers.filter(t => t.status === 'discovery').length,
        declined: updatedTrainers.filter(t => t.status === 'declined').length,
        waitlist: updatedTrainers.filter(t => t.status === 'waitlist').length
      };

      return {
        ...prev,
        trainers: updatedTrainers,
        counts: newCounts
      };
    });

    try {
      const { error } = await supabase.rpc('update_engagement_stage', {
        client_uuid: user.id,
        trainer_uuid: trainerId,
        new_stage: 'shortlisted'
      });

      if (error) throw error;
      
      toast.success('Trainer shortlisted!');
      
      // Confirm with database fetch
      await fetchTrainerData();
      return { success: true };
    } catch (error: any) {
      console.error('Error shortlisting trainer:', error);
      
      // Rollback optimistic update on error
      setState(prev => ({
        ...prev,
        trainers: previousTrainers,
        counts: previousCounts
      }));
      
      toast.error('Failed to shortlist trainer');
      return { success: false, error: error.message };
    }
  }, [user, state.trainers, state.counts, fetchTrainerData]);

  const removeFromShortlist = useCallback(async (trainerId: string) => {
    if (!user) return { success: false, error: 'No user logged in' };

    // Store previous state for rollback
    const previousTrainers = [...state.trainers];
    const previousCounts = { ...state.counts };

    // Optimistic update - update local state immediately
    setState(prev => {
      const updatedTrainers = prev.trainers.map(trainer => {
        if (trainer.id === trainerId) {
          return {
            ...trainer,
            status: 'saved' as const,
            statusLabel: 'Saved',
            statusColor: 'bg-blue-100 text-blue-800',
            engagementStage: 'liked',
            shortlistedAt: undefined
          };
        }
        return trainer;
      });

      const newCounts = {
        all: updatedTrainers.filter(t => t.status !== 'browsing').length,
        saved: updatedTrainers.filter(t => t.status === 'saved').length,
        shortlisted: updatedTrainers.filter(t => t.status === 'shortlisted').length,
        discovery: updatedTrainers.filter(t => t.status === 'discovery').length,
        declined: updatedTrainers.filter(t => t.status === 'declined').length,
        waitlist: updatedTrainers.filter(t => t.status === 'waitlist').length
      };

      return {
        ...prev,
        trainers: updatedTrainers,
        counts: newCounts
      };
    });

    try {
      const { error } = await supabase.rpc('update_engagement_stage', {
        client_uuid: user.id,
        trainer_uuid: trainerId,
        new_stage: 'liked'
      });

      if (error) throw error;
      
      toast.success('Trainer removed from shortlist');
      
      // Confirm with database fetch
      await fetchTrainerData();
      return { success: true };
    } catch (error: any) {
      console.error('Error removing from shortlist:', error);
      
      // Rollback optimistic update on error
      setState(prev => ({
        ...prev,
        trainers: previousTrainers,
        counts: previousCounts
      }));
      
      toast.error('Failed to remove from shortlist');
      return { success: false, error: error.message };
    }
  }, [user, state.trainers, state.counts, fetchTrainerData]);

  const updateEngagementStage = useCallback(async (trainerId: string, stage: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase.rpc('update_engagement_stage', {
        client_uuid: user.id,
        trainer_uuid: trainerId,
        new_stage: stage as any
      });

      if (error) throw error;
      
      fetchTrainerData();
      return true;
    } catch (error: any) {
      console.error('Error updating engagement stage:', error);
      return false;
    }
  }, [user, fetchTrainerData]);

  const joinWaitlist = useCallback(async (trainerId: string) => {
    if (!user) return { success: false, error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('coach_waitlists')
        .upsert({
          client_id: user.id,
          coach_id: trainerId,
          status: 'active'
        });

      if (error) throw error;
      
      toast.success('Joined waitlist!');
      fetchTrainerData();
      return { success: true };
    } catch (error: any) {
      console.error('Error joining waitlist:', error);
      toast.error('Failed to join waitlist');
      return { success: false, error: error.message };
    }
  }, [user, fetchTrainerData]);

  const leaveWaitlist = useCallback(async (trainerId: string) => {
    if (!user) return { success: false, error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('coach_waitlists')
        .delete()
        .eq('client_id', user.id)
        .eq('coach_id', trainerId);

      if (error) throw error;
      
      toast.success('Left waitlist');
      fetchTrainerData();
      return { success: true };
    } catch (error: any) {
      console.error('Error leaving waitlist:', error);
      toast.error('Failed to leave waitlist');
      return { success: false, error: error.message };
    }
  }, [user, fetchTrainerData]);

  const filterTrainers = useCallback((filter: string): UnifiedTrainer[] => {
    if (filter === 'all') {
      // Exclude trainers with 'browsing' status from 'all' tab
      return state.trainers.filter(t => t.status !== 'browsing');
    }
    return state.trainers.filter(t => t.status === filter);
  }, [state.trainers]);

  const refreshData = useCallback(() => {
    cache.current.clear();
    fetchTrainerData();
  }, [fetchTrainerData]);

  // Initial data load and refresh trigger
  useEffect(() => {
    fetchTrainerData();
  }, [fetchTrainerData]);

  // Real-time subscription for engagement changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('engagement-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_trainer_engagement',
          filter: `client_id=eq.${user.id}`
        },
        () => {
          console.log('🔄 Engagement changed, refreshing trainer data...');
          cache.current.clear();
          fetchTrainerData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    ...state,
    saveTrainer,
    unsaveTrainer,
    shortlistTrainer,
    removeFromShortlist,
    updateEngagementStage,
    joinWaitlist,
    leaveWaitlist,
    refreshData,
    filterTrainers
  };
}