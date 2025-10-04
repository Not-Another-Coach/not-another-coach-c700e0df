import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Instagram, Play, Image as ImageIcon } from "lucide-react";
import { AnyTrainer } from "@/types/trainer";
import { supabase } from "@/integrations/supabase/client";
import { FileUploadService } from "@/services";
import { useEffect, useState } from "react";
import { useContentVisibility } from '@/hooks/useContentVisibility';
import { useEngagementStage } from '@/hooks/useEngagementStage';
import { VisibilityAwareGallery } from '@/components/ui/VisibilityAwareGallery';
import { getRecommendedGridSizeForCount } from '@/hooks/useTrainerImages';
import { VisibilityAwareBasicInfo } from "@/components/ui/VisibilityAwareBasicInfo";
import { VisibilityAwareRating } from "@/components/ui/VisibilityAwareRating";

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

  // Add engagement stage and visibility logic
  const { stage, isGuest } = useEngagementStage(trainer.id);
  const { visibilityMap, getVisibility, loading: visibilityLoading } = useContentVisibility({
    engagementStage: stage || 'browsing',
    isGuest
  });

  const galleryVisibility = getVisibility('gallery_images');

  // Enhanced debug visibility system
  console.log('[VISIBILITY DEBUG] InstagramGalleryView:', {
    trainerId: trainer.id,
    trainerName: trainer.name,
    engagementStage: stage || 'browsing',
    isGuest,
    galleryVisibility,
    visibilityLoading,
    allVisibilityMap: visibilityMap
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
        
        console.log(`InstagramGalleryView Debug:`, {
          totalSelectedImages,
          autoGridSize,
          allImagesLength: allImages.length,
          allImages: allImages.map(img => ({
            id: img.id,
            type: img.type,
            url: typeof img.url === 'string' ? img.url.substring(0, 50) + '...' : '...'
          }))
        });
        
        setDisplayImages(allImages);
      } catch (error) {
        console.error('❌ CRITICAL ERROR fetching trainer images:', {
          trainerId: trainer.id,
          trainerName: trainer.name,
          error: error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined
        });
        
        // Don't fall back to profile picture - let the component show empty state
        // This will help us identify the real issue
        setDisplayImages([]);
        setGridSize(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainerImages();
    
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
            // Empty state - no gallery images available
            <div className="aspect-square relative flex items-center justify-center bg-muted">
              <div className="text-center p-6">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-medium">No gallery images yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Trainer hasn't uploaded any images</p>
              </div>
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

        {/* Trainer Info Overlay - only show when basic_information is visible */}
        {getVisibility('basic_information') === 'visible' && (
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="flex items-end justify-between">
              <div className="flex-1">
                <VisibilityAwareBasicInfo
                  name={trainer.name}
                  location={trainer.location}
                  visibilityState={getVisibility('basic_information')}
                  variant="overlay"
                  className="mb-2"
                  trainer={{
                    id: trainer.id,
                    first_name: (trainer as any).firstName || (trainer as any).first_name,
                    last_name: (trainer as any).lastName || (trainer as any).last_name,
                    name: trainer.name
                  }}
                  engagementStage={stage || 'browsing'}
                />
                
                
                {getVisibility('stats_ratings') !== 'hidden' && getVisibility('stats_ratings') !== 'blurred' && (
                  <div className="flex items-center gap-3 text-white/90 text-sm mb-2">
                    <VisibilityAwareRating
                      rating={trainer.rating}
                      reviewCount={trainer.reviews}
                      visibilityState={getVisibility('stats_ratings')}
                      size="sm"
                      className="text-white/90"
                    />
                  </div>
                )}
                
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
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};