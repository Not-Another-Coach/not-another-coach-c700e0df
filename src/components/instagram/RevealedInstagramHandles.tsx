import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Instagram, ExternalLink, Loader2, AlertCircle, Calendar, User } from 'lucide-react';

interface RevealedHandle {
  id: string;
  trainer_id: string;
  client_id: string;
  discovery_call_id: string;
  revealed_at: string;
  connection: {
    instagram_username: string;
    account_type: string;
  };
  trainer_profile: {
    first_name: string;
    last_name: string;
  };
  discovery_call?: {
    scheduled_for: string;
    status: string;
  };
}

interface RevealedInstagramHandlesProps {
  /** If provided, shows handles revealed to this specific client */
  clientId?: string;
  /** If provided, shows handles revealed by this specific trainer */
  trainerId?: string;
}

export const RevealedInstagramHandles: React.FC<RevealedInstagramHandlesProps> = ({
  clientId,
  trainerId
}) => {
  const [revealedHandles, setRevealedHandles] = useState<RevealedHandle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRevealedHandles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('instagram_handle_revelations')
        .select('*');

      // Filter based on provided props or current user
      if (clientId) {
        query = query.eq('client_id', clientId);
      } else if (trainerId) {
        query = query.eq('trainer_id', trainerId);
      } else {
        // Show handles for current user (either as client or trainer)
        query = query.or(`client_id.eq.${user.id},trainer_id.eq.${user.id}`);
      }

      const { data: revelations, error } = await query.order('revealed_at', { ascending: false });

      if (error) throw error;
      
      // Fetch related data for each revelation
      const enrichedData: RevealedHandle[] = [];
      
      for (const revelation of revelations || []) {
        // Get Instagram connection
        const { data: connection } = await supabase
          .from('instagram_connections')
          .select('instagram_username, account_type')
          .eq('trainer_id', revelation.trainer_id)
          .eq('is_active', true)
          .maybeSingle();

        // Get trainer profile
        const { data: trainerProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', revelation.trainer_id)
          .maybeSingle();

        // Get discovery call (optional)
        const { data: discoveryCall } = await supabase
          .from('discovery_calls')
          .select('scheduled_for, status')
          .eq('id', revelation.discovery_call_id)
          .maybeSingle();

        enrichedData.push({
          ...revelation,
          connection: connection || { instagram_username: '', account_type: '' },
          trainer_profile: trainerProfile || { first_name: '', last_name: '' },
          discovery_call: discoveryCall || undefined
        });
      }

      setRevealedHandles(enrichedData);
      
    } catch (err: any) {
      console.error('Error fetching revealed handles:', err);
      setError(err.message || 'Failed to fetch revealed Instagram handles');
    } finally {
      setLoading(false);
    }
  };

  const openInstagram = (username: string) => {
    window.open(`https://instagram.com/${username}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  useEffect(() => {
    fetchRevealedHandles();
  }, [clientId, trainerId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Revealed Instagram Handles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading revealed handles...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Revealed Instagram Handles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive py-4">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <Button onClick={fetchRevealedHandles} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (revealedHandles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Revealed Instagram Handles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Instagram className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No Instagram handles have been revealed yet.</p>
            <p className="text-sm mt-1">
              Handles are revealed after completing discovery calls with trainers.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Instagram className="h-5 w-5" />
          Revealed Instagram Handles ({revealedHandles.length})
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Instagram handles revealed after discovery calls
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {revealedHandles.map((handle) => (
            <div
              key={handle.id}
              className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Instagram className="h-5 w-5 text-pink-500" />
                      <span className="font-medium text-lg">
                        @{handle.connection?.instagram_username}
                      </span>
                    </div>
                    <Badge variant="secondary">
                      {handle.connection?.account_type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>
                        {handle.trainer_profile?.first_name} {handle.trainer_profile?.last_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Revealed {formatDate(handle.revealed_at)}</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => openInstagram(handle.connection?.instagram_username || '')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit Profile
                </Button>
              </div>

              {handle.discovery_call && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Revealed after discovery call on {formatDate(handle.discovery_call.scheduled_for)}
                    <Badge variant="outline" className="ml-2 text-xs">
                      {handle.discovery_call.status}
                    </Badge>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};