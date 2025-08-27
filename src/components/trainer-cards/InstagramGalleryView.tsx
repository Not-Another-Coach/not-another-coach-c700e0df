import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Instagram, Play } from "lucide-react";
import { Trainer } from "@/components/TrainerCard";
import { getTrainerDisplayPrice } from "@/lib/priceUtils";
import { useInstagramIntegration } from "@/hooks/useInstagramIntegration";
import { useEffect, useState } from "react";

interface InstagramGalleryViewProps {
  trainer: Trainer;
  children?: React.ReactNode; // For CTA buttons and interactive elements
}

export const InstagramGalleryView = ({ trainer, children }: InstagramGalleryViewProps) => {
  const { selectedMedia } = useInstagramIntegration();
  const [displayMedia, setDisplayMedia] = useState<any[]>([]);

  useEffect(() => {
    // Use trainer's selected Instagram media or fallback to placeholder images
    if (selectedMedia.length > 0) {
      setDisplayMedia(selectedMedia.slice(0, 6));
    } else {
      // Fallback to trainer image and placeholder gallery
      setDisplayMedia([
        { media_url: trainer.image, media_type: 'IMAGE' },
        // Add some placeholder gallery items if needed
      ]);
    }
  }, [selectedMedia, trainer.image]);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-muted/30 border-0 relative overflow-hidden">
      <CardContent className="p-0">
        {/* Interactive elements overlay */}
        {children}
        
        {/* Instagram Gallery Grid */}
        <div className="relative">
          {displayMedia.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 aspect-square">
              {displayMedia.map((media, index) => (
                <div key={index} className="relative overflow-hidden bg-muted">
                  <img
                    src={media.media_url}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {media.media_type === 'VIDEO' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 rounded-full p-2">
                        <Play className="h-4 w-4 text-white fill-current" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Fill remaining slots with trainer image if needed */}
              {displayMedia.length < 6 && Array.from({ length: 6 - displayMedia.length }).map((_, index) => (
                <div key={`filler-${index}`} className="relative overflow-hidden bg-muted/50">
                  <img
                    src={trainer.image}
                    alt={trainer.name}
                    className="w-full h-full object-cover opacity-60"
                  />
                </div>
              ))}
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
          
          {/* Instagram indicator */}
          {selectedMedia.length > 0 && (
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