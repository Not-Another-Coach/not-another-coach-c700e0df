import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ViewToggle } from './ViewToggle';
import { FunnelView } from './FunnelView';
import { KanbanView } from './KanbanView';
import { useClientJourneyVisualization } from '@/hooks/useClientJourneyVisualization';
import { useTrainerEngagement } from '@/hooks/useTrainerEngagement';
import { useWaitlist } from '@/hooks/useWaitlist';
import { useSavedTrainers } from '@/hooks/useSavedTrainers';
import { useShortlistedTrainers } from '@/hooks/useShortlistedTrainers';
import { useConversations } from '@/hooks/useConversations';
import { ViewMode, ClientJourneyStage } from '@/types/journey';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonTrainerCard } from '@/components/ui/skeleton-trainer-card';
import { toast } from 'sonner';

interface ClientJourneyVisualizationProps {
  refreshTrigger?: number;
}

export function ClientJourneyVisualization({ refreshTrigger }: ClientJourneyVisualizationProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('journey-view-mode') as ViewMode) || 'funnel';
  });

  const {
    trainersWithJourneyStages,
    stageConfigs,
    getTrainersForStage,
    loading
  } = useClientJourneyVisualization(refreshTrigger);

  const { updateEngagementStage, likeTrainer } = useTrainerEngagement(refreshTrigger);
  const { joinWaitlist, removeFromWaitlist } = useWaitlist();
  const { saveTrainer, unsaveTrainer } = useSavedTrainers();
  const { shortlistTrainer, removeFromShortlist, bookDiscoveryCall } = useShortlistedTrainers(refreshTrigger);
  const { createConversation } = useConversations();

  // Save view preference
  useEffect(() => {
    localStorage.setItem('journey-view-mode', viewMode);
  }, [viewMode]);

  const handleTrainerMove = async (trainerId: string, newStage: ClientJourneyStage) => {
    try {
      // Map journey stages back to engagement stages
      const stageMapping = {
        [ClientJourneyStage.DISCOVERY]: 'browsing',
        [ClientJourneyStage.SAVED]: 'liked',
        [ClientJourneyStage.SHORTLISTED]: 'shortlisted',
        [ClientJourneyStage.WAITLIST]: 'waitlist',
        [ClientJourneyStage.CHOSEN]: 'active_client'
      };

      const newEngagementStage = stageMapping[newStage] as any;
      if (newEngagementStage) {
        await updateEngagementStage(trainerId, newEngagementStage);
        toast.success(`Trainer moved to ${newStage}!`);
        
        // Additional actions based on stage
        if (newStage === ClientJourneyStage.WAITLIST) {
          await joinWaitlist(trainerId);
        }
      }
    } catch (error) {
      console.error('Error moving trainer:', error);
      toast.error('Failed to move trainer');
    }
  };

  const handleTrainerAction = async (trainerId: string, action: string) => {
    try {
      switch (action) {
        case 'save':
          await saveTrainer(trainerId);
          toast.success('Trainer saved!');
          break;
          
        case 'unsave':
          await unsaveTrainer(trainerId);
          toast.success('Trainer removed from saved!');
          break;
          
        case 'shortlist':
          const shortlistResult = await shortlistTrainer(trainerId);
          if (shortlistResult.error) {
            toast.error('Failed to shortlist trainer');
          } else {
            toast.success('Trainer shortlisted!');
          }
          break;
          
        case 'remove_shortlist':
          await removeFromShortlist(trainerId);
          toast.success('Trainer removed from shortlist!');
          break;
          
        case 'book_call':
          const callResult = await bookDiscoveryCall(trainerId);
          if (!callResult.error) {
            toast.success('Discovery call booking initiated!');
          }
          break;
          
        case 'message':
          const event = new CustomEvent('openMessagePopup', {
            detail: { trainerId }
          });
          window.dispatchEvent(event);
          break;
          
        case 'join_waitlist':
          await joinWaitlist(trainerId);
          toast.success('Joined waitlist!');
          break;
          
        case 'leave_waitlist':
          await removeFromWaitlist(trainerId);
          toast.success('Left waitlist!');
          break;
          
        case 'view':
          navigate(`/trainer/${trainerId}`);
          break;
          
        default:
          console.log('Unknown action:', action);
      }
    } catch (error) {
      console.error('Error handling trainer action:', error);
      toast.error('Action failed');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Trainer Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonTrainerCard key={index} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Trainer Journey</h2>
          <p className="text-muted-foreground">
            Track your progress from discovery to choosing your perfect trainer
          </p>
        </div>
        <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      {/* Journey Visualization */}
      {viewMode === 'funnel' ? (
        <FunnelView
          stageConfigs={stageConfigs}
          getTrainersForStage={getTrainersForStage}
          onTrainerAction={handleTrainerAction}
        />
      ) : (
        <KanbanView
          stageConfigs={stageConfigs}
          getTrainersForStage={getTrainersForStage}
          onTrainerMove={handleTrainerMove}
          onTrainerAction={handleTrainerAction}
        />
      )}
    </div>
  );
}