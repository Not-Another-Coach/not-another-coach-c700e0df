import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useClientJourneyProgress } from "@/hooks/useClientJourneyProgress";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useDiscoveryCallNotifications } from "@/hooks/useDiscoveryCallNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MessagingPopup } from "@/components/MessagingPopup";
import { ClientCustomHeader } from "@/components/layout/ClientCustomHeader";
import { 
  ArrowLeft, 
  CheckCircle, 
  Circle, 
  Clock, 
  Star, 
  Bell, 
  MessageCircle, 
  Settings 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ClientJourney = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useClientProfile();
  const { progress, loading } = useClientJourneyProgress();
  const { notifications, upcomingCalls } = useDiscoveryCallNotifications();
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);

  // Helper function to format journey stage
  const formatJourneyStage = (stage: string) => {
    switch (stage) {
      case 'profile_setup': return 'Setting Up Profile';
      case 'exploring_coaches': return 'Exploring Trainers';
      case 'browsing': return 'Browsing';
      case 'liked': return 'Finding Favorites';
      case 'shortlisted': return 'Shortlisted Trainers';
      case 'discovery_in_progress': return 'Discovery Process';
      case 'discovery_call_booked': return 'Call Scheduled';
      case 'discovery_completed': return 'Discovery Complete';
      case 'waitlist': return 'On Waitlist';
      case 'active_client': return 'Active Client';
      default: return 'Getting Started';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your journey...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!progress || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No journey data available</p>
              <Button 
                onClick={() => navigate('/client/dashboard')} 
                className="mt-4"
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStageStatus = (stepIndex: number, currentStageIndex: number) => {
    if (stepIndex < currentStageIndex) return 'completed';
    if (stepIndex === currentStageIndex) return 'current';
    return 'upcoming';
  };

  const currentStageIndex = progress.currentStageIndex;

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Custom Header */}
      <ClientCustomHeader
        currentPage="journey"
        profile={profile}
        journeyProgress={progress}
        notifications={notifications}
        upcomingCalls={upcomingCalls}
        onMessagingOpen={() => setIsMessagingOpen(true)}
        showJourneyProgress={false}
      />

      {/* Main Content */}
      <main className="mx-auto px-6 lg:px-8 xl:px-12 py-6">

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Journey Overview */}
          <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-primary">Your Fitness Journey</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Track your progress through each stage of your transformation
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{progress.percentage}%</div>
                  <p className="text-sm text-muted-foreground">Complete</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={progress.percentage} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>Stage {currentStageIndex + 1} of {progress.steps.length}</span>
                <span>{progress.stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              </div>
            </CardContent>
          </Card>

          {/* Journey Steps */}
          <div className="space-y-6">
            {progress.steps.map((step, index) => {
              const status = getStageStatus(index, currentStageIndex);
              
              const getNavigationForStep = (stepTitle: string) => {
                const title = stepTitle.toLowerCase();
                if (title.includes('preferences') || title.includes('survey')) {
                  return () => navigate('/client-survey');
                } else if (title.includes('exploring') && title.includes('coach')) {
                  return () => navigate('/client/explore');
                } else if (title.includes('getting') && title.includes('know') && title.includes('coach')) {
                  return () => navigate('/my-trainers');
                }
                return null;
              };

              const handleStepClick = getNavigationForStep(step.title);
              
              return (
                <Card 
                  key={step.id} 
                  className={`transition-all duration-300 ${handleStepClick ? 'cursor-pointer hover:shadow-lg' : ''} ${
                    status === 'current' 
                      ? 'ring-2 ring-primary/50 bg-gradient-to-r from-primary/5 to-transparent' 
                      : status === 'completed'
                      ? 'bg-green-50/50 dark:bg-green-950/20'
                      : 'opacity-70'
                  }`}
                  onClick={handleStepClick}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Step Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                        status === 'completed'
                          ? 'bg-green-500 border-green-500 text-white'
                          : status === 'current'
                          ? 'bg-primary border-primary text-white'
                          : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                      }`}>
                        {status === 'completed' ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : status === 'current' ? (
                          <Clock className="w-6 h-6" />
                        ) : (
                          <Circle className="w-6 h-6" />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{step.title}</h3>
                          <Badge variant={
                            status === 'completed' ? 'default' :
                            status === 'current' ? 'secondary' : 'outline'
                          }>
                            {status === 'completed' ? 'Completed' :
                             status === 'current' ? 'In Progress' : 'Upcoming'}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{step.description}</p>
                        
                        {/* Step Details */}
                        <div className="space-y-2">
                          {step.tooltip && (
                            <div className="text-sm text-muted-foreground">
                              <p>{step.tooltip}</p>
                            </div>
                          )}
                          
                          {status === 'current' && progress.nextAction && (
                            <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                              <p className="text-sm font-medium text-primary">Next Action:</p>
                              <p className="text-sm text-muted-foreground mt-1">{progress.nextAction}</p>
                            </div>
                          )}
                          
                          {status === 'completed' && (
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                              <Star className="w-4 h-4" />
                              <span className="text-sm font-medium">Stage completed successfully!</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Step Number */}
                      <div className="flex-shrink-0 text-right">
                        <div className="text-2xl font-bold text-muted-foreground/30">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      {/* Messaging Popup */}
      <MessagingPopup 
        isOpen={isMessagingOpen}
        onClose={() => setIsMessagingOpen(false)}
      />
    </div>
  );
};

export default ClientJourney;