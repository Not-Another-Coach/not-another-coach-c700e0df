import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Calendar, 
  Star, 
  Heart, 
  Clock, 
  CheckCircle,
  X,
  Eye
} from 'lucide-react';
import { TrainerWithJourneyStage } from '@/types/journey';

interface TrainerCardProps {
  trainer: TrainerWithJourneyStage;
  onAction: (action: string) => void;
  compact?: boolean;
}

export function TrainerCard({ trainer, onAction, compact = false }: TrainerCardProps) {
  const getActionButtons = () => {
    switch (trainer.journey_stage) {
      case 'discovery':
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onAction('save')}>
              <Heart className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAction('view')}>
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          </div>
        );
        
      case 'saved':
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onAction('shortlist')}>
              <Star className="h-3 w-3 mr-1" />
              Shortlist
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAction('unsave')}>
              <X className="h-3 w-3 mr-1" />
              Remove
            </Button>
          </div>
        );
        
      case 'shortlisted':
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onAction('book_call')}>
              <Calendar className="h-3 w-3 mr-1" />
              Book Call
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAction('message')}>
              <MessageCircle className="h-3 w-3 mr-1" />
              Chat
            </Button>
          </div>
        );
        
      case 'waitlist':
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onAction('message')}>
              <MessageCircle className="h-3 w-3 mr-1" />
              Chat
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onAction('leave_waitlist')}>
              <X className="h-3 w-3 mr-1" />
              Leave
            </Button>
          </div>
        );
        
      case 'chosen':
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onAction('message')}>
              <MessageCircle className="h-3 w-3 mr-1" />
              Chat
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAction('view')}>
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          </div>
        );
        
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    const stageColors = {
      discovery: 'bg-muted text-muted-foreground',
      saved: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-yellow-100 text-yellow-800',
      waitlist: 'bg-orange-100 text-orange-800',
      chosen: 'bg-green-100 text-green-800'
    };

    return (
      <Badge className={stageColors[trainer.journey_stage]}>
        {trainer.journey_stage.charAt(0).toUpperCase() + trainer.journey_stage.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className={`p-${compact ? '3' : '4'}`}>
        <div className="flex items-start space-x-3">
          <Avatar className={compact ? 'h-8 w-8' : 'h-12 w-12'}>
            <AvatarImage src={trainer.profile_picture_url} alt={trainer.name} />
            <AvatarFallback>
              {trainer.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'T'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={`font-semibold truncate ${compact ? 'text-sm' : 'text-base'}`}>
                {trainer.name}
              </h3>
              {getStatusBadge()}
            </div>
            
            <p className={`text-muted-foreground truncate ${compact ? 'text-xs' : 'text-sm'}`}>
              {trainer.location}
            </p>
            
            {!compact && trainer.specialties && trainer.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {trainer.specialties.slice(0, 2).map((specialty: string) => (
                  <Badge key={specialty} variant="outline" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
                {trainer.specialties.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{trainer.specialties.length - 2}
                  </Badge>
                )}
              </div>
            )}
            
            <div className={`mt-${compact ? '2' : '3'}`}>
              {getActionButtons()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}