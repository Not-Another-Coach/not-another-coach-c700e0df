import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Heart, X, Star, MapPin, Instagram, Play, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trainer } from '@/types/trainer';
import { MatchBadge } from '@/components/MatchBadge';
import { useSavedTrainers } from '@/hooks/useSavedTrainers';
import { getTrainerDisplayPrice } from '@/lib/priceUtils';
import { supabase } from '@/integrations/supabase/client';
import { FileUploadService } from '@/services';
import { useEffect } from 'react';
import { useContentVisibility } from '@/hooks/useContentVisibility';
import { useEngagementStage } from '@/hooks/useEngagementStage';
import { VisibilityAwareGallery } from '@/components/ui/VisibilityAwareGallery';
import { VisibilityAwarePricing } from '@/components/ui/VisibilityAwarePricing';
import { VisibilityAwareName } from '@/components/ui/VisibilityAwareName';
import { getRecommendedGridSizeForCount } from '@/hooks/useTrainerImages';

interface SwipeableInstagramCardProps {
  trainer: Trainer;
  onSwipe: (direction: 'left' | 'right', trainer: Trainer) => void;
  matchScore?: number;
  matchReasons?: string[];
  index: number;
}

const getGridClasses = (actualImageCount: number): string => {
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
    case 6:
      return "grid-cols-3 grid-rows-2";
    case 7:
    case 8:
      return "grid-cols-4 grid-rows-2";
    case 9:
      return "grid-cols-3 grid-rows-3";
    default:
      return actualImageCount <= 3 ? "grid-cols-3" : "grid-cols-4 grid-rows-3";
  }
};


