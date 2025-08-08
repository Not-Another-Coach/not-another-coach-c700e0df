import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TieredTrainerProfile } from '@/components/tiered-profile/TieredTrainerProfile';
import { EngagementStage } from '@/hooks/useEngagementStage';

interface ProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainer: any;
  stage: EngagementStage;
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
  discovery_call_booked: { 
    label: 'Discovery Call Booked', 
    description: 'How your profile appears when a discovery call is booked',
    color: 'bg-amber-100 text-amber-800'
  },
  discovery_in_progress: { 
    label: 'Discovery In Progress', 
    description: 'How your profile appears when discovery is happening through messaging',
    color: 'bg-teal-100 text-teal-800'
  },
  matched: { 
    label: 'Matched Stage', 
    description: 'How your profile appears when you match with a client',
    color: 'bg-green-100 text-green-800'
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

export const ProfilePreviewModal: React.FC<ProfilePreviewModalProps> = ({
  isOpen,
  onClose,
  trainer,
  stage
}) => {
  const stageInfo = stageLabels[stage];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
        
        <div className="mt-4">
          <TieredTrainerProfile
            trainer={trainer}
            className="border rounded-lg"
            previewStage={stage}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};