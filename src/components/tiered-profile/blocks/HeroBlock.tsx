import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MapPin, Clock, Award, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EngagementStage } from '@/hooks/useEngagementStage';

interface HeroBlockProps {
  trainer: any;
  stage: EngagementStage;
  isClient: boolean;
  isSaved: boolean;
  onLike: () => void;
  isUpdatingStage: boolean;
}

export const HeroBlock = ({ 
  trainer, 
  stage, 
  isClient, 
  isSaved, 
  onLike, 
  isUpdatingStage 
}: HeroBlockProps) => {
  const getAvailabilityStatus = () => {
    if (trainer.client_status === 'paused') return { text: 'Not taking clients', color: 'bg-red-500' };
    if (trainer.client_status === 'waitlist') return { text: 'Waitlist only', color: 'bg-orange-500' };
    return { text: 'Taking clients', color: 'bg-green-500' };
  };

  const availability = getAvailabilityStatus();

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={trainer.profile_photo_url} />
          <AvatarFallback>
            {trainer.first_name?.[0]}{trainer.last_name?.[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold">
              {trainer.first_name} {trainer.last_name}
            </h3>
            {trainer.is_verified && (
              <CheckCircle className="w-5 h-5 text-blue-500" />
            )}
          </div>

          {trainer.tagline && (
            <p className="text-muted-foreground">{trainer.tagline}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {/* Coaching Style Vibe Tags */}
            {trainer.coaching_styles?.slice(0, 2).map((style: string) => (
              <Badge key={style} variant="secondary" className="text-xs">
                {style}
              </Badge>
            ))}

            {/* Location Type */}
            <Badge variant="outline" className="text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              {trainer.delivery_format || 'Hybrid'}
            </Badge>
          </div>
        </div>

        {/* Like Button - Only for browsing stage */}
        {stage === 'browsing' && isClient && (
          <Button
            variant={isSaved ? "default" : "outline"}
            size="sm"
            onClick={onLike}
            disabled={isUpdatingStage}
            className={cn(
              "min-w-[100px]",
              isSaved && "bg-red-500 hover:bg-red-600"
            )}
          >
            <Heart className={cn("w-4 h-4 mr-2", isSaved && "fill-current")} />
            {isUpdatingStage ? '...' : isSaved ? 'Liked' : 'Like'}
          </Button>
        )}
      </div>

      {/* Availability Banner */}
      <div className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm text-white",
        availability.color
      )}>
        <div className="w-2 h-2 bg-white rounded-full" />
        {availability.text}
        {trainer.next_available_date && (
          <span className="text-white/80">
            • Starting {new Date(trainer.next_available_date).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Goal Tags - Primary specializations visible at browsing stage */}
      <div className="flex flex-wrap gap-2">
        {trainer.specializations?.slice(0, 4).map((spec: string) => (
          <Badge key={spec} variant="outline" className="text-xs">
            <Award className="w-3 h-3 mr-1" />
            {spec}
          </Badge>
        ))}
      </div>

      {/* Basic stats visible at browsing stage */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {trainer.experience || '5+'} years experience
        </div>
        <div className="flex items-center gap-1">
          ⭐ {trainer.rating || 4.8} ({trainer.total_ratings || 0} reviews)
        </div>
      </div>
    </div>
  );
};