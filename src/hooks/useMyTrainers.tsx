import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useTrainerEngagement } from './useTrainerEngagement';
import { useConversations } from './useConversations';
import { useDiscoveryCallData } from './useDiscoveryCallData';

export interface TrainerWithStatus {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  specialties: string[];
  rating: number;
  reviews: number;
  experience: string;
  location: string;
  hourlyRate: number;
  image: string;
  profilePhotoUrl?: string;
  certifications: string[];
  description: string;
  availability: string;
  trainingType: string[];
  offers_discovery_call: boolean;
  package_options?: any[];
  // Status fields
  status: 'saved' | 'shortlisted' | 'discovery';
  engagement?: any;
  statusLabel: string;
  statusColor: string;
}

export function useMyTrainers(refreshTrigger?: number) {
  const { user } = useAuth();
  const { conversations } = useConversations();
  const { hasActiveDiscoveryCall } = useDiscoveryCallData();
  
  const { 
    engagements,
    loading: engagementLoading,
    getLikedTrainers,
    getOnlyShortlistedTrainers,
    getDiscoveryStageTrainers,
    getMatchedTrainers
  } = useTrainerEngagement(refreshTrigger);
  
  const [trainers, setTrainers] = useState<TrainerWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<{[key: string]: any}>({});

  // Get all unique trainer IDs from engagements
  const trainerIds = useMemo(() => {
    return [...new Set(engagements.map(e => e.trainerId))];
  }, [engagements]);

  // Fetch trainer profiles for engaged trainers only
  useEffect(() => {
    const fetchTrainerData = async () => {
      if (!user || trainerIds.length === 0) {
        setTrainers([]);
        setLoading(false);
        return;
      }

      try {
        // Single query with proper join syntax for complete discovery call data
        const { data: trainerData, error } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            location,
            specializations,
            profile_photo_url,
            bio,
            hourly_rate,
            training_types,
            coaching_styles,
            ideal_client_types,
            qualifications,
            package_options,
            discovery_call_settings!inner(
              offers_discovery_call,
              discovery_call_availability_schedule,
              discovery_call_duration,
              prep_notes
            )
          `)
          .eq('user_type', 'trainer')
          .in('id', trainerIds);

        if (error) {
          console.error('Error fetching trainer data:', error);
          setLoading(false);
          return;
        }

        console.log('🔍 Raw trainer data with discovery settings:', trainerData);
        
        // Debug log specifically for Lou
        const louTrainer = trainerData?.find(t => t.first_name === 'TrainerLou');
        if (louTrainer) {
          console.log('🐛 Lou data with fixed join:', {
            id: louTrainer.id,
            discovery_call_settings: louTrainer.discovery_call_settings,
            offers_discovery_call: louTrainer.discovery_call_settings?.offers_discovery_call
          });
        }

        // Transform and combine trainer data with engagement status
        const trainersWithStatus: TrainerWithStatus[] = [];
        
        // Helper function to create trainer object
        const createTrainerObject = (trainerProfile: any): Omit<TrainerWithStatus, 'status' | 'engagement' | 'statusLabel' | 'statusColor'> => {
          const discoveryCallValue = trainerProfile.discovery_call_settings?.offers_discovery_call || false;
          
          // Debug log for Lou specifically
          if (trainerProfile.first_name === 'TrainerLou') {
            console.log('🐛 Creating trainer object for Lou:', {
              id: trainerProfile.id,
              discovery_call_settings: trainerProfile.discovery_call_settings,
              extracted_value: discoveryCallValue
            });
          }
          
          return {
            id: trainerProfile.id,
            name: `${trainerProfile.first_name || ''} ${trainerProfile.last_name || ''}`.trim() || 'Unnamed Trainer',
            firstName: trainerProfile.first_name,
            lastName: trainerProfile.last_name,
            specialties: trainerProfile.specializations || [],
            rating: 4.5, // Default rating
            reviews: 0, // Default reviews
            experience: 'Professional', // Default experience
            location: trainerProfile.location || '',
            hourlyRate: trainerProfile.hourly_rate || 0,
            image: trainerProfile.profile_photo_url || '/src/assets/trainer-alex.jpg', // Fallback image
            profilePhotoUrl: trainerProfile.profile_photo_url,
            certifications: trainerProfile.qualifications || [],
            description: trainerProfile.bio || 'Professional fitness trainer',
            availability: 'Available', // Default availability
            trainingType: trainerProfile.training_types || [],
            offers_discovery_call: discoveryCallValue,
            package_options: trainerProfile.package_options || []
          };
        };

        // Process saved trainers (liked)
        const likedTrainers = getLikedTrainers();
        likedTrainers.forEach(engagement => {
          const trainerProfile = trainerData?.find(t => t.id === engagement.trainerId);
          if (trainerProfile) {
            trainersWithStatus.push({
              ...createTrainerObject(trainerProfile),
              status: 'saved',
              engagement,
              statusLabel: 'Saved',
              statusColor: 'bg-blue-100 text-blue-800'
            });
          }
        });

        // Process shortlisted trainers
        const shortlistedTrainers = getOnlyShortlistedTrainers();
        shortlistedTrainers.forEach(engagement => {
          const trainerProfile = trainerData?.find(t => t.id === engagement.trainerId);
          if (trainerProfile) {
            // Check if already in list (upgrade from saved)
            const existingIndex = trainersWithStatus.findIndex(t => t.id === engagement.trainerId);
            const trainerObj = {
              ...createTrainerObject(trainerProfile),
              status: 'shortlisted' as const,
              engagement,
              statusLabel: 'Shortlisted',
              statusColor: 'bg-yellow-100 text-yellow-800'
            };
            
            if (existingIndex >= 0) {
              trainersWithStatus[existingIndex] = trainerObj;
            } else {
              trainersWithStatus.push(trainerObj);
            }
          }
        });

        // Process discovery stage trainers
        const discoveryTrainerIds = new Set<string>();
        
        // Add trainers with active discovery calls
        trainerData?.forEach(trainerProfile => {
          if (hasActiveDiscoveryCall(trainerProfile.id)) {
            discoveryTrainerIds.add(trainerProfile.id);
          }
        });
        
        // Add trainers with discovery-related engagement stages
        const discoveryStageTrainers = getDiscoveryStageTrainers();
        discoveryStageTrainers.forEach(engagement => {
          if (engagement.stage === 'discovery_in_progress' || 
              engagement.stage === 'discovery_call_booked' || 
              engagement.stage === 'discovery_completed') {
            discoveryTrainerIds.add(engagement.trainerId);
          }
        });
        
        // Add shortlisted trainers with conversations
        trainersWithStatus.forEach(trainerWithStatus => {
          if (trainerWithStatus.status === 'shortlisted') {
            const hasConversation = conversations.some(conv => 
              (conv.client_id === user?.id && conv.trainer_id === trainerWithStatus.id) ||
              (conv.trainer_id === user?.id && conv.client_id === trainerWithStatus.id)
            );
            if (hasConversation) {
              discoveryTrainerIds.add(trainerWithStatus.id);
            }
          }
        });

        // Process all discovery trainers
        discoveryTrainerIds.forEach(trainerId => {
          const trainerProfile = trainerData?.find(t => t.id === trainerId);
          if (trainerProfile) {
            const existingIndex = trainersWithStatus.findIndex(t => t.id === trainerId);
            const trainerObj = {
              ...createTrainerObject(trainerProfile),
              status: 'discovery' as const,
              engagement: existingIndex >= 0 ? trainersWithStatus[existingIndex].engagement : null,
              statusLabel: 'Discovery Active',
              statusColor: 'bg-purple-100 text-purple-800'
            };
            
            if (existingIndex >= 0) {
              trainersWithStatus[existingIndex] = trainerObj;
            } else {
              trainersWithStatus.push(trainerObj);
            }
          }
        });

        // Process matched trainers (show in discovery section)
        const matchedTrainers = getMatchedTrainers();
        matchedTrainers.forEach(engagement => {
          const trainerProfile = trainerData?.find(t => t.id === engagement.trainerId);
          if (trainerProfile) {
            const existingIndex = trainersWithStatus.findIndex(t => t.id === engagement.trainerId);
            const trainerObj = {
              ...createTrainerObject(trainerProfile),
              status: 'discovery' as const,
              engagement,
              statusLabel: 'Matched',
              statusColor: 'bg-green-100 text-green-800'
            };
            
            if (existingIndex >= 0) {
              trainersWithStatus[existingIndex] = trainerObj;
            } else {
              trainersWithStatus.push(trainerObj);
            }
          }
        });

        setTrainers(trainersWithStatus);
        console.log('✅ MyTrainers: Loaded', trainersWithStatus.length, 'trainers with status');
        
      } catch (error) {
        console.error('Error in useMyTrainers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainerData();
  }, [user, trainerIds, getLikedTrainers, getOnlyShortlistedTrainers, getDiscoveryStageTrainers, getMatchedTrainers, hasActiveDiscoveryCall, conversations]);

  // Fetch availability data for shortlisted trainers
  useEffect(() => {
    const fetchAvailabilityData = async () => {
      const shortlistedTrainers = trainers.filter(t => t.status === 'shortlisted');
      const trainerIds = shortlistedTrainers.map(t => t.id);
      
      if (trainerIds.length === 0) return;

      try {
        const { data: availabilityData, error } = await supabase
          .from('coach_availability_settings')
          .select('*')
          .in('coach_id', trainerIds);
        
        if (error) {
          console.warn('Failed to fetch availability:', error);
          return;
        }
        
        const availabilityMap: {[key: string]: any} = {};
        availabilityData?.forEach(item => {
          availabilityMap[item.coach_id] = item;
        });
        
        setAvailability(availabilityMap);
        
      } catch (error) {
        console.warn('Availability fetch failed:', error);
      }
    };

    // Only fetch if we have trainers and they're not loading
    if (trainers.length > 0 && !loading) {
      fetchAvailabilityData();
    }
  }, [trainers.length, loading]); // Use trainers.length instead of trainers to prevent loop

  // Filter trainers by status
  const filteredTrainers = useMemo(() => {
    return (filter: 'all' | 'saved' | 'shortlisted' | 'discovery') => {
      if (filter === 'all') return trainers;
      return trainers.filter(t => t.status === filter);
    };
  }, [trainers]);

  // Get counts for each status
  const counts = useMemo(() => ({
    all: trainers.length,
    saved: trainers.filter(t => t.status === 'saved').length,
    shortlisted: trainers.filter(t => t.status === 'shortlisted').length,
    discovery: trainers.filter(t => t.status === 'discovery').length
  }), [trainers]);

  return {
    trainers,
    loading: loading || engagementLoading,
    availability,
    filteredTrainers,
    counts,
    refresh: () => window.location.reload() // Simple refresh for now
  };
}