import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PositionedAvatar } from '@/components/ui/positioned-avatar';
import { Star, MapPin, Clock, Award, Users, MessageCircle, Calendar, User } from 'lucide-react';
import { Trainer } from '@/components/TrainerCard';
import { getTrainerDisplayPrice } from '@/lib/priceUtils';

interface OverviewViewProps {
  trainer: Trainer;
  onMessage?: () => void;
  onBookDiscovery?: () => void;
}

export const OverviewView = ({ trainer, onMessage, onBookDiscovery }: OverviewViewProps) => {
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
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="relative">
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
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{trainer.name}</h1>
              
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-accent text-accent" />
                  <span className="font-semibold text-lg">{trainer.rating}</span>
                  <span className="text-muted-foreground">({trainer.reviews} reviews)</span>
                </div>
                <Badge variant="secondary">{trainer.experience}</Badge>
              </div>
              
              <div className="flex items-center gap-6 text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{trainer.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{trainer.availability}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{trainer.trainingType.join(', ')}</span>
                </div>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                {trainer.description}
              </p>
            </div>
            
            <div className="text-right min-w-0">
              <div className="text-2xl font-bold text-primary mb-1 break-words">
                {getTrainerDisplayPrice(trainer)}
              </div>
              <div className="text-sm text-muted-foreground">package pricing</div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {trainer.certifications.map((cert, index) => (
                <div key={`cert-${index}`} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Award className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">{cert}</span>
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