import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PositionedAvatar } from '@/components/ui/positioned-avatar';
import { Star, MapPin, Clock, Award, Users, MessageCircle, Calendar, User } from 'lucide-react';
import { AnyTrainer } from '@/types/trainer';
import { getTrainerDisplayPrice } from '@/lib/priceUtils';
import { useContentVisibility } from '@/hooks/useContentVisibility';
import { VisibilityAwarePricing } from '@/components/ui/VisibilityAwarePricing';
import { useEngagementStage } from '@/hooks/useEngagementStage';
import { VisibilityAwareImage } from '@/components/ui/VisibilityAwareImage';
import { VisibilityAwareText } from '@/components/ui/VisibilityAwareText';
import { VisibilityAwareSection } from '@/components/ui/VisibilityAwareSection';
import { VisibilityAwareBasicInfo } from '@/components/ui/VisibilityAwareBasicInfo';

interface OverviewViewProps {
  trainer: AnyTrainer;
  onMessage?: () => void;
  onBookDiscovery?: () => void;
}

export const OverviewView = ({ trainer, onMessage, onBookDiscovery }: OverviewViewProps) => {
  const { stage: engagementStage, isGuest } = useEngagementStage(trainer.id);
  const { getVisibility } = useContentVisibility({
    engagementStage,
    isGuest
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
              {getVisibility('profile_image') === 'visible' ? (
                <>
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
                </>
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40">
                  <VisibilityAwareImage
                    src={trainer.image || ''}
                    alt={trainer.name}
                    visibilityState={getVisibility('profile_image')}
                    className="rounded-full border-4 border-secondary/20"
                    lockMessage="Profile image unlocks as you engage"
                    showLockIcon={true}
                  />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <VisibilityAwareBasicInfo
                name={trainer.name}
                location={trainer.location}
                visibilityState={getVisibility('basic_information')}
                variant="default"
                className="mb-3"
                trainer={{
                  id: trainer.id,
                  first_name: (trainer as any).firstName || (trainer as any).first_name,
                  last_name: (trainer as any).lastName || (trainer as any).last_name,
                  name: trainer.name
                }}
                engagementStage={engagementStage || 'browsing'}
              />
              
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
                  <Clock className="h-4 w-4" />
                  <span className="text-sm sm:text-base">{trainer.availability}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm sm:text-base">{trainer.trainingType.join(', ')}</span>
                </div>
              </div>
              
              <VisibilityAwareText
                visibilityState={getVisibility('description_bio')}
                className="text-muted-foreground leading-relaxed text-sm sm:text-base"
                placeholder="Description unlocks with engagement"
                showLockIcon={false}
              >
                {trainer.description}
              </VisibilityAwareText>
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
          <VisibilityAwareSection
            visibilityState={getVisibility('specializations')}
            placeholder="Specializations unlock with engagement"
            title="Specializations"
          >
            <div className="flex flex-wrap gap-2">
              {trainer.specialties.map((specialty) => (
                <Badge key={specialty} variant="outline" className="text-sm">
                  {specialty}
                </Badge>
              ))}
            </div>
          </VisibilityAwareSection>
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
            <VisibilityAwareSection
              visibilityState={getVisibility('certifications_qualifications')}
              placeholder="Qualifications unlock with engagement"
              title="Qualifications & Certifications"
            >
              <div className="grid grid-cols-1 gap-3">
                {trainer.certifications.map((cert, index) => (
                  <div key={`cert-${index}`} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <Award className="h-4 w-4 text-accent flex-shrink-0" />
                    <span className="text-sm font-medium break-words">{cert}</span>
                  </div>
                ))}
              </div>
            </VisibilityAwareSection>
          </CardContent>
        </Card>
      )}
    </div>
  );
};