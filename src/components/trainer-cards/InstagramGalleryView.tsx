import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Instagram, Play, Image as ImageIcon } from "lucide-react";
import { Trainer } from "@/components/TrainerCard";
import { getTrainerDisplayPrice } from "@/lib/priceUtils";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const getGridClasses = (gridSize: number): string => {
  switch (gridSize) {
    case 1:
      return "grid-cols-1";
    case 4:
      return "grid-cols-2 grid-rows-2";
    case 6:
      return "grid-cols-3 grid-rows-2";
    case 9:
      return "grid-cols-3 grid-rows-3";
    case 12:
      return "grid-cols-4 grid-rows-3";
    default:
      return "grid-cols-3 grid-rows-2";
  }
};

interface InstagramGalleryViewProps {
  trainer: Trainer;
  children?: React.ReactNode; // For CTA buttons and interactive elements
}

export const InstagramGalleryView = ({ trainer, children }: InstagramGalleryViewProps) => {
  const [displayImages, setDisplayImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridSize, setGridSize] = useState<number>(6);

  useEffect(() => {
    const fetchTrainerImages = async () => {
      if (!trainer.id) return;

      try {
        setLoading(true);
        
        // Fetch trainer image preferences to get grid size
        const { data: preferences, error: preferencesError } = await supabase
          .from('trainer_image_preferences')
          .select('max_images_per_view')
          .eq('trainer_id', trainer.id)
          .maybeSingle();

        if (preferencesError) console.error('Error fetching preferences:', preferencesError);
        
        const maxImages = preferences?.max_images_per_view || 6;
        setGridSize(maxImages);
        
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

        setDisplayImages(allImages.slice(0, maxImages));
      } catch (error) {
        console.error('Error fetching trainer images:', error);
        // Fallback to trainer profile image
        setDisplayImages([{ 
          id: 'fallback', 
          type: 'profile', 
          url: trainer.image, 
          mediaType: 'IMAGE' 
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainerImages();
  }, [trainer.id, trainer.image]);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-muted/30 border-0 relative overflow-hidden">
      <CardContent className="p-0">
        {/* Interactive elements overlay */}
        {children}
        
        {/* Gallery Grid */}
        <div className="relative">
          {displayImages.length > 0 ? (
            <div className={`grid gap-1 aspect-square ${getGridClasses(gridSize)}`}>
              {displayImages.map((image, index) => (
                <div key={image.id} className="relative overflow-hidden bg-muted">
                  <img
                    src={image.url}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {image.mediaType === 'VIDEO' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 rounded-full p-2">
                        <Play className="h-4 w-4 text-white fill-current" />
                      </div>
                    </div>
                  )}
                  {image.type === 'instagram' && (
                    <div className="absolute bottom-1 right-1 bg-black/70 rounded-full p-1">
                      <Instagram className="h-2 w-2 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Fill remaining slots with trainer image if needed */}
              {displayImages.length < gridSize && Array.from({ length: gridSize - displayImages.length }).map((_, index) => (
                <div key={`filler-${index}`} className="relative overflow-hidden bg-muted/50">
                  <img
                    src={trainer.image}
                    alt={trainer.name}
                    className="w-full h-full object-cover opacity-60"
                  />
                </div>
              ))}
            </div>
          ) : loading ? (
            <div className="aspect-square relative flex items-center justify-center bg-muted">
              <ImageIcon className="h-8 w-8 text-muted-foreground animate-pulse" />
            </div>
          ) : (
            // Single hero image fallback
            <div className="aspect-square relative">
              <img
                src={trainer.image}
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
              <h3 className="font-bold text-lg mb-1 text-white drop-shadow-sm">
                {trainer.name}
              </h3>
              
              <div className="flex items-center gap-3 text-white/90 text-sm mb-2">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="font-medium">{trainer.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{trainer.location}</span>
                </div>
              </div>
              
              {/* Top specialties */}
              <div className="flex gap-1 flex-wrap">
                {trainer.specialties.slice(0, 2).map((specialty) => (
                  <Badge 
                    key={specialty} 
                    variant="secondary" 
                    className="text-xs bg-white/20 text-white border-white/30 backdrop-blur-sm"
                  >
                    {specialty}
                  </Badge>
                ))}
                {trainer.specialties.length > 2 && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-white/20 text-white border-white/30 backdrop-blur-sm"
                  >
                    +{trainer.specialties.length - 2}
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