import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCreateKBArticle, type KBArticleStatus, type KBContentType } from '@/hooks/useKnowledgeBase';
import { FileText, Navigation } from 'lucide-react';

export const AddBreadcrumbProgressArticle = () => {
  const { toast } = useToast();
  const createArticle = useCreateKBArticle();

  const handleAddArticle = async () => {
    try {
      const articleData = {
        title: 'Trainer Breadcrumb Progress System',
        slug: 'trainer-breadcrumb-progress-system',
        excerpt: 'Comprehensive guide to the client journey tracking and progress visualization system',
        content: `# Trainer Breadcrumb Progress System

## Overview
The Trainer Breadcrumb Progress System provides visual journey tracking for both clients and trainers, showing completion status across different stages of the onboarding and matching process.

## Key Components

### 1. ClientJourneyBreadcrumb
- **Location**: \`src/components/ClientJourneyBreadcrumb.tsx\`
- **Purpose**: Main navigation component showing client's current position in their journey
- **Features**:
  - Visual progress indicators
  - Step completion status
  - Navigation between completed steps

### 2. ProgressBreadcrumb
- **Location**: \`src/components/ProgressBreadcrumb.tsx\`
- **Purpose**: Generic progress tracking component
- **Features**:
  - Configurable step definitions
  - Completion status calculation
  - Responsive design

### 3. StepCompletionIcon
- **Location**: \`src/components/StepCompletionIcon.tsx\`
- **Purpose**: Visual indicator for step completion status
- **States**:
  - Completed (checkmark)
  - Current (highlighted)
  - Pending (neutral)
  - Locked (disabled)

## Journey Stages

### Client Journey
1. **Survey Completion**: Initial client assessment
2. **Trainer Matching**: Algorithm-based trainer suggestions
3. **Coach Selection**: Client chooses preferred trainer
4. **Onboarding**: Setup and goal configuration

### Trainer Profile Setup
1. **Basic Information**: Name, contact, location
2. **Expertise & Qualifications**: Skills and certifications
3. **Verification**: Document submission and approval
4. **Package Configuration**: Services and pricing

## Data Sources

### Client Progress Tracking
- \`client_survey_responses\`: Survey completion status
- \`trainer_matches\`: Matching algorithm results
- \`coach_selection_requests\`: Client trainer choices
- \`client_onboarding_progress\`: Setup completion

### Trainer Progress Tracking
- \`trainers\`: Basic profile information
- \`trainer_verification_checks\`: Verification status
- \`trainer_packages\`: Service configuration

## Implementation Details

### Progress Calculation
\`\`\`typescript
const calculateProgress = (stages: Stage[]) => {
  const completed = stages.filter(stage => stage.completed).length;
  return (completed / stages.length) * 100;
};
\`\`\`

### Step Status Logic
- **Completed**: All required data submitted and validated
- **Current**: Next logical step in the process
- **Pending**: Future step not yet accessible
- **Locked**: Step requires prerequisites

### Responsive Behavior
- Desktop: Full breadcrumb with labels
- Tablet: Condensed view with icons
- Mobile: Progress bar with current step indicator

## Integration Points

### With Onboarding System
- Tracks completion of onboarding steps
- Updates progress in real-time
- Enables navigation between completed steps

### With Verification System
- Shows verification status in trainer setup
- Updates when documents are approved/rejected
- Blocks progression until verification complete

### With Coach Selection
- Reflects client's choice status
- Shows pending/confirmed selections
- Enables re-selection if needed

## Usage Examples

### Basic Client Journey
\`\`\`tsx
<ClientJourneyBreadcrumb 
  currentStep="matching"
  completedSteps={["survey"]}
  onStepClick={handleNavigateToStep}
/>
\`\`\`

### Trainer Profile Progress
\`\`\`tsx
<ProgressBreadcrumb
  steps={trainerSetupSteps}
  currentStepId={currentStep}
  showLabels={true}
/>
\`\`\`

## Customization Options

### Theming
- Uses design system tokens for consistent styling
- Supports light/dark mode
- Customizable color schemes per journey type

### Step Configuration
- Dynamic step definitions
- Conditional step visibility
- Custom completion criteria

## Performance Considerations

### Optimization Strategies
- Memoized progress calculations
- Lazy loading of step content
- Efficient re-render patterns

### Data Fetching
- Real-time progress updates via Supabase subscriptions
- Optimistic UI updates
- Error boundary handling

## Accessibility Features

### WCAG Compliance
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader announcements
- High contrast mode support

### Navigation
- Skip links for screen readers
- Focus management
- Logical tab order

## Troubleshooting

### Common Issues
1. **Progress not updating**: Check data subscription connections
2. **Step navigation failing**: Verify completion status logic
3. **Visual inconsistencies**: Review CSS custom properties

### Debug Tools
- Browser developer tools for styling
- React DevTools for component state
- Supabase dashboard for data verification`,
        content_type: 'feature' as KBContentType,
        status: 'published' as KBArticleStatus,
        featured: true,
        tags: ['breadcrumb', 'progress', 'navigation', 'client-journey', 'trainer-setup', 'ui-components']
      };

      await createArticle.mutateAsync(articleData);
      toast({
        title: 'Success',
        description: 'Trainer Breadcrumb Progress System article added to knowledge base',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add article to knowledge base',
        variant: 'destructive',
      });
      console.error('Error adding article:', error);
    }
  };

  return (
    <Button onClick={handleAddArticle} className="flex items-center gap-2">
      <Navigation className="h-4 w-4" />
      <FileText className="h-4 w-4" />
      Add Breadcrumb Progress Article
    </Button>
  );
};