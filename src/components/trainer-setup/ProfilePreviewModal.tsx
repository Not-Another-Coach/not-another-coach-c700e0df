import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProfileViewSelector, ProfileViewMode } from '@/components/profile-views/ProfileViewSelector';
import { OverviewView } from '@/components/profile-views/OverviewView';
import { ResultsView } from '@/components/profile-views/ResultsView';
import { StoryView } from '@/components/profile-views/StoryView';
import { ContentView } from '@/components/profile-views/ContentView';
import { CompareView } from '@/components/profile-views/CompareView';
import { CardsView } from '@/components/profile-views/CardsView';
import { PackagesView } from '@/components/profile-views/PackagesView';
import { EngagementStage } from '@/hooks/useEngagementStage';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, MessageCircle, Calendar } from 'lucide-react';

interface ProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainer: any;
  stage?: EngagementStage;
}

const stageLabels: Record<EngagementStage, { label: string; description: string; color: string }> = {
  browsing: { 
    label: 'Browsing Stage', 
    description: 'How your profile appears when clients first discover you',
    color: 'bg-blue-100 text-blue-800'
  },
  liked: { 
    label: 'Liked Stage', 
    description: 'How your profile appears after a client likes you',
    color: 'bg-purple-100 text-purple-800'
  },
  shortlisted: { 
    label: 'Shortlisted Stage', 
    description: 'How your profile appears when a client shortlists you',
    color: 'bg-indigo-100 text-indigo-800'
  },
  agreed: { 
    label: 'Agreed Stage', 
    description: 'How your profile appears when both parties have agreed to work together',
    color: 'bg-green-100 text-green-800'
  },
  payment_pending: { 
    label: 'Payment Pending Stage', 
    description: 'How your profile appears when payment is being processed',
    color: 'bg-yellow-100 text-yellow-800'
  },
  getting_to_know_your_coach: {
    label: 'Getting to Know Your Coach', 
    description: 'How your profile appears when discovery is happening',
    color: 'bg-amber-100 text-amber-800'
  },
  discovery_in_progress: { 
    label: 'Discovery In Progress', 
    description: 'How your profile appears when discovery is happening through messaging',
    color: 'bg-teal-100 text-teal-800'
  },
  discovery_completed: {
    label: 'Discovery Completed', 
    description: 'How your profile appears after a discovery call',
    color: 'bg-orange-100 text-orange-800'
  },
  active_client: { 
    label: 'Active Client', 
    description: 'How your profile appears to your active clients',
    color: 'bg-emerald-100 text-emerald-800'
  },
  unmatched: { 
    label: 'Unmatched Stage', 
    description: 'How your profile appears after an unmatch',
    color: 'bg-gray-100 text-gray-800'
  },
  declined: { 
    label: 'Declined Stage', 
    description: 'How your profile appears after being declined',
    color: 'bg-red-100 text-red-800'
  },
  declined_dismissed: { 
    label: 'Previously Declined', 
    description: 'How your profile appears in explore view after being declined and dismissed',
    color: 'bg-gray-100 text-gray-600'
  }
};

export const ProfilePreviewModal = ({
  isOpen,
  onClose,
  trainer,
  stage = 'browsing'
}) => {
  const [currentView, setCurrentView] = useState<ProfileViewMode>('overview');
  const isMobile = useIsMobile();
  const stageInfo = stageLabels[stage];

  const handleMessage = () => {
    console.log('Message action (preview mode)');
  };

  const handleBookDiscovery = () => {
    console.log('Book discovery call action (preview mode)');
  };

  const renderCurrentView = () => {
    // Always use new view mode system
    switch (currentView) {
      case 'overview':
        return (
          <OverviewView 
            trainer={trainer} 
            onMessage={handleMessage}
            onBookDiscovery={trainer.offers_discovery_call ? handleBookDiscovery : undefined}
          />
        );
      case 'results':
        return <ResultsView trainer={trainer} />;
      case 'story':
        return <StoryView trainer={trainer} />;
      case 'cards':
        return <CardsView trainer={trainer} />;
      case 'content':
        return <ContentView trainer={trainer} />;
      case 'packages':
        return <PackagesView trainer={trainer} />;
      default:
        return (
          <OverviewView 
            trainer={trainer} 
            onMessage={handleMessage}
            onBookDiscovery={trainer.offers_discovery_call ? handleBookDiscovery : undefined}
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[90vw] max-w-4xl h-[95vh] sm:h-[90vh] max-h-[800px] overflow-hidden flex flex-col p-0 m-2 sm:m-4">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0">
          <DialogTitle className="flex flex-col gap-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-lg sm:text-xl">Profile Preview</span>
            </div>
            <div className="flex flex-col gap-1">
              <Badge className={`${stageInfo.color} text-xs w-fit`}>
                {stageInfo.label}
              </Badge>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {stageInfo.description}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0">
            <div className="flex flex-col gap-2 sm:gap-3 mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Preview Mode</h3>
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded text-center sm:text-left w-fit">
                This is how clients will see your profile
              </div>
            </div>
            <ProfileViewSelector
              currentView={currentView}
              onViewChange={setCurrentView}
              isMobile={isMobile}
              hideCompareView={true}
              hideViewingBadge={true}
            />
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4">
            {renderCurrentView()}
          </div>

          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t flex-shrink-0">
            <p className="text-xs text-muted-foreground text-center">
              This is how your profile will appear to potential clients
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};