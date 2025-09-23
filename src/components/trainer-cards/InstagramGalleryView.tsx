import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Instagram, Play, Image as ImageIcon } from "lucide-react";
import { AnyTrainer } from "@/types/trainer";
import { getTrainerDisplayPrice } from "@/lib/priceUtils";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useContentVisibility } from '@/hooks/useContentVisibility';
import { useEngagementStage } from '@/hooks/useEngagementStage';
import { VisibilityAwareGallery } from '@/components/ui/VisibilityAwareGallery';
import { getRecommendedGridSizeForCount } from '@/hooks/useTrainerImages';
import { VisibilityAwareBasicInfo } from "@/components/ui/VisibilityAwareBasicInfo";

const getGridClasses = (actualImageCount: number): string => {
  // Use actual image count to determine the best grid layout
  switch (actualImageCount) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-2";
    case 3:
      return "grid-cols-3";
    case 4:
      return "grid-cols-2 grid-rows-2";
    case 5:
      return "grid-cols-3 grid-rows-2"; // 3x2 with 5 images
    case 6:
      return "grid-cols-3 grid-rows-2";
    case 7:
    case 8:
      return "grid-cols-4 grid-rows-2"; // 4x2 for 7-8 images
    case 9:
      return "grid-cols-3 grid-rows-3";
    case 10:
    case 11:
    case 12:
      return "grid-cols-4 grid-rows-3";
    default:
      return actualImageCount <= 3 ? "grid-cols-3" : "grid-cols-4 grid-rows-3";
  }
};


interface InstagramGalleryViewProps {
  trainer: AnyTrainer;
  children?: React.ReactNode; // For CTA buttons and interactive elements
}

