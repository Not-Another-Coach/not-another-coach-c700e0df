import React, { useState, useCallback, useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UnifiedTrainer } from '@/hooks/useUnifiedTrainerData';
import { MatchBadge } from '@/components/MatchBadge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Heart, 
  Star, 
  MessageCircle, 
  Calendar, 
  Clock,
  MapPin,
  DollarSign,
  Users,
  Award,
  Bookmark,
  BookmarkCheck,
  UserPlus,
  UserMinus,
  Eye
} from 'lucide-react';

interface InstagramTrainerCardProps {
  trainer: UnifiedTrainer;
  onSave: (trainerId: string) => void;
  onUnsave: (trainerId: string) => void;
  onShortlist: (trainerId: string) => void;
  onRemoveFromShortlist: (trainerId: string) => void;
  onStartConversation: (trainerId: string) => void;
  onBookDiscoveryCall: (trainerId: string) => void;
  onJoinWaitlist: (trainerId: string) => void;
  onViewProfile: (trainerId: string) => void;
  isShortlistFull: boolean;
  matchScore?: number;
  matchReasons?: string[];
}

const getGridClasses = (actualImageCount: number): string => {
  switch (actualImageCount) {
    case 1: return "grid-cols-1";
    case 2: return "grid-cols-2";
    case 3: return "grid-cols-2"; // 2x2 with 3 images: top row has 2, bottom row has 1 spanning both
    case 4: return "grid-cols-2";
    case 5: return "grid-cols-3"; // 3x2 with 5 images
    case 6: return "grid-cols-3";
    case 7: return "grid-cols-3"; // 3x3 with 7 images
    case 8: return "grid-cols-3";
    case 9: return "grid-cols-3";
    case 10: return "grid-cols-4"; // 4x3 with 10 images
    case 11: return "grid-cols-4";
    case 12:
    default: return "grid-cols-4";
  }
};

const getRecommendedGridSizeForCount = (count: number) => {
  if (count <= 3) return 1;
  if (count <= 5) return 4;
  if (count <= 8) return 6;
  if (count <= 11) return 9;
  return 12;
};

export const InstagramTrainerCard = memo(({ 
  trainer, 
  onSave,
  onUnsave,
  onShortlist,
  onRemoveFromShortlist,
  onStartConversation,
  onBookDiscoveryCall,
  onJoinWaitlist,
  onViewProfile,
  isShortlistFull,
  matchScore = 0, 
  matchReasons = []
}: InstagramTrainerCardProps) => {
  const [displayImages, setDisplayImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridSize, setGridSize] = useState<number>(6);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Fetch trainer images from uploaded and instagram tables
  useEffect(() => {
    const fetchTrainerImages = async () => {
      if (!trainer?.id) return;
      
      setLoading(true);
      try {
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

        // Apply grid size slicing
        const slicedImages = allImages.slice(0, autoGridSize);
        setDisplayImages(slicedImages);
      } catch (error) {
        console.error('Error fetching trainer images:', error);
        // Fallback to trainer profile image
        setGridSize(1);
        setDisplayImages(trainer.profilePhotoUrl ? [{ 
          id: 'fallback', 
          type: 'profile', 
          url: trainer.profilePhotoUrl, 
          mediaType: 'IMAGE' 
        }] : []);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainerImages();
  }, [trainer?.id, trainer?.profilePhotoUrl]);

  if (!trainer) return null;

  const displayPrice = trainer.hourlyRate ? `$${trainer.hourlyRate}/hr` : 'Price on request';
  const gridClasses = getGridClasses(displayImages.length);
  const isSaved = trainer.status === 'saved';
  const isShortlisted = !!trainer.shortlistedAt;

  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden bg-card shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-3xl">
      {/* Header with profile info */}
      <div className="flex items-center justify-between p-4 border-b border-border/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {trainer.profilePhotoUrl && !imageError ? (
                <img
                  src={trainer.profilePhotoUrl}
                  alt={trainer.name}
                  className="w-full h-full object-cover"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <span className="text-primary font-semibold text-sm">
                    {trainer.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate text-foreground">{trainer.name}</h3>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {trainer.location || 'Location not specified'}
            </p>
          </div>
        </div>
        {matchScore > 0 && (
          <MatchBadge score={matchScore} reasons={matchReasons || []} className="text-xs" />
        )}
      </div>

      {/* Image Grid */}
      <div className="relative aspect-square bg-muted">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : displayImages.length > 0 ? (
          <div className={`grid ${gridClasses} gap-0.5 h-full p-0.5`}>
            {displayImages.map((image, idx) => (
              <div 
                key={`${image.id}-${idx}`}
                className={`relative overflow-hidden bg-muted ${
                  displayImages.length === 3 && idx === 2 ? 'col-span-2' : ''
                } ${
                  displayImages.length === 5 && idx >= 3 ? 'col-span-1' : ''
                } ${
                  displayImages.length === 7 && idx >= 6 ? 'col-span-1' : ''
                } ${
                  displayImages.length === 10 && idx >= 8 ? 'col-span-2' : ''
                } ${
                  displayImages.length === 11 && idx >= 8 ? 'col-span-1' : ''
                }`}
              >
                <img
                  src={image.url}
                  alt={`${trainer.name} photo ${idx + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-primary font-bold text-xl">
                  {trainer.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">No photos available</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3">
        {/* Specialties */}
        {trainer.specializations && trainer.specializations.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {trainer.specializations.slice(0, 3).map((specialty, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5">
                {specialty}
              </Badge>
            ))}
            {trainer.specializations.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{trainer.specializations.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{trainer.rating || '4.8'}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span>{displayPrice}</span>
            </div>
          </div>
          {trainer.statusLabel && (
            <Badge 
              variant={trainer.statusColor === 'green' ? 'default' : 'secondary'}
              className="text-xs px-2 py-0.5"
            >
              {trainer.statusLabel}
            </Badge>
          )}
        </div>

        {/* Match Reasons */}
        {matchReasons.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-foreground">Why this trainer matches:</p>
            <div className="space-y-0.5">
              {matchReasons.slice(0, 2).map((reason, idx) => (
                <p key={idx} className="text-xs text-muted-foreground">• {reason}</p>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => isSaved ? onUnsave(trainer.id) : onSave(trainer.id)}
              className="h-8 w-8 p-0"
            >
              {isSaved ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => isShortlisted ? onRemoveFromShortlist(trainer.id) : onShortlist(trainer.id)}
              className="h-8 w-8 p-0"
              disabled={!isShortlisted && isShortlistFull}
            >
              {isShortlisted ? (
                <UserMinus className="h-4 w-4 text-primary" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStartConversation(trainer.id)}
              className="h-8 w-8 p-0"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {trainer.statusLabel === 'Available' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBookDiscoveryCall(trainer.id)}
                className="text-xs h-7 px-2"
              >
                <Calendar className="h-3 w-3 mr-1" />
                Book Call
              </Button>
            )}

            <Button
              variant="default"
              size="sm"
              onClick={() => onViewProfile(trainer.id)}
              className="text-xs h-7 px-3"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

InstagramTrainerCard.displayName = 'InstagramTrainerCard';