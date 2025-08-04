import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Heart, MessageCircle, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSavedTrainers } from '@/hooks/useSavedTrainers';

interface UnmatchedTrainer {
  id: string;
  first_name: string;
  last_name: string;
  tagline: string;
  bio: string;
  location: string;
  specializations: string[];
  training_types: string[];
  hourly_rate: number;
  rating: number;
  total_ratings: number;
  profile_photo_url: string;
  is_verified: boolean;
}

interface UnmatchedTrainersProps {
  profile: any;
}

export function UnmatchedTrainers({ profile }: UnmatchedTrainersProps) {
  const { user } = useAuth();
  const [trainers, setTrainers] = useState<UnmatchedTrainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnmatchedTrainers = async () => {
      if (!user) return;

      try {
        console.log('Fetching unmatched trainers for user:', user.id);
        
        // Get trainers that the client hasn't engaged with
        const { data: engagements } = await supabase
          .from('client_trainer_engagement')
          .select('trainer_id')
          .eq('client_id', user.id);

        console.log('Client engagement data:', engagements);
        const engagedTrainerIds = engagements?.map(e => e.trainer_id) || [];
        console.log('Engaged trainer IDs:', engagedTrainerIds);

        // Get all trainers with completed profiles excluding those already engaged
        let query = supabase
          .from('profiles')
          .select('id, first_name, last_name, tagline, bio, location, specializations, training_types, hourly_rate, rating, total_ratings, profile_photo_url, is_verified, profile_setup_completed, profile_published, user_type')
          .eq('user_type', 'trainer');

        // Don't exclude current user since we want to show all trainers in this view
        if (engagedTrainerIds.length > 0) {
          query = query.not('id', 'in', `(${engagedTrainerIds.join(',')})`);
        }

        const { data: trainersData, error } = await query.order('rating', { ascending: false });

        console.log('All trainers query result:', trainersData);
        console.log('Query error:', error);

        if (error) {
          console.error('Error fetching unmatched trainers:', error);
          return;
        }

        // Filter trainers who have either profile published or setup completed
        const filteredTrainers = trainersData?.filter(trainer => 
          trainer.profile_published === true || trainer.profile_setup_completed === true
        ) || [];

        console.log('Filtered trainers (published or setup completed):', filteredTrainers);
        console.log('Louise Whitton specifically:', filteredTrainers.find(t => 
          t.first_name === 'Louise' && t.last_name === 'Whitton'
        ));

        setTrainers(filteredTrainers);
      } catch (error) {
        console.error('Error fetching unmatched trainers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnmatchedTrainers();
  }, [user]);

  const { saveTrainer } = useSavedTrainers();

  const handleLikeTrainer = async (trainerId: string) => {
    if (!user) return;

    try {
      const success = await saveTrainer(trainerId);
      if (success) {
        // Remove trainer from unmatched list
        setTrainers(prev => prev.filter(t => t.id !== trainerId));
      }
    } catch (error) {
      console.error('Error liking trainer:', error);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading trainers...</div>
      </div>
    );
  }

  if (trainers.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No New Trainers Available</h3>
        <p className="text-muted-foreground">
          You've seen all available trainers. Check back later for new additions!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Discover New Trainers</h2>
        <p className="text-muted-foreground">
          Browse trainers you haven't connected with yet
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trainers.map((trainer) => (
          <Card key={trainer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={trainer.profile_photo_url} alt={`${trainer.first_name} ${trainer.last_name}`} />
                  <AvatarFallback className="text-lg">
                    {getInitials(trainer.first_name, trainer.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg leading-tight">
                      {trainer.first_name} {trainer.last_name}
                    </h3>
                    {trainer.is_verified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  {trainer.tagline && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                      {trainer.tagline}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {trainer.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{trainer.location}</span>
                      </div>
                    )}
                    
                    {trainer.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current text-yellow-500" />
                        <span>{trainer.rating.toFixed(1)}</span>
                        <span>({trainer.total_ratings})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-4">
              {trainer.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {trainer.bio}
                </p>
              )}

              {trainer.specializations && trainer.specializations.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {trainer.specializations.slice(0, 3).map((spec, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                  {trainer.specializations.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{trainer.specializations.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {trainer.hourly_rate && (
                <div className="text-sm font-semibold">
                  £{trainer.hourly_rate}/hour
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleLikeTrainer(trainer.id)}
                  className="flex-1 flex items-center gap-2"
                >
                  <Heart className="h-4 w-4" />
                  Like
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled
                >
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}