export const SwipeableInstagramCard = ({ 
  trainer, 
  onSwipe, 
  matchScore = 0, 
  matchReasons = [], 
  index 
}: SwipeableInstagramCardProps) => {
  const [exitX, setExitX] = useState(0);
  const [displayImages, setDisplayImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridSize, setGridSize] = useState<number>(6);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const { isTrainerSaved, saveTrainer, unsaveTrainer } = useSavedTrainers();
  const isSaved = isTrainerSaved(trainer.id);

  const cardRef = useRef<HTMLDivElement>(null);

  // Add visibility logic
  const { stage, isGuest } = useEngagementStage(trainer.id);
  const { getVisibility, loading: visibilityLoading } = useContentVisibility({
    engagementStage: stage || 'browsing',
    isGuest
  });

  const galleryVisibility = getVisibility('gallery_images');

  // Fetch trainer images for Instagram gallery
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
            url: FileUploadService.getPublicUrl('trainer-images', img.file_path),
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

        // Display all images - grid layout adapts to count
        setDisplayImages(allImages);
      } catch (error) {
        console.error('Error fetching trainer images:', error);
        // Fallback to trainer profile image
        setGridSize(1);
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

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      await unsaveTrainer(trainer.id);
    } else {
      await saveTrainer(trainer.id);
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    // Determine swipe direction based on offset and velocity
    if (Math.abs(velocity) >= 500) {
      if (velocity > 0) {
        setExitX(1000);
        onSwipe('right', trainer);
      } else {
        setExitX(-1000);
        onSwipe('left', trainer);
      }
    } else if (Math.abs(offset) > 150) {
      if (offset > 0) {
        setExitX(1000);
        onSwipe('right', trainer);
      } else {
        setExitX(-1000);
        onSwipe('left', trainer);
      }
    }
  };

  // Color overlay based on swipe direction
  const likeOpacity = useTransform(x, [0, 150], [0, 1]);
  const rejectOpacity = useTransform(x, [-150, 0], [1, 0]);

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing",
        index > 0 && "pointer-events-none"
      )}
      style={{
        x,
        rotate,
        opacity,
        zIndex: 10 - index,
        scale: index === 0 ? 1 : 1 - (index * 0.05),
        y: index * 8,
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX } : {}}
      initial={{ scale: 1.1, opacity: 0 }}
      whileInView={{ scale: index === 0 ? 1 : 1 - (index * 0.05), opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      exit={{ x: exitX, opacity: 0 }}
    >
      <Card className="relative w-full h-full group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-muted/30 border-0 overflow-hidden">
        {/* Action overlays */}
        <motion.div 
          className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-10"
          style={{ opacity: likeOpacity }}
        >
          <div className="bg-green-500 rounded-full p-4 rotate-12 shadow-lg">
            <Heart className="w-12 h-12 text-white fill-white" />
          </div>
        </motion.div>
        
        <motion.div 
          className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-10"
          style={{ opacity: rejectOpacity }}
        >
          <div className="bg-red-500 rounded-full p-4 -rotate-12 shadow-lg">
            <X className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        {/* Heart Button */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "absolute top-4 left-4 z-20 rounded-full w-12 h-12 p-0",
            "bg-white/90 backdrop-blur shadow-lg border border-white/20",
            "hover:bg-red-50 hover:border-red-200 transition-all duration-200",
            isSaved ? "bg-red-50 border-red-200" : ""
          )}
          onClick={handleToggleSave}
        >
          <Heart 
            className={cn(
              "h-5 w-5 transition-all duration-200",
              isSaved 
                ? "text-red-500 fill-red-500" 
                : "text-red-400 hover:text-red-500 hover:fill-red-500"
            )} 
          />
        </Button>

        {/* Match Badge */}
        {matchScore > 0 && (
          <div className="absolute top-4 right-4 z-20">
            <MatchBadge score={matchScore} reasons={matchReasons} />
          </div>
        )}

        <CardContent className="p-0 relative h-full">
          {/* Instagram Gallery Grid with Visibility */}
          <div className="relative h-full">
            {displayImages.length > 0 ? (
              <VisibilityAwareGallery
                images={displayImages}
                visibilityState={galleryVisibility}
                gridClasses={`h-full ${getGridClasses(displayImages.length)}`}
                lockMessage="Swipe to unlock gallery"
              />
            ) : loading || visibilityLoading ? (
              <div className="h-full relative flex items-center justify-center bg-muted">
                <ImageIcon className="h-8 w-8 text-muted-foreground animate-pulse" />
              </div>
            ) : (
              // Single hero image fallback
              <div className="h-full relative">
                <img
                  src={trainer.image}
                  alt={trainer.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            
            {/* Content indicator */}
            {displayImages.some(img => img.type === 'instagram') && (
              <div className="absolute top-16 left-4 z-10">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                  <Instagram className="w-3 h-3 mr-1" />
                  Live Feed
                </Badge>
              </div>
            )}
          </div>

          {/* Trainer Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-2xl mb-1 text-white drop-shadow-lg">
                    <VisibilityAwareName 
                      trainer={trainer}
                      visibilityState={getVisibility('basic_information')}
                      engagementStage={stage}
                      variant="overlay"
                    />
                  </h3>
                  
                  <div className="flex items-center gap-3 text-white/90 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current text-yellow-400" />
                      <span className="font-medium">{trainer.rating}</span>
                      <span>({trainer.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{trainer.location}</span>
                    </div>
                  </div>
                </div>
                
                {/* Price */}
                <div className="text-right">
                  <VisibilityAwarePricing
                    pricing={getTrainerDisplayPrice(trainer)}
                    visibilityState={getVisibility('pricing_discovery_call')}
                    className="text-2xl font-bold text-white drop-shadow-lg"
                  />
                  <div className="text-sm text-white/80">{trainer.experience}</div>
                </div>
              </div>
              
              {/* Top specialties and training types */}
              <div className="flex items-center justify-between">
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
                
                {/* Training types */}
                <div className="flex gap-1">
                  {trainer.trainingType.slice(0, 2).map((type) => (
                    <span key={type} className="text-xs bg-primary/20 text-white px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                      {type === "In-Person" ? "🧍" : type === "Online" ? "💻" : type === "Group" ? "👥" : type === "Hybrid" ? "🔄" : ""}
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};