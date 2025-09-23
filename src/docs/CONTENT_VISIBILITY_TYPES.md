# Content Visibility Types

This document defines what content is controlled by each visibility type in the trainer profile system.

## Content Types

### `basic_information`
**Controls:** Core trainer identity and location information
- **Name/Title**: Trainer's first name + last name
- **Location**: City/region with MapPin icon  
- **Tagline**: Professional description or specialty title (when displayed)

**Components Using:**
- `VisibilityAwareBasicInfo` component in all trainer card layouts
- Applied in: UnifiedTrainerCard, FeatureSummaryView, InstagramGalleryView

### `description_bio`  
**Controls:** Detailed trainer description and bio content
- **Bio**: Longer description text about the trainer
- **Professional background**: Extended information about experience

**Components Using:**
- `VisibilityAwareText` component
- Applied in: FeatureSummaryView and other detailed views

### `gallery_images`
**Controls:** Trainer's visual portfolio and image gallery
- **Profile images**: Personal and professional photos
- **Instagram feed**: Connected social media images
- **Before/after photos**: Transformation galleries
- **Workout images**: Training session photos

**Components Using:**
- `VisibilityAwareGallery` component
- `VisibilityAwareImage` component
- Applied in: InstagramGalleryView, ClientTransformationView

### `stats_ratings`
**Controls:** Performance metrics and social proof
- **Rating**: Star rating average
- **Review count**: Total number of reviews
- **Client count**: Number of clients trained

**Components Using:**
- `VisibilityAwareRating` component
- Applied in: All trainer card views for ratings display

### `contact_info`
**Controls:** Direct communication details
- **Phone number**: Direct contact number
- **Email**: Professional email address  
- **Social media**: Direct social handles

### `pricing_rates`
**Controls:** Financial information and pricing
- **Hourly rates**: Session pricing
- **Package rates**: Bundle pricing
- **Special offers**: Discount information

## Engagement Stage Groups

### `guest`
**Users:** Not logged in, browsing publicly
**Typical Visibility:** Very limited, mostly hidden/blurred content

### `browsing` 
**Users:** Logged in, general exploration
**Typical Visibility:** Basic info visible, detailed content limited

### `liked`
**Users:** Showed interest by liking/favoriting
**Typical Visibility:** More content unlocked, some restrictions remain

### `shortlisted`
**Users:** Added trainer to shortlist for comparison  
**Typical Visibility:** Most content visible, direct contact may be limited

### `matched`
**Users:** High compatibility or mutual interest
**Typical Visibility:** Full access to most content types

## Implementation Notes

- Content visibility is determined by trainer settings and client engagement level
- Each content type can be set to `visible`, `blurred`, or `hidden` per engagement stage
- Admins can set system defaults via the System Visibility Defaults interface
- Trainers can override defaults in their profile settings