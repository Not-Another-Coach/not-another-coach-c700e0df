import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trainer } from '@/types/trainer';
import trainerAlex from "@/assets/trainer-alex.jpg";
import trainerSarah from "@/assets/trainer-sarah.jpg";
import trainerMike from "@/assets/trainer-mike.jpg";
import trainerEmma from "@/assets/trainer-emma.jpg";

// Fallback images for trainers
const trainerImages = [trainerAlex, trainerSarah, trainerMike, trainerEmma];

export function useRealTrainers(refreshTrigger?: number, includeOwnUnpublished?: { userId: string }) {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainers = async () => {
      console.log('🔄 Fetching trainers data...');
      setLoading(true);
      try {
        let query = supabase
          .from('v_trainers')
          .select(`
            id,
            first_name,
            last_name,
            bio,
            location,
            specializations,
            qualifications,
            hourly_rate,
            rating,
            total_ratings,
            training_types,
            profile_photo_url,
            profile_image_position,
            is_verified,
            package_options,
            testimonials,
            professional_milestones
          `);

        // If we need to include own unpublished profile, use OR condition
        if (includeOwnUnpublished?.userId) {
          query = query.or(`profile_published.eq.true,id.eq.${includeOwnUnpublished.userId}`);
        } else {
          query = query.eq('profile_published', true);
        }
        
        const { data, error } = await query;

        if (error) {
          console.error('Error fetching trainers in useRealTrainers:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          return;
        }

        // Filter out trainers in limited mode
        let filteredData = data || [];
        if (data && data.length > 0) {
          const trainerIds = data.map(t => t.id);
          const { data: memberships } = await supabase
            .from('trainer_membership')
            .select('trainer_id, payment_status')
            .in('trainer_id', trainerIds)
            .eq('is_active', true);

          const limitedModeIds = new Set(
            (memberships || [])
              .filter(m => m.payment_status === 'limited_mode')
              .map(m => m.trainer_id)
          );

          filteredData = data.filter(t => !limitedModeIds.has(t.id));
        }

        const realTrainers: Trainer[] = filteredData?.map((trainer, index) => {
          // Debug logging for Lou specifically
          if (trainer.bio?.includes('Lou') || trainer.id === 'f5562940-ccc4-40c2-b8dd-8f8c22311003') {
            console.log(`🐛 DEBUG Raw trainer data for Lou:`, {
              trainerId: trainer.id,
              offers_discovery_call: null // Default to null since discovery_call_settings not available
            });
          }
          
          // Use profile photo if available, otherwise use fallback image
          const imageUrl = trainer.profile_photo_url || trainerImages[index % trainerImages.length];
          
          return {
            id: trainer.id,
            name: `${trainer.first_name || ''} ${trainer.last_name || ''}`.trim() || 'Professional Trainer',
            firstName: trainer.first_name,
            lastName: trainer.last_name,
            specialties: trainer.specializations || [],
            rating: trainer.rating || 4.5,
            reviews: trainer.total_ratings || 0,
            experience: trainer.is_verified ? "Verified Professional" : "Professional",
            location: trainer.location || "Location TBD",
            hourlyRate: trainer.hourly_rate || 75,
            image: imageUrl,
            profilePhotoUrl: trainer.profile_photo_url,
            profileImagePosition: trainer.profile_image_position 
              ? (typeof trainer.profile_image_position === 'string' 
                  ? JSON.parse(trainer.profile_image_position)
                  : trainer.profile_image_position) as { x: number; y: number; scale: number }
              : { x: 50, y: 50, scale: 1 },
            certifications: trainer.qualifications || [],
            description: trainer.bio || "Professional fitness trainer dedicated to helping you achieve your goals.",
            availability: "Available",
            trainingType: trainer.training_types || ["In-Person", "Online"],
            offers_discovery_call: null, // Default to null since discovery_call_settings not available
            package_options: (trainer.package_options as any[]) || [],
            testimonials: (trainer.testimonials as any[]) || [],
            professional_milestones: (trainer.professional_milestones as any[]) || []
          };
        }) || [];

        setTrainers(realTrainers);
        console.log('✅ Trainers data loaded:', realTrainers.length, 'trainers');
      } catch (error) {
        console.error('Error fetching trainers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, [refreshTrigger, includeOwnUnpublished]);

  return { trainers, loading };
}