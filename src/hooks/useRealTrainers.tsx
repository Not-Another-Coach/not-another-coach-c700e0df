import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trainer } from '@/components/TrainerCard';
import trainerAlex from "@/assets/trainer-alex.jpg";
import trainerSarah from "@/assets/trainer-sarah.jpg";
import trainerMike from "@/assets/trainer-mike.jpg";
import trainerEmma from "@/assets/trainer-emma.jpg";

// Fallback images for trainers
const trainerImages = [trainerAlex, trainerSarah, trainerMike, trainerEmma];

export function useRealTrainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainers = async () => {
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
            verification_status
          `)
          .eq('user_type', 'trainer')
          .eq('profile_published', true)
          .order('created_at');

        if (error) {
          console.error('Error fetching trainers:', error);
          return;
        }

        const realTrainers: Trainer[] = data?.map((trainer, index) => {
          // Use profile photo if available, otherwise use fallback image
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
            trainingType: trainer.training_types || ["In-Person", "Online"]
          };
        }) || [];

        setTrainers(realTrainers);
      } catch (error) {
        console.error('Error fetching trainers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  return { trainers, loading };
}