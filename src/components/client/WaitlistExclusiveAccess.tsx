import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Star, Calendar, MessageCircle } from 'lucide-react';
import { useWaitlistExclusive } from '@/hooks/useWaitlistExclusive';
import { useAuth } from '@/hooks/useAuth';
import { BookDiscoveryCallButton } from '@/components/discovery-call/BookDiscoveryCallButton';
import { ChooseCoachButton } from '@/components/coach-selection/ChooseCoachButton';
import { StartConversationButton } from '@/components/StartConversationButton';
import { format, formatDistanceToNow } from 'date-fns';

interface WaitlistExclusiveAccessProps {
  trainer: {
    id: string;
    first_name?: string;
    last_name?: string;
    profile_photo_url?: string;
    tagline?: string;
    location?: string;
    hourly_rate?: number;
    rating?: number;
    package_options?: any;
    discovery_call_settings?: {
      offers_discovery_call: boolean;
    };
  };
  exclusiveUntil: string;
}

export function WaitlistExclusiveAccess({ trainer, exclusiveUntil }: WaitlistExclusiveAccessProps) {
  const { user } = useAuth();
  const { checkClientExclusiveAccess } = useWaitlistExclusive();
  const [hasAccess, setHasAccess] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const checkAccess = async () => {
      if (user?.id) {
        const access = await checkClientExclusiveAccess(user.id, trainer.id);
        setHasAccess(access);
      }
    };

    checkAccess();
  }, [user?.id, trainer.id, checkClientExclusiveAccess]);

  useEffect(() => {
    const updateTimeRemaining = () => {
      const expiryDate = new Date(exclusiveUntil);
      const now = new Date();
      
      if (expiryDate > now) {
        setTimeRemaining(formatDistanceToNow(expiryDate, { addSuffix: true }));
      } else {
        setTimeRemaining('Expired');
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [exclusiveUntil]);

  if (!hasAccess) {
    return null;
  }

  const trainerName = `${trainer.first_name} ${trainer.last_name}`;
  const offersDiscoveryCall = trainer.discovery_call_settings?.offers_discovery_call ?? false;

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Early Access Available!
          </CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeRemaining}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          {trainer.profile_photo_url && (
            <img
              src={trainer.profile_photo_url}
              alt={trainerName}
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <h3 className="font-semibold">{trainerName}</h3>
            {trainer.tagline && (
              <p className="text-sm text-muted-foreground">{trainer.tagline}</p>
            )}
            {trainer.location && (
              <p className="text-xs text-muted-foreground">{trainer.location}</p>
            )}
          </div>
          {trainer.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{trainer.rating}</span>
            </div>
          )}
        </div>

        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm text-center">
            You've got early access to <strong>{trainerName}</strong> — grab your spot before it opens up!
          </p>
        </div>

        <div className="flex gap-2">
          {offersDiscoveryCall ? (
            <BookDiscoveryCallButton 
              trainer={{ 
                id: trainer.id,
                name: `${trainer.first_name} ${trainer.last_name}`,
                firstName: trainer.first_name,
                lastName: trainer.last_name,
                profilePhotoUrl: trainer.profile_photo_url,
                offers_discovery_call: true
              }}
              size="sm"
              className="flex-1"
            />
          ) : (
            <StartConversationButton
              trainerId={trainer.id}
              trainerName={trainerName}
              size="sm"
              className="flex-1"
              variant="default"
            />
          )}
          
          {trainer.package_options && Array.isArray(trainer.package_options) && trainer.package_options.length > 0 && (
            <ChooseCoachButton 
              trainer={{
                id: trainer.id,
                name: `${trainer.first_name} ${trainer.last_name}`,
                firstName: trainer.first_name,
                lastName: trainer.last_name,
                profilePhotoUrl: trainer.profile_photo_url,
                package_options: trainer.package_options
              }}
              stage="matched"
              className="flex-1"
            />
          )}
        </div>

        <div className="text-xs text-center text-muted-foreground">
          This exclusive access expires {format(new Date(exclusiveUntil), 'MMM d, yyyy \'at\' h:mm a')}
        </div>
      </CardContent>
    </Card>
  );
}