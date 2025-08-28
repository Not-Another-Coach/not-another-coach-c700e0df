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
      case 'compare':
        return (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Eye className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Comparison Mode</h3>
              <p className="text-muted-foreground text-center max-w-md">
                This view shows how your profile will appear when clients compare you with other trainers side-by-side.
              </p>
            </CardContent>
          </Card>
        );
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Profile Preview
            <Badge className={stageInfo.color}>
              {stageInfo.label}
            </Badge>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {stageInfo.description}
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border-b pb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Preview Mode</h3>
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                This is how clients will see your profile
              </div>
            </div>
            <ProfileViewSelector
              currentView={currentView}
              onViewChange={setCurrentView}
              isMobile={isMobile}
            />
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {renderCurrentView()}
          </div>

          <div className="pt-4 border-t">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleMessage} className="flex-1" disabled>
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message (Preview)
              </Button>
              {trainer.offers_discovery_call && (
                <Button onClick={handleBookDiscovery} variant="outline" className="flex-1" disabled>
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Discovery Call (Preview)
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Actions are disabled in preview mode
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};