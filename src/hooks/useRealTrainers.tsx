import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trainer } from '@/components/TrainerCard';
import trainerAlex from "@/assets/trainer-alex.jpg";
import trainerSarah from "@/assets/trainer-sarah.jpg";
import trainerMike from "@/assets/trainer-mike.jpg";
import trainerEmma from "@/assets/trainer-emma.jpg";

// Fallback images for trainers
const trainerImages = [trainerAlex, trainerSarah, trainerMike, trainerEmma];

export function useRealTrainers(refreshTrigger?: number) {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainers = async () => {
      console.log('🔄 Fetching trainers data...');
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
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
            is_verified,
            verification_status,
            package_options,
            testimonials,
            discovery_call_settings(
              offers_discovery_call
            )
          `)
          .eq('user_type', 'trainer')
          .eq('profile_published', true)
          .order('created_at');

        if (error) {
          console.error('Error fetching trainers in useRealTrainers:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          return;
        }

        const realTrainers: Trainer[] = data?.map((trainer, index) => {
          // Debug logging for Lou specifically
          if (trainer.bio?.includes('Lou') || trainer.id === 'f5562940-ccc4-40c2-b8dd-8f8c22311003') {
            console.log(`🐛 DEBUG Raw trainer data for Lou:`, {
              trainerId: trainer.id,
              discovery_call_settings: trainer.discovery_call_settings,
              offers_discovery_call: trainer.discovery_call_settings?.[0]?.offers_discovery_call
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
            certifications: trainer.qualifications || [],
            description: trainer.bio || "Professional fitness trainer dedicated to helping you achieve your goals.",
            availability: "Available",
            trainingType: trainer.training_types || ["In-Person", "Online"],
            offers_discovery_call: trainer.discovery_call_settings?.[0]?.offers_discovery_call || false,
            package_options: (trainer.package_options as any[]) || [],
            testimonials: (trainer.testimonials as any[]) || []
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
  }, [refreshTrigger]);

  return { trainers, loading };
}