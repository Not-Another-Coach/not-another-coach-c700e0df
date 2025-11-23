import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Calendar, MapPin, Star, Users, Award, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContentVisibility } from '@/hooks/useContentVisibility';
import { VisibilityAwareName } from '@/components/ui/VisibilityAwareName';
import { useProgressiveNameVisibility } from '@/hooks/useProgressiveNameVisibility';

interface Trainer {
  id: string;
  name: string;
  profile_photo_url?: string;
  bio?: string;
  location?: string;
  specializations?: string[];
  years_experience?: number;
  rating?: number;
  client_count?: number;
  offers_discovery_call?: boolean | null;
  price_range?: string;
  transformation_specialties?: string[];
}

interface AnonymousProfileCardProps {
  trainer: Trainer;
  onMessage: () => void;
  onBookDiscovery?: () => void;
}

export const AnonymousProfileCard: React.FC<AnonymousProfileCardProps> = ({
  trainer,
  onMessage,
  onBookDiscovery
}) => {
  const navigate = useNavigate();

  // Use visibility system for anonymous users
  const { canViewContent } = useContentVisibility({
    engagementStage: 'browsing',
    isGuest: true
  });

  // Get visibility-aware trainer name
  const basicInfoVisibility = canViewContent.basicInformation ? 'visible' : 'hidden';
  const { displayName } = useProgressiveNameVisibility({
    trainer: {
      id: trainer.id,
      first_name: (trainer as any).first_name || (trainer as any).firstName,
      last_name: (trainer as any).last_name || (trainer as any).lastName,
      name: trainer.name
    },
    visibilityState: basicInfoVisibility,
    engagementStage: 'browsing'
  });

  return (
    <div className="space-y-6">
      {/* Call-to-action banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 rounded-lg border">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Connect with {displayName}</h3>
            <p className="text-sm text-muted-foreground">
              Sign up to message trainers, book calls, and access exclusive content
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth?signup=true')}>
              Join Free
            </Button>
          </div>
        </div>
      </div>

      {/* Main profile card */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Header section */}
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                <AvatarImage src={trainer.profile_photo_url} alt={displayName} />
                <AvatarFallback className="text-lg">
                  {displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <VisibilityAwareName
                  trainer={{
                    id: trainer.id,
                    first_name: (trainer as any).first_name || (trainer as any).firstName,
                    last_name: (trainer as any).last_name || (trainer as any).lastName,
                    name: trainer.name
                  }}
                  visibilityState={basicInfoVisibility}
                  engagementStage="browsing"
                  className="text-2xl font-bold mb-2 block"
                />
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 flex-wrap">
                  {trainer.location && canViewContent.basicInformation && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{trainer.location}</span>
                    </div>
                  )}
                  {trainer.years_experience && (
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      <span>{trainer.years_experience} years experience</span>
                    </div>
                  )}
                  {trainer.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span>{trainer.rating}/5</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {trainer.specializations?.slice(0, 3).map((spec, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                  {trainer.specializations && trainer.specializations.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{trainer.specializations.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio section */}
          {trainer.bio && (
            <div className="p-6 border-b">
              <p className="text-muted-foreground leading-relaxed">
                {trainer.bio.length > 200 ? `${trainer.bio.substring(0, 200)}...` : trainer.bio}
              </p>
            </div>
          )}

          {/* Quick stats */}
          <div className="p-6 border-b bg-muted/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trainer.client_count && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-lg font-semibold">{trainer.client_count}+</div>
                  <div className="text-xs text-muted-foreground">Clients Helped</div>
                </div>
              )}
              
              {trainer.years_experience && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-lg font-semibold">{trainer.years_experience}</div>
                  <div className="text-xs text-muted-foreground">Years Experience</div>
                </div>
              )}

              {trainer.transformation_specialties && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-lg font-semibold">{trainer.transformation_specialties.length}</div>
                  <div className="text-xs text-muted-foreground">Specialties</div>
                </div>
              )}

              {trainer.rating && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Star className="h-5 w-5 text-primary fill-primary" />
                  </div>
                  <div className="text-lg font-semibold">{trainer.rating}/5</div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
              )}
            </div>
          </div>

          {/* Transformation specialties */}
          {trainer.transformation_specialties && trainer.transformation_specialties.length > 0 && (
            <div className="p-6 border-b">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Transformation Focus
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {trainer.transformation_specialties.map((specialty, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    <span>{specialty}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => navigate('/auth')}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Heart className="h-4 w-4" />
                Save Trainer
              </Button>
              
              <Button 
                onClick={onMessage}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Send Message
              </Button>
              
              {trainer.offers_discovery_call === true && (
                <Button 
                  onClick={onBookDiscovery}
                  className="flex items-center gap-2"
                  variant="secondary"
                >
                  <Calendar className="h-4 w-4" />
                  Book Call
                </Button>
              )}
            </div>

            {trainer.price_range && (
              <div className="mt-4 p-3 bg-muted/30 rounded-lg text-center">
                <span className="text-sm text-muted-foreground">Starting from </span>
                <span className="font-semibold text-primary">{trainer.price_range}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bottom call-to-action */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold mb-2">Ready to Transform Your Fitness Journey?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Join thousands of people who've found their perfect trainer match
          </p>
          <Button onClick={() => navigate('/auth?signup=true')} size="lg">
            Get Started for Free
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};