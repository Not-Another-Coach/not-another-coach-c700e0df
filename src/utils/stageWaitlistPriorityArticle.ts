import { stageArticle } from './stageArticle';

export const stageWaitlistPriorityAccessArticle = async () => {
  return await stageArticle({
    title: "Waitlist Priority Access Feature",
    content: `# Waitlist Priority Access Feature

## Overview
The Waitlist Priority Access feature allows trainers to offer new availability slots exclusively to their waitlisted clients for 48 hours before making them available to the general public. This creates value for clients who join waitlists and helps trainers prioritize their existing potential clients.

## How It Works

### For Trainers
1. **Automatic Prompt**: When a trainer has waitlisted clients and creates new availability, they're prompted to offer it exclusively to waitlist clients first
2. **Optional Activation**: Trainers can choose to either:
   - Offer 48-hour exclusive access to waitlist clients
   - Make availability public immediately
3. **Dashboard Visibility**: Trainers see when exclusive periods are active and can manually end them early
4. **Automatic Expiry**: Exclusive periods automatically expire after 48 hours and become public

### For Clients
1. **Early Access Alerts**: Waitlisted clients receive notifications when they have exclusive access to new slots
2. **Dashboard Widget**: A dedicated widget shows available exclusive access opportunities
3. **Booking Actions**: Clients can book discovery calls or select packages during their exclusive access period
4. **Time-Limited**: Clear countdown showing when exclusive access expires

## Technical Implementation

### Database Components
- **waitlist_exclusive_periods**: Tracks active exclusive access periods
- **coach_availability_settings**: Stores trainer availability preferences
- **alerts**: Manages notifications for both trainers and clients

### Frontend Components
- **WaitlistExclusivePrompt**: Modal for trainer decision when adding availability
- **WaitlistExclusiveAccess**: Client widget showing exclusive opportunities
- **WaitlistExclusiveAccessWidget**: Dashboard integration for clients
- **CoachExclusivityEndedAlert**: Notifications when exclusive periods end

### Backend Functions
- **start_waitlist_exclusive_period()**: Creates new exclusive access period
- **end_waitlist_exclusive_period()**: Manually or automatically ends periods
- **client_has_waitlist_exclusive_access()**: Checks client access rights
- **auto_end_expired_exclusive_periods()**: Automated cleanup function

### Edge Function
- **process-waitlist-exclusivity**: Automated function that runs periodically to end expired exclusive periods

## Business Rules

### Exclusive Period Duration
- Default: 48 hours from creation
- Configurable per trainer (future enhancement)
- Cannot exceed 7 days (system limit)

### Access Requirements
- Client must be on trainer's active waitlist
- Exclusive period must be active and not expired
- Standard booking/selection rules still apply

### Notifications
- Trainers receive alerts when exclusive periods end
- Clients receive alerts when they gain exclusive access
- Automatic cleanup ensures no stale periods remain active

## Benefits

### For Trainers
- **Client Retention**: Provides value to waitlisted clients
- **Priority Management**: Allows serving committed prospects first
- **Flexibility**: Optional feature with manual override capability

### For Clients
- **VIP Treatment**: Early access to new availability
- **Better Booking Chances**: Reduced competition for popular trainers
- **Incentive to Join Waitlists**: Clear value proposition for waiting

### For Platform
- **Engagement**: Increases client interaction with waitlist system
- **Conversion**: Higher likelihood of waitlist clients converting
- **User Experience**: Creates sense of exclusivity and value

## Related Features
- Coach Waitlist Management
- Discovery Call Booking System
- Coach Selection Process
- Availability Management
- Alert/Notification System

## Future Enhancements
- Configurable exclusive period duration
- Priority tiers within waitlists
- Analytics on exclusive access conversion rates
- Bulk exclusive access for multiple trainers`,
    excerpt: "Feature allowing trainers to offer new availability exclusively to waitlisted clients for 48 hours before making it public",
    contentType: 'feature',
    metadata: {
      type: 'feature_documentation',
      version: '1.0',
      implemented_date: new Date().toISOString(),
      components: [
        'WaitlistExclusivePrompt',
        'WaitlistExclusiveAccess', 
        'WaitlistExclusiveAccessWidget',
        'CoachExclusivityEndedAlert',
        'useWaitlistExclusive'
      ],
      database_functions: [
        'start_waitlist_exclusive_period',
        'end_waitlist_exclusive_period', 
        'client_has_waitlist_exclusive_access',
        'auto_end_expired_exclusive_periods'
      ],
      edge_functions: ['process-waitlist-exclusivity']
    }
  });
};