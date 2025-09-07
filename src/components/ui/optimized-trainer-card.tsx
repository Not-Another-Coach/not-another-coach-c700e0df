import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  Star, 
  MessageCircle, 
  Calendar, 
  Clock,
  MapPin,
  DollarSign,
  Users,
  Award
} from 'lucide-react';
import { UnifiedTrainer } from '@/hooks/useUnifiedTrainerData';

interface OptimizedTrainerCardProps {
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
}

export const OptimizedTrainerCard = memo(({
  trainer,
  onSave,
  onUnsave,
  onShortlist,
  onRemoveFromShortlist,
  onStartConversation,
  onBookDiscoveryCall,
  onJoinWaitlist,
  onViewProfile,
  isShortlistFull
}: OptimizedTrainerCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderActionButtons = () => {
    switch (trainer.status) {
      case 'saved':
        return (
          <div className="space-y-2">
            <Button
              onClick={() => onShortlist(trainer.id)}
              className="w-full"
              size="sm"
              disabled={isShortlistFull}
            >
              <Star className="h-3 w-3 mr-1" />
              {isShortlistFull ? 'Shortlist Full' : 'Add to Shortlist'}
            </Button>
            <Button
              onClick={() => onUnsave(trainer.id)}
              className="w-full"
              size="sm"
              variant="outline"
            >
              Remove
            </Button>
          </div>
        );

      case 'shortlisted':
        const shouldShowWaitlist = trainer.availabilityStatus === 'waitlist' && !trainer.hasActiveCall;
        const shouldShowDiscoveryCall = trainer.offersDiscoveryCall && 
                                       (!trainer.availabilityStatus || 
                                        trainer.availabilityStatus !== 'waitlist' || 
                                        trainer.allowDiscoveryOnWaitlist) && 
                                       !trainer.hasActiveCall;
        
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStartConversation(trainer.id)}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Chat
              </Button>
              
              {shouldShowWaitlist ? (
                <Button
                  size="sm"
                  onClick={() => onJoinWaitlist(trainer.id)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Waitlist
                </Button>
              ) : shouldShowDiscoveryCall ? (
                <Button
                  size="sm"
                  onClick={() => onBookDiscoveryCall(trainer.id)}
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Book Call
                </Button>
              ) : null}
            </div>
            
            <Button
              onClick={() => onRemoveFromShortlist(trainer.id)}
              className="w-full"
              size="sm"
              variant="outline"
            >
              Remove from Shortlist
            </Button>
          </div>
        );

      case 'discovery':
        return (
          <div className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStartConversation(trainer.id)}
              className="w-full"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Continue Chat
            </Button>
            {trainer.hasActiveCall && (
              <Button size="sm" variant="default" className="w-full">
                <Calendar className="h-3 w-3 mr-1" />
                Call Scheduled
              </Button>
            )}
          </div>
        );

      case 'waitlist':
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStartConversation(trainer.id)}
            className="w-full"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Message
          </Button>
        );

      default:
        return (
          <Button
            onClick={() => onSave(trainer.id)}
            className="w-full"
            size="sm"
          >
            <Heart className="h-3 w-3 mr-1" />
            Save Trainer
          </Button>
        );
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              {!imageError && trainer.profilePhotoUrl && (
                <AvatarImage
                  src={trainer.profilePhotoUrl}
                  alt={trainer.name}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  className={imageLoaded ? 'opacity-100' : 'opacity-0'}
                />
              )}
              <AvatarFallback className={imageLoaded && !imageError ? 'opacity-0' : 'opacity-100'}>
                {getInitials(trainer.name)}
              </AvatarFallback>
            </Avatar>
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-muted animate-pulse rounded-full" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold truncate">{trainer.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {trainer.location}
                </p>
              </div>
              <Badge 
                variant="secondary" 
                className={trainer.statusColor}
              >
                {trainer.statusLabel}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Specializations */}
          {trainer.specializations.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-1">
                {trainer.specializations.slice(0, 3).map((spec, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
                {trainer.specializations.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{trainer.specializations.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center">
              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
              <span>{trainer.rating}</span>
              <span className="ml-1">({trainer.reviewCount})</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-3 w-3 mr-1" />
              <span>£{trainer.hourlyRate}/hr</span>
            </div>
          </div>

          {/* Discovery Call Badge */}
          {trainer.offersDiscoveryCall && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              <Award className="h-3 w-3 mr-1" />
              Free Discovery Call
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 space-y-2">
          {renderActionButtons()}
          <Button
            onClick={() => onViewProfile(trainer.id)}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            View Full Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedTrainerCard.displayName = 'OptimizedTrainerCard';