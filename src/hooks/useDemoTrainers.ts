import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trainer } from '@/types/trainer';
import { DEMO_TRAINER_IDS } from '@/config/demoTrainers';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
];

export function useDemoTrainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDemoTrainers = async () => {
      try {
        setLoading(true);

        // Fetch the demo trainers from v_trainers view (publicly accessible)
        const { data, error } = await supabase
          .from('v_trainers')
          .select('*')
          .in('id', DEMO_TRAINER_IDS);

        if (error) {
          console.error('Error fetching demo trainers:', error);
          setTrainers([]);
          return;
        }

        if (!data || data.length === 0) {
          console.warn('No demo trainers found for IDs:', DEMO_TRAINER_IDS);
          setTrainers([]);
          return;
        }

        // Transform data to Trainer type
        const transformedTrainers: Trainer[] = data.map((trainer, index) => ({
          id: trainer.id,
          name: `${trainer.first_name || ''} ${trainer.last_name || ''}`.trim() || 'Trainer',
          firstName: trainer.first_name || '',
          lastName: trainer.last_name || '',
          image: trainer.profile_photo_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
          location: trainer.location || 'Location',
          specialties: trainer.specializations || [],
          rating: trainer.rating || 0,
          reviews: 0,
          experience: 'Professional Trainer',
          hourlyRate: trainer.hourly_rate || 0,
          availability: 'Available',
          description: trainer.bio || '',
          instagram_posts: [],
          testimonials: (trainer as any).testimonials || [],
          trainingTypes: trainer.training_types || [],
          specializations: trainer.specializations || [],
        }));

        // Sort to maintain consistent order (Trainer 4, then Trainer 5)
        const sortedTrainers = transformedTrainers.sort((a, b) => {
          const indexA = DEMO_TRAINER_IDS.indexOf(a.id);
          const indexB = DEMO_TRAINER_IDS.indexOf(b.id);
          return indexA - indexB;
        });

        setTrainers(sortedTrainers);
      } catch (error) {
        console.error('Error in useDemoTrainers:', error);
        setTrainers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDemoTrainers();
  }, []);

  return { trainers, loading };
}
