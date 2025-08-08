import { supabase } from '@/integrations/supabase/client';
import type { KBContentType, KBArticleStatus } from '@/hooks/useKnowledgeBase';

// Function to directly create the coach decline behavior article
export const createCoachDeclineArticle = async () => {
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
    const { data, error } = await supabase
      .from('kb_articles')
      .insert(article)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('Coach decline behavior article created:', data);
    return data;
  } catch (error) {
    console.error('Failed to create coach decline behavior article:', error);
    throw error;
  }
};

// Execute the function immediately
createCoachDeclineArticle().catch(console.error);