import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Calendar, Lock, Star, MapPin, Clock, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEngagementStage, EngagementStage } from '@/hooks/useEngagementStage';
import { useProfile } from '@/hooks/useProfile';
import { useSavedTrainers } from '@/hooks/useSavedTrainers';
import { useContentVisibility } from '@/hooks/useContentVisibility';
import { useWaitlist } from '@/hooks/useWaitlist';
import { WaitlistJoinButton } from '@/components/waitlist/WaitlistJoinButton';
import { WaitlistStatusBadge } from '@/components/waitlist/WaitlistStatusBadge';
import { HeroBlock } from './blocks/HeroBlock';
import { MiniBioBlock } from './blocks/MiniBioBlock';
import { SpecialismsBlock } from './blocks/SpecialismsBlock';
import { WaysOfWorkingBlock } from './blocks/WaysOfWorkingBlock';
import { GalleryPackagesBlock } from './blocks/GalleryPackagesBlock';
import { ProcessTimelineBlock } from './blocks/ProcessTimelineBlock';
import { ReviewsBlock } from './blocks/ReviewsBlock';
import { PricingLockMessage } from './PricingLockMessage';
import { AskQuestionButton } from './AskQuestionButton';
import { BookDiscoveryCallButton } from '@/components/discovery-call/BookDiscoveryCallButton';
import { ChooseCoachButton } from '@/components/coach-selection/ChooseCoachButton';

interface TieredTrainerProfileProps {
  trainer: any;
  onViewProfile?: () => void;
  onMessage?: () => void;
  className?: string;
  previewStage?: EngagementStage; // For preview mode
}

