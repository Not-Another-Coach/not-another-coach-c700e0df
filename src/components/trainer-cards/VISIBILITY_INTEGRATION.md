# Trainer Card Visibility Integration

## Overview
The trainer card visibility system implements progressive content revelation based on client engagement stages. All trainer card components now respect the visibility matrix defined in the database.

## Implementation

### Core Components

#### VisibilityAwareImage
- **Location**: `src/components/ui/VisibilityAwareImage.tsx`
- **Purpose**: Wrapper component that handles individual image visibility states
- **States**:
  - `visible`: Image shows clearly
  - `blurred`: Image shows with blur effect and eye-off icon
  - `hidden`: Shows lock icon with unlock message

#### VisibilityAwareGallery
- **Location**: `src/components/ui/VisibilityAwareGallery.tsx`
- **Purpose**: Handles image galleries with visibility controls
- **Features**:
  - Filters images based on visibility state
  - Shows placeholder slots for hidden content
  - Maintains grid layouts
  - Preserves media type indicators (play buttons, Instagram badges)

### Updated Components

#### SwipeableInstagramCard
- **Integration**: Added `useContentVisibility` and `useEngagementStage` hooks
- **Visibility Control**: `gallery_images` content type
- **Behavior**: 
  - Hidden: Shows only first image with lock message
  - Blurred: Shows all images with blur effect
  - Visible: Shows all images clearly with full functionality

#### InstagramGalleryView
- **Integration**: Uses `VisibilityAwareGallery` component
- **Visibility Control**: `gallery_images` content type
- **Features**: Maintains all existing functionality while respecting visibility

#### ClientTransformationView
- **Integration**: Uses `VisibilityAwareImage` for before/after images
- **Visibility Controls**: 
  - `before_after_images`: Controls transformation image visibility
  - `testimonial_images`: Controls testimonial text and details
- **Behavior**:
  - Hidden before/after: Shows lock icons on image slots
  - Blurred before/after: Shows images with blur effect
  - Hidden testimonials: Shows generic unlock message
  - Blurred testimonials: Shows testimonial text with blur effect

#### EnhancedTrainerCard
- **Integration**: Added visibility context hooks
- **Purpose**: Provides visibility context to all sub-view components
- **Features**: Each view mode respects appropriate visibility settings

## Usage

### Engagement Stages
The system recognizes these engagement stages:
- `browsing`: Initial discovery phase
- `liked`: User has shown interest
- `shortlisted`: Added to shortlist
- `getting_to_know_your_coach`: Early engagement
- `discovery_in_progress`: Active discovery process
- `matched`: Mutual match established
- `discovery_completed`: Discovery phase finished
- `agreed`: Agreement reached
- `payment_pending`: Payment in process
- `active_client`: Active coaching relationship

### Content Types
The system controls visibility for:
- `profile_image`: Trainer profile photos
- `before_after_images`: Transformation photos
- `package_images`: Package and pricing visuals
- `testimonial_images`: Client testimonial content
- `certification_images`: Professional certifications
- `gallery_images`: Instagram and uploaded media

### Visibility States
- `hidden`: Content not accessible, shows lock icons
- `blurred`: Content partially accessible, shows blurred with unlock hints
- `visible`: Full content access

## Database Integration

The system uses these database functions:
- `get_content_visibility()`: Retrieves visibility state for specific content
- `initialize_trainer_visibility_defaults()`: Sets up default visibility rules

Visibility rules are stored in:
- `trainer_visibility_settings`: Trainer-specific visibility overrides
- Database functions provide fallback defaults when no specific rules exist

## Testing

To test the visibility system:
1. Use different engagement stages with the same trainer
2. Verify content progressively unlocks
3. Check that blur effects apply correctly
4. Ensure lock icons show for hidden content
5. Confirm media type indicators (play buttons, Instagram badges) respect visibility

## Security

The visibility system ensures:
- Sensitive content (pricing, detailed transformations) remains hidden until appropriate engagement
- Progressive revelation encourages user engagement
- Trainer privacy preferences are respected
- Client relationship stage determines content access