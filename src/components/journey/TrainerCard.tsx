import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Calendar, 
  Star, 
  Heart, 
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
          <div className="flex gap-2 justify-center w-full">
            <Button size="sm" variant="default" onClick={() => onAction('save')} className="flex-1">
              <Heart className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAction('view')} className="flex-1">
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          </div>
        );
        
      case 'saved':
        return (
          <div className="flex gap-2 justify-center w-full">
            <Button size="sm" variant="default" onClick={() => onAction('shortlist')} className="flex-1">
              <Star className="h-3 w-3 mr-1" />
              Shortlist
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAction('unsave')} className="flex-1">
              <X className="h-3 w-3 mr-1" />
              Remove
            </Button>
          </div>
        );
        
      case 'shortlisted':
        return (
          <div className="flex gap-2 justify-center w-full">
            <Button size="sm" variant="default" onClick={() => onAction('book_call')} className="flex-1">
              <Calendar className="h-3 w-3 mr-1" />
              Book Call
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAction('message')} className="flex-1">
              <MessageCircle className="h-3 w-3 mr-1" />
              Chat
            </Button>
          </div>
        );
        
      case 'waitlist':
        return (
          <div className="flex gap-2 justify-center w-full">
            <Button size="sm" variant="outline" onClick={() => onAction('message')} className="flex-1">
              <MessageCircle className="h-3 w-3 mr-1" />
              Chat
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onAction('leave_waitlist')} className="flex-1">
              <X className="h-3 w-3 mr-1" />
              Leave
            </Button>
          </div>
        );
        
      case 'chosen':
        return (
          <div className="flex gap-2 justify-center w-full">
            <Button size="sm" variant="default" onClick={() => onAction('message')} className="flex-1">
              <MessageCircle className="h-3 w-3 mr-1" />
              Chat
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAction('view')} className="flex-1">
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-background to-muted/30">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <Avatar className="h-20 w-20 mx-auto ring-2 ring-primary/20">
            <AvatarImage src={trainer.profile_picture_url} alt={trainer.name} className="object-cover" />
            <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
              {trainer.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'T'}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-foreground">
              {trainer.name}
            </h3>
            
            <p className="text-sm text-muted-foreground font-medium">
              {trainer.location}
            </p>
            
            {trainer.specialties && trainer.specialties.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1">
                {trainer.specialties.slice(0, 3).map((specialty: string) => (
                  <Badge key={specialty} variant="secondary" className="text-xs px-2 py-1">
                    {specialty}
                  </Badge>
                ))}
                {trainer.specialties.length > 3 && (
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    +{trainer.specialties.length - 3} more
                  </Badge>
                )}
              </div>
            )}
            
            {trainer.rating && (
              <div className="flex items-center justify-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{trainer.rating}</span>
                {trainer.total_ratings && (
                  <span className="text-muted-foreground">({trainer.total_ratings})</span>
                )}
              </div>
            )}
          </div>
          
          <div className="pt-2 border-t border-border/50">
            {getActionButtons()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}