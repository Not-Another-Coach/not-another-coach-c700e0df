import { useShortlistedTrainers } from '@/hooks/useShortlistedTrainers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, Phone, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StartConversationButton } from '@/components/StartConversationButton';

export default function Shortlist() {
  const navigate = useNavigate();
  const { shortlistedTrainers, loading, removeFromShortlist, bookDiscoveryCall } = useShortlistedTrainers();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shortlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                My Shortlist
              </h1>
              <p className="text-muted-foreground">
                {shortlistedTrainers.length}/4 trainers shortlisted • Chat and discovery calls enabled
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {shortlistedTrainers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">No Shortlisted Trainers Yet</CardTitle>
              <p className="text-muted-foreground mb-6">
                Add trainers to your shortlist from the Saved tab to unlock chat and discovery call options
              </p>
              <Button onClick={() => navigate('/saved')}>
                View Saved Trainers
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {shortlistedTrainers.map((shortlisted) => (
              <Card key={shortlisted.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Trainer #{shortlisted.trainer_id}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Shortlisted {new Date(shortlisted.shortlisted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => removeFromShortlist(shortlisted.trainer_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Chat Enabled
                      </Badge>
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        Discovery Call Available
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <StartConversationButton 
                        trainerId={shortlisted.trainer_id}
                        trainerName={`Trainer ${shortlisted.trainer_id}`}
                        size="sm"
                        variant="outline"
                      />
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => bookDiscoveryCall(shortlisted.trainer_id)}
                        disabled={!!shortlisted.discovery_call_booked_at}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        {shortlisted.discovery_call_booked_at ? 'Call Booked' : 'Book Call'}
                      </Button>
                    </div>

                    {shortlisted.discovery_call_booked_at && (
                      <div className="p-3 bg-green-50 rounded-lg text-sm text-green-800">
                        Discovery call booked on {new Date(shortlisted.discovery_call_booked_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}