import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TrainerOption {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  location?: string;
  specializations?: string[];
  profilePhotoUrl?: string;
}

export function useTrainerList() {
  const [trainers, setTrainers] = useState<TrainerOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, location, specializations, profile_photo_url')
          .eq('user_type', 'trainer')
          .order('first_name');

        if (error) {
          console.error('Error fetching trainers:', error);
          return;
        }

        const trainerOptions: TrainerOption[] = data?.map(trainer => ({
          id: trainer.id,
          name: `${trainer.first_name || ''} ${trainer.last_name || ''}`.trim() || 'Unnamed Trainer',
          firstName: trainer.first_name,
          lastName: trainer.last_name,
          location: trainer.location,
          specializations: trainer.specializations,
          profilePhotoUrl: trainer.profile_photo_url
        })) || [];

        setTrainers(trainerOptions);
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