export const InstagramGalleryView = ({ trainer, children }: InstagramGalleryViewProps) => {
  const [displayImages, setDisplayImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridSize, setGridSize] = useState<number>(6);

  // Add visibility logic
  const { stage, isGuest } = useEngagementStage(trainer.id);
  const { getVisibility, loading: visibilityLoading } = useContentVisibility({
    trainerId: trainer.id,
    engagementStage: stage || 'browsing',
    isGuest
  });

  const galleryVisibility = getVisibility('gallery_images');

  // Debug visibility system
  console.log('InstagramGalleryView Debug - Visibility:', {
    trainerId: trainer.id,
    engagementStage: stage || 'browsing',
    galleryVisibility,
    visibilityLoading
  });

  useEffect(() => {
    const fetchTrainerImages = async () => {
      if (!trainer.id) return;

      try {
        setLoading(true);
        
        // Fetch uploaded images
        const { data: uploadedImages, error: uploadedError } = await supabase
          .from('trainer_uploaded_images')
          .select('*')
          .eq('trainer_id', trainer.id)
          .eq('is_selected_for_display', true)
          .order('display_order', { ascending: true });

        if (uploadedError) throw uploadedError;

        // Fetch Instagram selections
        const { data: instagramImages, error: instagramError } = await supabase
          .from('trainer_instagram_selections')
          .select('*')
          .eq('trainer_id', trainer.id)
          .eq('is_selected_for_display', true)
          .order('display_order', { ascending: true });

        if (instagramError) throw instagramError;

        // Count selected images and auto-calculate grid size
        const totalSelectedImages = (uploadedImages?.length || 0) + (instagramImages?.length || 0);
        const autoGridSize = getRecommendedGridSizeForCount(totalSelectedImages);
        setGridSize(autoGridSize);
        
        // Combine and format images
        const allImages = [
          ...(uploadedImages || []).map(img => ({
            id: img.id,
            type: 'uploaded',
            url: supabase.storage.from('trainer-images').getPublicUrl(img.file_path).data.publicUrl,
            displayOrder: img.display_order,
            mediaType: 'IMAGE'
          })),
          ...(instagramImages || []).map(img => ({
            id: img.id,
            type: 'instagram',
            url: img.media_url,
            displayOrder: img.display_order,
            mediaType: img.media_type
          }))
        ].sort((a, b) => a.displayOrder - b.displayOrder);

        // Apply grid size slicing and log for debugging
        const slicedImages = allImages.slice(0, autoGridSize);
        console.log(`InstagramGalleryView Debug:`, {
          totalSelectedImages,
          autoGridSize,
          allImagesLength: allImages.length,
          slicedImagesLength: slicedImages.length,
          allImages: allImages.map(img => ({
            id: img.id,
            type: img.type,
            url: img.url.substring(0, 50) + '...'
          }))
        });
        setDisplayImages(slicedImages);
      } catch (error) {
        console.error('Error fetching trainer images:', error);
        // Fallback to trainer profile image with hero layout
        setGridSize(1);
        setDisplayImages([{ 
          id: 'fallback', 
          type: 'profile', 
          url: (trainer as any).profilePhotoUrl || trainer.image, 
          mediaType: 'IMAGE' 
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainerImages();
    
    // Set up real-time subscription for preference changes
    const preferencesSubscription = supabase
      .channel('trainer_image_preferences_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trainer_image_preferences',
          filter: `trainer_id=eq.${trainer.id}`
        },
        () => {
          // Refetch when preferences change
          fetchTrainerImages();
        }
      )
      .subscribe();

    // Set up real-time subscription for image selection changes
    const imagesSubscription = supabase
      .channel('trainer_images_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trainer_uploaded_images',
          filter: `trainer_id=eq.${trainer.id}`
        },
        () => {
          fetchTrainerImages();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trainer_instagram_selections',
          filter: `trainer_id=eq.${trainer.id}`
        },
        () => {
          fetchTrainerImages();
        }
      )
      .subscribe();

    return () => {
      preferencesSubscription.unsubscribe();
      imagesSubscription.unsubscribe();
    };
  }, [trainer.id, trainer.image]);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-muted/30 border-0 relative overflow-hidden">
      <CardContent className="p-0">
        {/* Interactive elements overlay */}
        {children}
        
        {/* Gallery Grid */}
        <div className="relative">
          {displayImages.length > 0 ? (
            <VisibilityAwareGallery
              images={displayImages}
              visibilityState={galleryVisibility}
              gridClasses={`aspect-square ${getGridClasses(displayImages.length)}`}
              lockMessage="Gallery unlocks as you engage"
            />
          ) : loading || visibilityLoading ? (
            <div className="aspect-square relative flex items-center justify-center bg-muted">
              <ImageIcon className="h-8 w-8 text-muted-foreground animate-pulse" />
            </div>
          ) : (
            // Single hero image fallback
            <div className="aspect-square relative">
              <img
                src={(trainer as any).profilePhotoUrl || trainer.image}
                alt={trainer.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Content indicator */}
          {displayImages.some(img => img.type === 'instagram') && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                <Instagram className="w-3 h-3 mr-1" />
                Live Feed
              </Badge>
            </div>
          )}
        </div>

        {/* Trainer Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-end justify-between">
            <div className="flex-1">
              <VisibilityAwareBasicInfo
                name={trainer.name}
                location={trainer.location}
                visibilityState={getVisibility('basic_information')}
                variant="overlay"
                className="mb-2"
              />
              
              <div className="flex items-center gap-3 text-white/90 text-sm mb-2">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="font-medium">{trainer.rating}</span>
                </div>
              </div>
              
              {/* Top specialties */}
              <div className="flex gap-1 flex-wrap">
                {((trainer as any).specializations || (trainer as any).specialties || []).slice(0, 2).map((specialty: string) => (
                  <Badge 
                    key={specialty} 
                    variant="secondary" 
                    className="text-xs bg-white/20 text-white border-white/30 backdrop-blur-sm"
                  >
                    {specialty}
                  </Badge>
                ))}
                {((trainer as any).specializations || (trainer as any).specialties || []).length > 2 && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-white/20 text-white border-white/30 backdrop-blur-sm"
                  >
                    +{((trainer as any).specializations || (trainer as any).specialties || []).length - 2}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Price */}
            <div className="text-right">
              <div className="text-xl font-bold text-white drop-shadow-sm">
                {getTrainerDisplayPrice(trainer)}
              </div>
              <div className="text-xs text-white/80">package</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};