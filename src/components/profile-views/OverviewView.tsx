import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PositionedAvatar } from '@/components/ui/positioned-avatar';
import { Star, MapPin, Clock, Award, Users, MessageCircle, Calendar, User } from 'lucide-react';
import { AnyTrainer } from '@/types/trainer';
import { getTrainerDisplayPrice } from '@/lib/priceUtils';
import { useContentVisibility } from '@/hooks/useContentVisibility';
import { VisibilityAwarePricing } from '@/components/ui/VisibilityAwarePricing';

interface OverviewViewProps {
  trainer: AnyTrainer;
  onMessage?: () => void;
  onBookDiscovery?: () => void;
}

export const OverviewView = ({ trainer, onMessage, onBookDiscovery }: OverviewViewProps) => {
  const { getVisibility } = useContentVisibility({
    engagementStage: 'browsing' // Default stage for overview
  });
  // Generate initials from trainer name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className="relative mx-auto sm:mx-0">
              <PositionedAvatar 
                src={trainer.image || undefined}
                alt={trainer.name}
                fallback={trainer.name ? getInitials(trainer.name) : 'PT'}
                position={trainer.profileImagePosition}
                size="2xl"
                className="border-4 border-secondary/20"
              />
              {trainer.certifications.length > 0 && (
                <div className="absolute -bottom-1 -right-1 bg-success text-white rounded-full p-2">
                  <Award className="h-4 w-4" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{trainer.name}</h1>
              
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-accent text-accent" />
                  <span className="font-semibold text-lg">{trainer.rating}</span>
                  <span className="text-muted-foreground">({trainer.reviews} reviews)</span>
                </div>
                <Badge variant="secondary">{trainer.experience}</Badge>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm sm:text-base">{trainer.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm sm:text-base">{trainer.availability}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm sm:text-base">{trainer.trainingType.join(', ')}</span>
                </div>
              </div>
              
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                {trainer.description}
              </p>
            </div>
            
            <div className="text-center sm:text-right min-w-0 w-full sm:w-auto">
              <VisibilityAwarePricing 
                pricing={getTrainerDisplayPrice(trainer)}
                visibilityState={getVisibility('pricing_discovery_call')}
                className="text-xl sm:text-2xl font-bold text-primary mb-1 break-words"
                showEngagementPrompt={true}
                engagementPromptText="Pricing available after shortlisting"
              />
              <div className="text-xs sm:text-sm text-muted-foreground">package pricing</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specialties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Specialisations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {trainer.specialties.map((specialty) => (
              <Badge key={specialty} variant="outline" className="text-sm">
                {specialty}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Qualifications & Certifications */}
      {trainer.certifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Qualifications & Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {trainer.certifications.map((cert, index) => (
                <div key={`cert-${index}`} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Award className="h-4 w-4 text-accent flex-shrink-0" />
                  <span className="text-sm font-medium break-words">{cert}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        {onMessage && (
          <Button onClick={onMessage} className="w-full sm:flex-1">
            <MessageCircle className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        )}
        {onBookDiscovery && trainer.offers_discovery_call && (
          <Button onClick={onBookDiscovery} variant="outline" className="w-full sm:flex-1">
            <Calendar className="w-4 h-4 mr-2" />
            Book Discovery Call
          </Button>
        )}
      </div>
    </div>
  );
};