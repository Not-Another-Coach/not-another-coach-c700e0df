import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Calendar, Play } from 'lucide-react';

interface TrainerSnapshotCardProps {
  trainerName: string;
  trainerPhoto: string | null;
  trainerTagline?: string;
  onMessage: () => void;
  onBookSession: () => void;
  welcomeMessage?: string;
  welcomeVideoUrl?: string;
}

export const TrainerSnapshotCard = ({
  trainerName,
  trainerPhoto,
  trainerTagline,
  onMessage,
  onBookSession,
  welcomeMessage,
  welcomeVideoUrl
}: TrainerSnapshotCardProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="bg-gradient-to-br from-secondary-50 to-accent-50 border-secondary-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={trainerPhoto || undefined} alt={trainerName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {getInitials(trainerName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{trainerName}</h3>
              {trainerTagline && (
                <p className="text-sm text-muted-foreground">{trainerTagline}</p>
              )}
            </div>
            
            {welcomeMessage && (
              <div className="bg-background/60 rounded-lg p-3">
                <p className="text-sm text-foreground italic">"{welcomeMessage}"</p>
              </div>
            )}
            
            {welcomeVideoUrl && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Welcome Video
                </Button>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={onMessage} variant="outline" size="sm" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Message
              </Button>
              <Button onClick={onBookSession} size="sm" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Book Session
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};