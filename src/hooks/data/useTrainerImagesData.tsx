import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { queryConfig } from '@/lib/queryConfig';

export interface TrainerUploadedImage {
  id: string;
  trainer_id: string;
  file_path: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  is_selected_for_display: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TrainerInstagramSelection {
  id: string;
  trainer_id: string;
  instagram_media_id: string;
  media_url: string;
  media_type: string;
  thumbnail_url?: string;
  caption?: string;
  is_selected_for_display: boolean;
  display_order: number;
  synced_at: string;
  created_at: string;
  updated_at: string;
}

export interface TrainerImagePreferences {
  id: string;
  trainer_id: string;
  max_images_per_view: number;
  auto_sync_instagram: boolean;
  instagram_sync_frequency: string;
  last_instagram_sync?: string;
  created_at: string;
  updated_at: string;
}

export interface TrainerImagesData {
  uploadedImages: TrainerUploadedImage[];
  instagramSelections: TrainerInstagramSelection[];
  imagePreferences: TrainerImagePreferences | null;
}

export const useTrainerImagesData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trainer-images', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user authenticated');

      // Fetch all 3 tables in parallel
      const [uploadedResult, instagramResult, preferencesResult] = await Promise.all([
        supabase
          .from('trainer_uploaded_images')
          .select('*')
          .eq('trainer_id', user.id)
          .order('display_order', { ascending: true }),
        
        supabase
          .from('trainer_instagram_selections')
          .select('*')
          .eq('trainer_id', user.id)
          .order('display_order', { ascending: true }),
        
        supabase
          .from('trainer_image_preferences')
          .select('*')
          .eq('trainer_id', user.id)
          .maybeSingle()
      ]);

      if (uploadedResult.error) throw uploadedResult.error;
      if (instagramResult.error) throw instagramResult.error;
      if (preferencesResult.error && preferencesResult.error.code !== 'PGRST116') {
        throw preferencesResult.error;
      }

      return {
        uploadedImages: uploadedResult.data || [],
        instagramSelections: instagramResult.data || [],
        imagePreferences: preferencesResult.data || null,
      } as TrainerImagesData;
    },
    enabled: !!user?.id,
    staleTime: queryConfig.availability.staleTime,
    gcTime: queryConfig.availability.gcTime,
  });
};
