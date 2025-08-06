import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trainer } from '@/components/TrainerCard';
import trainerAlex from "@/assets/trainer-alex.jpg";
import trainerSarah from "@/assets/trainer-sarah.jpg";
import trainerMike from "@/assets/trainer-mike.jpg";
import trainerEmma from "@/assets/trainer-emma.jpg";

// Fallback images for trainers
const trainerImages = [trainerAlex, trainerSarah, trainerMike, trainerEmma];

export function useShortlistedTrainerProfiles(shortlistedTrainerIds: string[]) {
  const [shortlistedProfiles, setShortlistedProfiles] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchShortlistedProfiles = async () => {
      if (!shortlistedTrainerIds.length) {
        setShortlistedProfiles([]);
        return;
      }

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
            profile_published
          `)
          .in('id', shortlistedTrainerIds)
          .eq('user_type', 'trainer');

        if (error) {
          console.error('Error fetching shortlisted trainer profiles:', error);
          return;
        }

        const profiles: Trainer[] = data?.map((trainer, index) => {
          const imageUrl = trainer.profile_photo_url || trainerImages[index % trainerImages.length];
          
          return {
            id: trainer.id,
            name: `${trainer.first_name || ''} ${trainer.last_name || ''}`.trim() || 'Professional Trainer',
            specialties: trainer.specializations || [],
            rating: trainer.rating || 4.5,
            reviews: trainer.total_ratings || 0,
            experience: trainer.is_verified ? "Verified Professional" : "Professional",
            location: trainer.location || "Location TBD",
            hourlyRate: trainer.hourly_rate || 75,
            image: imageUrl,
            certifications: trainer.qualifications || [],
            description: trainer.bio || "Professional fitness trainer dedicated to helping you achieve your goals.",
            availability: "Available",
            trainingType: trainer.training_types || ["In-Person", "Online"],
            offers_discovery_call: true,
            isPublished: trainer.profile_published // Add this to track publication status
          };
        }) || [];

        setShortlistedProfiles(profiles);
      } catch (error) {
        console.error('Error fetching shortlisted trainer profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShortlistedProfiles();
  }, [shortlistedTrainerIds]);

  return { shortlistedProfiles, loading };
}