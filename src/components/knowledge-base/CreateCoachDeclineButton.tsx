import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { KBContentType, KBArticleStatus } from '@/hooks/useKnowledgeBase';

export const CreateCoachDeclineButton: React.FC = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  const createArticle = async () => {
    setIsCreating(true);
    
    const article = {
      title: 'Coach Decline Behavior and History Preservation',
      slug: 'coach-decline-behavior-history-preservation',
      content: `# Coach Decline Behavior and History Preservation

## Overview
This document describes how the system handles declined coaching requests and preserves interaction history when clients remove declined trainers from their "My Trainers" list.

## Engagement Stages
The system uses the following engagement stages to track client-trainer interactions:

- **browsing**: Initial discovery state
- **liked**: Client has saved the trainer
- **shortlisted**: Client has added trainer to shortlist
- **discovery_call_booked**: Discovery call has been scheduled
- **discovery_in_progress**: Discovery process is active
- **matched**: Client and trainer are matched
- **discovery_completed**: Discovery call/process completed
- **active_client**: Client is working with trainer
- **declined**: Coaching request was declined by trainer
- **declined_dismissed**: Client removed declined trainer (preserves history)

## Decline Flow

### 1. Initial Decline
When a trainer declines a coaching request:
- \`coach_selection_requests\` status is set to 'declined'
- \`client_trainer_engagement\` stage is updated to 'declined'
- Client is moved back to 'exploring_coaches' journey stage if no other active engagements
- Alert is created notifying the client

### 2. Client Removes Declined Trainer
When a client clicks "Remove" on a declined trainer in My Trainers:
- **For declined trainers**: Stage changes from 'declined' → 'declined_dismissed'
- **For other trainers**: Stage resets to 'browsing'
- Trainer is removed from waitlists if applicable
- Success message shown to client

### 3. Explore Coaches Display
When trainers appear in the Explore Coaches section:
- **declined_dismissed** trainers show "Previously Declined" badge
- Badge has muted red styling (bg-red-300)
- History is preserved but trainer no longer appears in My Trainers

## Database Implementation

### engagement_stage Enum
\`\`\`sql
-- Added new enum value
ALTER TYPE engagement_stage ADD VALUE 'declined_dismissed';
\`\`\`

### Key Functions
- \`update_engagement_stage()\`: Updates client-trainer engagement status
- \`create_coach_selection_request()\`: Handles coaching request creation
- \`admin_cleanup_client_trainer_interactions()\`: Admin cleanup utility

## UI Components

### My Trainers Page
- Declined trainers show in "Declined" tab
- "Remove" button preserves decline history
- Toast message informs client about "Previously Declined" label

### Trainer Profile Cards
- \`TieredTrainerProfile\`: Shows engagement stage badges
- \`getStageInfo()\`: Returns appropriate label and styling for each stage
- "Previously Declined" appears with muted red badge

### Explore Coaches
- Trainers with \`declined_dismissed\` stage show "Previously Declined"
- Allows clients to see interaction history
- Prevents confusion about previously declined trainers

## Benefits

1. **History Preservation**: Clients remember which trainers declined them
2. **Informed Decisions**: Reduces repeat interactions with declined trainers
3. **Clean Interface**: Removes clutter from My Trainers while preserving data
4. **Transparency**: Clear labeling prevents confusion

## Related Files

### Hooks
- \`src/hooks/useTrainerEngagement.tsx\`: Core engagement management
- \`src/hooks/useCoachSelection.tsx\`: Coach selection and decline logic
- \`src/hooks/useMyTrainers.tsx\`: My Trainers page data management

### Components
- \`src/pages/MyTrainers.tsx\`: Remove functionality
- \`src/components/tiered-profile/TieredTrainerProfile.tsx\`: Badge display
- \`src/components/TrainerCard.tsx\`: Trainer card engagement display

### Database
- \`client_trainer_engagement\`: Tracks all client-trainer interactions
- \`coach_selection_requests\`: Manages coaching request status
- \`update_engagement_stage()\`: RPC function for stage updates

## Testing Scenarios

1. **Decline and Remove**:
   - Trainer declines coaching request
   - Client sees "Declined" in My Trainers
   - Client clicks "Remove"
   - Trainer appears as "Previously Declined" in Explore

2. **Regular Remove**:
   - Client saves/shortlists trainer
   - Client clicks "Remove"
   - Trainer returns to normal browsing state

3. **Admin Cleanup**:
   - Admin can clean up all interactions between specific client-trainer pairs
   - Preserves audit trail in admin logs`,
      excerpt: 'Describes how the system preserves declined trainer history when clients remove them from My Trainers, showing "Previously Declined" labels in Explore Coaches.',
      content_type: 'business_rule' as KBContentType,
      status: 'published' as KBArticleStatus,
      featured: true,
      metadata: {
        tags: ['engagement', 'decline', 'coach-selection', 'client-journey'],
        difficulty: 'intermediate',
        last_updated: new Date().toISOString(),
        related_components: [
          'useTrainerEngagement',
          'useCoachSelection', 
          'useMyTrainers',
          'TieredTrainerProfile',
          'MyTrainers'
        ]
      }
    };

    try {
      // Check if article already exists
      const { data: existing } = await supabase
        .from('kb_articles')
        .select('id')
        .eq('slug', 'coach-decline-behavior-history-preservation')
        .single();

      if (existing) {
        setIsCreated(true);
        toast({
          title: 'Article Already Exists',
          description: 'The Coach Decline Behavior article is already in the knowledge base.',
        });
        return;
      }

      const { data, error } = await supabase
        .from('kb_articles')
        .insert(article)
        .select()
        .single();
      
      if (error) throw error;
      
      setIsCreated(true);
      toast({
        title: 'Success!',
        description: 'Coach Decline Behavior article added to knowledge base. Refresh the page to see it.',
      });
      
      // Trigger a page refresh after a short delay to show the new article
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to create article: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (isCreated) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Check className="h-5 w-5" />
            Article Created Successfully
          </CardTitle>
          <CardDescription className="text-green-600">
            The Coach Decline Behavior documentation has been added to the knowledge base.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <FileText className="h-5 w-5" />
          Add Coach Decline Documentation
        </CardTitle>
        <CardDescription className="text-blue-600">
          Click below to add comprehensive documentation about the coach decline behavior and history preservation feature.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={createArticle} 
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? (
            <>Creating Article...</>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Coach Decline Article
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};