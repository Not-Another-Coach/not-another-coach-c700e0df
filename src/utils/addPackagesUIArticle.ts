import { supabase } from '@/integrations/supabase/client';

export const addPackagesUIArticle = async () => {
  const article = {
    title: 'Packages & Ways of Working - UI Design System',
    slug: 'packages-ways-of-working-ui-design-system',
    content: `# Packages & Ways of Working - UI Design System

## Overview
This document outlines the premium, professional UI design system for presenting trainer packages and ways of working to clients. The design emphasizes trust, clarity, and approachability using the platform's standard blue color palette.

## Design Philosophy

### Core Principles
- **Premium & Approachable**: Professional wellness brand aesthetic
- **Trust-Building**: Using blues to convey professionalism and reliability
- **Clear Information Architecture**: Structured for clarity, designed for connection
- **Client-Centric**: Focus on emotional connection and informed decision-making

### Visual Language
- Deep navy blues for trust and authority
- Bright cyan for energy and clarity
- Soft backgrounds for depth without distraction
- Clean typography with friendly, supportive copy

## Blue Color Palette

### Primary Blues - Trust & Professionalism
\`\`\`css
--primary: hsl(210, 60%, 25%)        /* Deep navy */
--primary-50: hsl(210, 60%, 95%)     /* Very light blue */
--primary-100: hsl(210, 60%, 90%)    /* Light blue */
--primary-200: hsl(210, 60%, 85%)    /* Soft navy border */
--primary-600: hsl(210, 60%, 20%)    /* Darker navy for hovers */
\`\`\`

### Secondary Blues - Clarity & Energy
\`\`\`css
--secondary: hsl(190, 45%, 55%)      /* Cyan */
--secondary-50: hsl(190, 45%, 95%)   /* Very light cyan */
--secondary-100: hsl(190, 45%, 90%)  /* Light cyan */
--secondary-200: hsl(190, 45%, 85%)  /* Soft cyan border */
--secondary-600: hsl(190, 45%, 40%)  /* Darker cyan for text */
\`\`\`

### Energy Blues - Highlights
\`\`\`css
--energy: hsl(190, 75%, 50%)         /* Bright cyan */
--energy-200: hsl(190, 75%, 85%)     /* Light energy */
\`\`\`

### Neutrals
\`\`\`css
--background: hsl(245, 25%, 97%)     /* Blue-tinted white */
--muted: hsl(210, 25%, 92%)          /* Professional blue-gray */
\`\`\`

## Section-by-Section Design

### 1. "What's Always Included" Section

#### Current Implementation
- Standard Card component with generic checkmark list
- Plain copy: "These are included in all packages"
- No visual distinction from package cards

#### Enhanced Design
\`\`\`tsx
<Card className="bg-primary-50/30 border-primary-200 shadow-sm">
  <CardHeader>
    <CardTitle className="text-lg flex items-center gap-2 text-primary">
      <Check className="h-5 w-5" />
      What's Always Included
    </CardTitle>
    <p className="text-sm text-secondary-700">
      You're supported from day one
    </p>
  </CardHeader>
  <CardContent>
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {baseInclusions.map(inclusion => (
        <li className="flex items-start gap-2">
          <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
          <span className="text-sm">{inclusion}</span>
        </li>
      ))}
    </ul>
  </CardContent>
</Card>
\`\`\`

**Key Elements:**
- Soft blue background (\`bg-primary-50/30\`)
- Primary blue border for definition
- Friendly subheading: "You're supported from day one"
- Icons in primary color for consistency
- Clean grid layout for easy scanning

### 2. Package Cards

#### Current Implementation
- Basic card layout with full feature lists
- Price and duration clearly displayed
- Minimal visual hierarchy

#### Enhanced Design
\`\`\`tsx
<Card className="border-secondary-200 rounded-xl hover:shadow-md transition-shadow">
  {/* If highlighted/featured package */}
  <Card className="border-2 border-energy ring-2 ring-energy/20">
    <Badge variant="secondary" className="bg-energy text-energy-foreground">
      Popular Choice
    </Badge>
  </Card>
  
  <CardHeader>
    <div className="space-y-2">
      <h3 className="text-xl font-semibold text-foreground">
        {package.name}
      </h3>
      {/* Optional tagline field for emotional connection */}
      {package.tagline && (
        <p className="text-sm text-muted-foreground italic">
          {package.tagline}
        </p>
      )}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-primary">
          £{package.price}
        </span>
        <span className="text-sm text-muted-foreground">
          {package.duration}
        </span>
      </div>
    </div>
  </CardHeader>
  
  <CardContent className="space-y-4">
    {/* Key Features - limit to 3-4 */}
    <ul className="space-y-2">
      {package.keyFeatures.slice(0, 4).map(feature => (
        <li className="flex items-start gap-2">
          <Check className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
          <span className="text-sm">{feature}</span>
        </li>
      ))}
    </ul>
    
    {/* Extended Features - grouped separately */}
    {package.extraInclusions?.length > 0 && (
      <div className="bg-secondary-50/50 p-3 rounded-lg">
        <p className="text-xs font-medium text-secondary-600 uppercase tracking-wide mb-2">
          Extended Features
        </p>
        <ul className="space-y-1.5">
          {package.extraInclusions.map(extra => (
            <li className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-secondary flex-shrink-0 mt-0.5" />
              <span className="text-xs text-foreground">{extra}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </CardContent>
</Card>
\`\`\`

**Key Elements:**
- Soft cyan borders (\`border-secondary-200\`)
- Featured package: bright cyan border with ring effect
- Optional tagline for emotional hook
- Large, bold price in primary blue
- 3-4 key features prominently displayed
- Extended features in soft blue inset box
- Hover state for interactivity

**Suggested Taglines:**
- "Your journey starts here"
- "For committed transformation"
- "Premium, personalized support"
- "Foundation for lasting change"

### 3. Comparison Table

#### Current Implementation
- Always visible matrix
- All features shown at once
- Can feel overwhelming on mobile

#### Enhanced Design
\`\`\`tsx
<Collapsible defaultOpen={false}>
  <CollapsibleTrigger asChild>
    <Button 
      variant="outline" 
      className="w-full bg-primary hover:bg-primary-600 text-primary-foreground"
    >
      <span>Compare All Packages</span>
      <ChevronDown className="ml-2 h-4 w-4 transition-transform data-[state=open]:rotate-180" />
    </Button>
  </CollapsibleTrigger>
  
  <CollapsibleContent className="pt-4">
    <Table>
      {/* Grouped rows for clarity */}
      <TableBody>
        {/* Base Features Section */}
        <TableRow className="bg-gray-50">
          <TableCell colSpan={packages.length + 1} className="font-semibold text-sm text-primary">
            Base Features
          </TableCell>
        </TableRow>
        {baseFeatures.map(feature => (
          <TableRow>
            <TableCell>{feature.name}</TableCell>
            {packages.map(pkg => (
              <TableCell className="text-center">
                {pkg.hasFeature ? (
                  <Check className="h-4 w-4 text-secondary mx-auto" />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
        
        {/* Onboarding Section */}
        <TableRow className="bg-gray-50">
          <TableCell colSpan={packages.length + 1} className="font-semibold text-sm text-primary">
            Onboarding & Support
          </TableCell>
        </TableRow>
        {/* ... similar structure ... */}
      </TableBody>
    </Table>
  </CollapsibleContent>
</Collapsible>
\`\`\`

**Key Elements:**
- Hidden by default (collapsible)
- Primary blue button to reveal
- Grouped feature categories with headers
- Soft checkmarks in secondary/energy color
- Neutral minus signs for missing features
- Alternating row backgrounds for readability

### 4. Decorative Background Elements

#### Purpose
Create depth and visual interest without distraction using soft blurred shapes.

#### Implementation
\`\`\`tsx
<div className="relative overflow-hidden">
  {/* Decorative blurred circles */}
  <div className="absolute top-10 right-20 w-64 h-64 bg-secondary-100/30 rounded-full blur-3xl animate-pulse -z-10" />
  <div className="absolute bottom-32 left-10 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl -z-10" />
  <div className="absolute top-1/2 right-10 w-72 h-72 bg-energy-200/20 rounded-full blur-3xl animate-pulse -z-10" />
  
  {/* Main content */}
  <div className="relative z-10">
    {/* Package comparison content */}
  </div>
</div>
\`\`\`

**Key Elements:**
- Various sizes (w-64 to w-96)
- Soft opacity (20-40%)
- Heavy blur (blur-3xl)
- Strategic positioning
- Optional pulse animation
- Behind content (z-index)

## Component Architecture

### Data Flow
\`\`\`
PackagesView.tsx (fetches data from Supabase)
  ↓
PackageComparisonSection.tsx (container/layout)
  ↓
PackageComparisonMatrix.tsx OR PackageComparisonTable.tsx
  ↓
Individual package cards with styling
\`\`\`

### Key Props
- \`packages\`: Array of TrainerPackageExtended
- \`packageWorkflows\`: Array of PackageWaysOfWorking
- \`baseInclusions\`: String array of always-included items
- \`highlightedPackageId\`: String for featured package

### Visibility Rules
- **Public packages**: Always visible to all users
- **Post-match ways of working**: Requires \`client_trainer_engagement\` with stage in \`['matched', 'discovery_completed', 'agreed', 'payment_pending', 'active_client']\`

### RLS Policies
Defined in migration \`20251012065230\`:
- Public can view entries with \`visibility = 'public'\`
- Clients can view \`post_match\` entries when engaged
- Trainers manage their own entries
- Admins manage all entries

## Typography Scale

### Headings
- Section titles: \`text-2xl font-semibold text-primary\`
- Friendly subheadings: \`text-base text-secondary-700\`
- Package names: \`text-xl font-semibold text-foreground\`

### Body Text
- Taglines: \`text-sm text-muted-foreground italic\`
- Prices: \`text-3xl font-bold text-primary\`
- Feature bullets: \`text-sm text-foreground\`
- Extended features label: \`text-xs font-medium text-secondary-600 uppercase tracking-wide\`

## Spacing & Layout

### Card Spacing
- Padding: \`p-6\` to \`p-8\`
- Section gaps: \`space-y-6\` to \`space-y-8\`
- Card rounded corners: \`rounded-xl\` to \`rounded-2xl\`

### Borders
- Default: \`border\` (1px)
- Featured: \`border-2\` with ring
- Colors: \`border-primary-200\`, \`border-secondary-200\`, \`border-energy\`

### Shadows
- Default: \`shadow-sm\`
- Hover: \`shadow-md\`
- Transition: \`transition-shadow duration-300\`

## Implementation Status

### ✅ Current Implementation
- Package comparison matrix with desktop/mobile views
- Basic card layouts with prices
- Highlighted package support
- Base inclusions section
- RLS policies for content visibility

### ⚠️ Needs Enhancement
- Apply blue color palette throughout
- Add friendly/emotional copy
- Implement collapsible comparison
- Create extended features grouping
- Add decorative background elements
- Enhance featured package styling

### ❌ Not Yet Implemented
- Package tagline field in database
- Decorative blur component
- Premium card variants
- Interaction animations
- Full accessibility enhancements

## Implementation Roadmap

### Priority 1 - Quick Wins (30-60 min)
1. Update copy: "You're supported from day one"
2. Apply \`bg-primary-50/30 border-primary-200\` to base inclusions
3. Add \`text-primary\` to checkmark icons
4. Apply \`border-secondary-200\` to package cards
5. Enhance highlighted package: \`border-2 border-energy ring-2 ring-energy/20\`
6. Limit card bullets to 3-4 key features

### Priority 2 - Medium Effort (2-4 hours)
1. Add tagline field to \`TrainerPackageExtended\` type
2. Implement Collapsible comparison table
3. Create "Extended Features" inset grouping
4. Add decorative background blur elements
5. Style comparison button: \`bg-primary text-primary-foreground\`
6. Group comparison rows by category

### Priority 3 - Design System (4-8 hours)
1. Create reusable \`DecorativeBlur\` component
2. Build \`PackageCard\` component with variants
3. Add hover interactions and animations
4. Implement full accessibility (ARIA, keyboard nav)
5. Document reusable patterns
6. Create Storybook stories

## Testing Checklist

- [ ] Desktop view renders correctly
- [ ] Mobile view is fully responsive
- [ ] "Compare Packages" button works
- [ ] Collapsible animation is smooth
- [ ] Featured package clearly stands out
- [ ] Blue colors are consistent throughout
- [ ] Copy feels warm and approachable
- [ ] Extended features are visually separated
- [ ] Decorative backgrounds don't obscure content
- [ ] Checkmarks use correct colors (primary/secondary)
- [ ] Hover states provide feedback
- [ ] Keyboard navigation works
- [ ] Screen readers announce content properly
- [ ] Loading states handle gracefully

## Related Documentation

### Components
- \`PackageComparisonSection.tsx\` - Main container
- \`PackageComparisonMatrix.tsx\` - Detailed comparison
- \`PackageComparisonTable.tsx\` - Basic fallback
- \`PackagesView.tsx\` - Data fetching parent

### Database
- \`package_ways_of_working\` table
- \`trainer_packages\` table
- RLS policies (migration 20251012065230)

### Design System
- \`src/index.css\` - Color tokens
- \`tailwind.config.ts\` - Theme configuration
- Animation utilities

### Business Logic
- Content visibility based on engagement stage
- Public vs. post-match content rules
- Package highlighting logic

---

*Last updated: ${new Date().toISOString()}*
*Article type: Feature Documentation*
*Tags: ui, ux, packages, design-system, client-experience*`,
    excerpt: 'Comprehensive UI design system documentation for trainer packages and ways of working, including the blue color palette, component architecture, and implementation roadmap.',
    content_type: 'feature' as const,
    status: 'published' as const,
    featured: true,
    metadata: {
      tags: ['ui', 'ux', 'packages', 'design-system', 'client-experience', 'blue-palette'],
      difficulty: 'intermediate',
      last_updated: new Date().toISOString(),
      related_components: [
        'PackageComparisonSection',
        'PackageComparisonMatrix',
        'PackageComparisonTable',
        'PackagesView'
      ],
      color_palette: {
        primary: 'hsl(210, 60%, 25%)',
        secondary: 'hsl(190, 45%, 55%)',
        energy: 'hsl(190, 75%, 50%)'
      }
    }
  };

  try {
    const { data, error } = await supabase
      .from('kb_articles')
      .insert(article)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('Packages UI design article added to knowledge base:', data);
    return data;
  } catch (error) {
    console.error('Failed to add packages UI design article:', error);
    throw error;
  }
};