export const TieredTrainerProfile = ({ 
  trainer, 
  onViewProfile, 
  onMessage,
  className,
  previewStage
}: TieredTrainerProfileProps) => {
  const { profile } = useProfile();
  const { stage: dbStage, updateEngagementStage, canViewContent: dbCanViewContent, loading } = useEngagementStage(trainer.id);
  
  // Use preview stage if provided, otherwise use database stage
  const stage = previewStage || dbStage;
  
  // Use content visibility with the current stage (preview or actual)
  const { canViewContent: previewCanViewContent } = useContentVisibility({
    trainerId: trainer.id,
    engagementStage: stage
  });
  
  // Create a unified canViewContent function that works for both preview and normal mode
  const canViewContent = previewStage 
    ? (requiredStage: EngagementStage) => {
        // In preview mode, check if current stage meets the requirement
        const stageOrder: EngagementStage[] = ['browsing', 'liked', 'matched', 'discovery_completed', 'active_client'];
        const currentIndex = stageOrder.indexOf(stage);
        const requiredIndex = stageOrder.indexOf(requiredStage);
        return currentIndex >= requiredIndex;
      }
    : dbCanViewContent;
  const { savedTrainers, saveTrainer, unsaveTrainer, isTrainerSaved } = useSavedTrainers();
  const { getCoachAvailability, checkClientWaitlistStatus } = useWaitlist();
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [coachAvailability, setCoachAvailability] = useState<any>(null);
  const [clientWaitlistStatus, setClientWaitlistStatus] = useState<any>(null);

  const isSaved = isTrainerSaved(trainer.id);
  const isClient = profile?.user_type === 'client';

  // Fetch coach availability and client waitlist status
  useEffect(() => {
    const fetchData = async () => {
      if (trainer.id) {
        const availability = await getCoachAvailability(trainer.id);
        setCoachAvailability(availability);
        
        if (isClient) {
          const waitlistStatus = await checkClientWaitlistStatus(trainer.id);
          setClientWaitlistStatus(waitlistStatus);
        }
      }
    };
    fetchData();
  }, [trainer.id, isClient, getCoachAvailability, checkClientWaitlistStatus]);

  const handleLikeTrainer = async () => {
    if (!isClient || stage !== 'browsing') return;
    
    setIsUpdatingStage(true);
    await updateEngagementStage('liked');
    if (isSaved) {
      await unsaveTrainer(trainer.id);
    } else {
      await saveTrainer(trainer.id);
    }
    setIsUpdatingStage(false);
  };

  const handleMessage = () => {
    if (stage === 'browsing') {
      // Update to matched stage when first message is sent
      updateEngagementStage('matched');
    }
    onMessage?.();
  };

  const handleDiscoveryComplete = () => {
    updateEngagementStage('discovery_completed');
  };

  const getStageInfo = () => {
    switch (stage) {
      case 'browsing':
        return { label: 'Browsing', color: 'bg-gray-500' };
      case 'liked':
        return { label: 'Liked', color: 'bg-blue-500' };
      case 'matched':
        return { label: 'Matched', color: 'bg-purple-500' };
      case 'discovery_completed':
        return { label: 'Discovery Complete', color: 'bg-green-500' };
      case 'active_client':
        return { label: 'Active Client', color: 'bg-orange-500' };
      default:
        return { label: 'Browsing', color: 'bg-gray-500' };
    }
  };

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <div className="h-96 bg-muted rounded-lg"></div>
      </Card>
    );
  }

  const stageInfo = getStageInfo();

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Stage Indicator */}
      {isClient && (
        <div className="px-4 py-2 bg-muted/50 border-b">
          <Badge variant="secondary" className={cn("text-white", stageInfo.color)}>
            <div className="w-2 h-2 bg-white rounded-full mr-2" />
            {stageInfo.label}
          </Badge>
        </div>
      )}

      <div className="space-y-6 p-6">
        {/* Hero Block - Always visible */}
        <HeroBlock 
          trainer={trainer} 
          stage={stage}
          isClient={isClient}
          isSaved={isSaved}
          onLike={handleLikeTrainer}
          isUpdatingStage={isUpdatingStage}
        />

        {/* Mini Bio Block - Visible from Stage 2 */}
        {canViewContent('liked') && (
          <MiniBioBlock trainer={trainer} />
        )}

        {/* Specialisms Block - Visible from Stage 2 */}
        {canViewContent('liked') && (
          <SpecialismsBlock trainer={trainer} />
        )}

        {/* Ask Question Button - Only visible before matching */}
        {stage === 'browsing' || stage === 'liked' ? (
          <AskQuestionButton trainer={trainer} />
        ) : null}

        {/* Choose Coach Button - Available after liking or discovery call */}
        {(stage === 'liked' || stage === 'matched' || stage === 'discovery_completed') && (
          <ChooseCoachButton 
            trainer={trainer}
            stage={stage}
            onSuccess={() => {
              // Refresh the component or handle success
              window.location.reload();
            }}
          />
        )}

        {/* Ways of Working Block - Visible from Stage 3 */}
        {canViewContent('matched') && (
          <WaysOfWorkingBlock trainer={trainer} />
        )}

        {/* Gallery & Packages Block - Pricing locked until Stage 4 */}
        <GalleryPackagesBlock 
          trainer={trainer}
          canViewPricing={canViewContent('discovery_completed')}
          stage={stage}
        />

        {/* Process Timeline Block - Visible from Stage 3 */}
        {canViewContent('matched') && (
          <ProcessTimelineBlock trainer={trainer} />
        )}

        {/* Reviews Block - Visible from Stage 4 */}
        {canViewContent('discovery_completed') && (
          <ReviewsBlock trainer={trainer} />
        )}

        {/* Waitlist Status Badge - Show if client is on waitlist */}
        {isClient && clientWaitlistStatus && (
          <div className="flex justify-center">
            <WaitlistStatusBadge coachId={trainer.id} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          {/* Regular action buttons */}
            <>
              {stage === 'browsing' && isClient && (
                <Button 
                  onClick={handleLikeTrainer}
                  disabled={isUpdatingStage}
                  className="flex-1"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {isUpdatingStage ? 'Adding to Liked...' : 'Like Trainer'}
                </Button>
              )}

              {(stage === 'liked' || stage === 'matched') && (
                <>
                  <Button onClick={handleMessage} className="flex-1">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  
                  <BookDiscoveryCallButton 
                    trainer={{
                      id: trainer.id,
                      name: trainer.name,
                      firstName: trainer.firstName,
                      lastName: trainer.lastName,
                      profilePhotoUrl: trainer.profilePhotoUrl,
                      offers_discovery_call: trainer.offers_discovery_call
                    }}
                    variant="outline"
                    className="flex-1"
                  />
                </>
              )}

              {stage === 'discovery_completed' && (
                <Button onClick={onViewProfile} className="flex-1">
                  <Award className="w-4 h-4 mr-2" />
                  Book Training Package
                </Button>
              )}
            </>

          {onViewProfile && (
            <Button variant="outline" onClick={onViewProfile}>
              View Full Profile
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};