import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrainerProfilePreview } from '@/components/TrainerProfilePreview';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export function DemoProfilePreview() {
  const [trainerData, setTrainerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDemoTrainer = async () => {
      try {
        // Fetch a published trainer profile (Trainer5 or any verified trainer)
        const { data, error } = await supabase
          .from('v_trainers')
          .select('*')
          .eq('profile_published', true)
          .eq('is_verified', true)
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching demo trainer:', error);
          return;
        }

        if (data) {
          // Transform to match TrainerProfilePreview's expected format
          const formData = {
            firstName: data.first_name,
            lastName: data.last_name,
            profilePhotoUrl: data.profile_photo_url,
            profileImagePosition: data.profile_image_position,
            tagline: data.tagline || 'Certified Personal Trainer & Nutrition Coach',
            bio: data.bio,
            location: data.location,
            experience: '5+ years',
            hourlyRate: data.hourly_rate,
            rating: data.rating || 4.9,
            totalRatings: data.total_ratings || 50,
            isVerified: data.is_verified,
            status: 'accepting',
            specializations: data.specializations || [],
            trainingTypes: data.training_types || ['In-Person', 'Online'],
            packageOptions: data.package_options || [],
            testimonials: data.testimonials || [],
          };
          
          setTrainerData(formData);
        }
      } catch (error) {
        console.error('Error loading demo trainer:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDemoTrainer();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Profile Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!trainerData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Profile Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Unable to load demo profile
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <p className="text-sm font-medium text-primary">
          ✨ This is how your profile will appear to clients on NAC
        </p>
      </div>
      <TrainerProfilePreview formData={trainerData} />
    </div>
  );
}
