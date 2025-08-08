import { useCreateKBArticle } from '@/hooks/useKnowledgeBase';

export const createDiscoveryCallBookingArticle = async () => {
  const article = {
    title: "Discovery Call Booking System with Cancellation Handling",
    slug: "discovery-call-booking-system-cancellation",
    content: `# Discovery Call Booking System with Cancellation Handling

## Overview

The Discovery Call Booking System is a comprehensive feature that manages the entire lifecycle of discovery calls between clients and trainers, including booking, completion, and cancellation handling with automatic engagement stage management.

## Key Components

### 1. Database Tables

#### discovery_calls
- **id**: Unique identifier for each discovery call
- **client_id**: Reference to the client user
- **trainer_id**: Reference to the trainer user  
- **scheduled_for**: DateTime when the call is scheduled
- **status**: Current status ('scheduled', 'completed', 'cancelled', 'rescheduled')
- **booking_notes**: Optional notes from the client when booking

#### client_trainer_engagement
- **client_id**: Reference to client
- **trainer_id**: Reference to trainer
- **stage**: Current engagement stage
- **discovery_completed_at**: Timestamp when discovery phase completed
- **updated_at**: Last update timestamp

### 2. Engagement Stages

The system automatically manages these engagement stages:

1. **browsing** - Initial stage when client views trainer profile
2. **liked** - Client has shown interest
3. **shortlisted** - Client has added trainer to shortlist
4. **discovery_call_booked** - Discovery call has been scheduled
5. **discovery_completed** - Discovery call finished successfully
6. **active_client** - Client has become an active client

### 3. Automatic Stage Management

The system uses a database trigger (\`update_engagement_on_discovery_call_booking\`) that automatically updates engagement stages based on discovery call status changes:

#### On Discovery Call Booking (INSERT)
- Updates engagement stage to **discovery_call_booked**
- Only affects stages that aren't already **active_client**
- Prevents duplicate bookings from changing stage unnecessarily

#### On Discovery Call Completion (UPDATE to 'completed')
- Updates engagement stage to **discovery_completed**
- Sets **discovery_completed_at** timestamp
- Enables progression to active client status

#### On Discovery Call Cancellation (UPDATE to 'cancelled')
- Reverts engagement stage back to **shortlisted**
- Only reverts if current stage is **discovery_call_booked**
- Allows clients to re-engage through messaging or rebooking

## Technical Implementation

### Database Function

\`\`\`sql
CREATE OR REPLACE FUNCTION public.update_engagement_on_discovery_call_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Booking logic
  IF TG_OP = 'INSERT' THEN
    UPDATE public.client_trainer_engagement
    SET 
      stage = 'discovery_call_booked', 
      updated_at = now()
    WHERE client_id = NEW.client_id 
      AND trainer_id = NEW.trainer_id 
      AND stage != 'active_client'
      AND stage != 'discovery_call_booked';
  END IF;
  
  -- Completion logic
  IF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.client_trainer_engagement
    SET 
      stage = 'discovery_completed', 
      discovery_completed_at = now(),
      updated_at = now()
    WHERE client_id = NEW.client_id 
      AND trainer_id = NEW.trainer_id;
  END IF;
  
  -- Cancellation logic
  IF TG_OP = 'UPDATE' AND NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE public.client_trainer_engagement
    SET 
      stage = 'shortlisted',
      updated_at = now()
    WHERE client_id = NEW.client_id 
      AND trainer_id = NEW.trainer_id
      AND stage = 'discovery_call_booked';
  END IF;
  
  RETURN NEW;
END;
$function$;
\`\`\`

### Key Hooks and Components

#### useDiscoveryCallBooking
Manages the booking functionality and integrates with the engagement system.

#### DiscoveryCallBookingModal
Provides the UI for clients to book discovery calls with trainers.

#### useDiscoveryCallData
Fetches and manages discovery call data for both clients and trainers.

## Business Rules

### Booking Rules
1. Clients can only book one active discovery call per trainer
2. Trainers must have discovery calls enabled in their settings
3. Booking automatically updates engagement stage

### Cancellation Rules
1. Either party can cancel a scheduled discovery call
2. Cancellation reverts engagement stage to **shortlisted**
3. Clients can rebook after cancellation
4. Cancellation doesn't prevent future interactions

### Completion Rules
1. Only trainers can mark discovery calls as completed
2. Completion enables progression to active client status
3. Completion triggers feedback request notifications

## Status Flow

\`\`\`
Client views trainer → browsing
Client likes trainer → liked  
Client shortlists trainer → shortlisted
Client books discovery call → discovery_call_booked
Discovery call completed → discovery_completed
Client becomes active → active_client

Special case: discovery_call_booked → cancelled → shortlisted
\`\`\`

## Error Handling

The system includes comprehensive error handling:
- Database constraints prevent duplicate bookings
- Trigger logic includes safety checks for existing stages
- RLS policies ensure users can only modify their own data
- Toast notifications inform users of successful/failed operations

## Testing Considerations

When testing the discovery call system:
1. Verify engagement stage progression through each step
2. Test cancellation reversal functionality
3. Confirm RLS policies prevent unauthorized access
4. Validate notification triggers fire correctly
5. Test edge cases like multiple rapid status changes

## Recent Updates

**Cancellation Handling Enhancement** - Added automatic engagement stage reversion when discovery calls are cancelled, allowing clients to re-engage naturally through the platform's progression system.`,
    excerpt: "Comprehensive system managing discovery call booking, completion, and cancellation with automatic engagement stage management between clients and trainers.",
    content_type: "feature" as const,
    status: "published" as const,
    featured: true,
    metadata: {
      updated_date: new Date().toISOString(),
      author: "System Documentation",
      version: "2.0",
      related_tables: ["discovery_calls", "client_trainer_engagement"],
      related_functions: ["update_engagement_on_discovery_call_booking"],
      related_hooks: ["useDiscoveryCallBooking", "useDiscoveryCallData"],
      last_updated_feature: "cancellation_handling"
    }
  };

  return article;
};