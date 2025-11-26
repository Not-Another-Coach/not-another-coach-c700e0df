# Branding Guidelines

## CTA (Call-to-Action) Hierarchy

### Button Variants & Usage

| Variant | Usage | Visual Style | Use Cases |
|---------|-------|--------------|-----------|
| **hero** | Primary forward navigation | Gradient (primary → energy) | "Next" buttons in multi-step flows |
| **success** | Completion actions | Solid green with white text | "Publish", "Save Profile", "Submit", "Complete" |
| **ai** | AI-powered features | Purple gradient (purple → indigo) | "Improve", "AI Helper", AI generation buttons |
| **default** | Standard actions | Solid primary color | General form submissions, confirmations |
| **secondary** | Additive/creation actions | Muted background | "Add Milestone", "Request New", "Preview", secondary options |
| **outline** | Utility/file actions | Bordered with transparent background | "Upload Cert", "Select Images", "Browse Files", "Previous", "Back" |
| **ghost** | Subtle actions | No background, text only | Inline actions, menu items |
| **link** | Text links | Underlined text style | Navigation links, "Learn more" |
| **destructive** | Dangerous actions | Red with white text | "Delete", "Remove", permanent actions |
| **energy** | High-energy actions | Teal/cyan gradient | Special promotions, standout features |

### CTA Priority Levels

```
Level 1 (Highest): hero, success
Level 2: default, ai
Level 3: secondary (Preview, Add, Request, Create)
Level 4: outline (Upload, Select, Browse, Previous), ghost, link
Level 5 (Destructive): destructive
```

### Implementation Examples

```tsx
// Primary navigation (Next)
<Button variant="hero">Next</Button>

// Completion actions (Publish, Save)
<Button variant="success">Publish</Button>
<Button variant="success">Save Profile</Button>

// AI features
<Button variant="ai">Improve</Button>
<Button variant="ai">AI Helper</Button>

// Additive/creation actions
<Button variant="secondary">
  <Plus className="w-4 h-4 mr-2" />
  Add Milestone
</Button>
<Button variant="secondary">
  <Send className="w-4 h-4 mr-2" />
  Request New Qualification
</Button>

// File/upload actions
<Button variant="outline">
  <Upload className="w-4 h-4 mr-2" />
  Upload Cert
</Button>
<Button variant="outline">
  <Upload className="w-4 h-4 mr-2" />
  Select Images
</Button>

// Back navigation
<Button variant="outline">Previous</Button>

// Preview/secondary
<Button variant="secondary">Preview</Button>
```

---

## Color Palette

### Primary Colors

| Color | HSL Value | Hex Approximation | Usage |
|-------|-----------|-------------------|--------|
| Primary | `210 60% 25%` | `#1A4D6B` | Main brand color, headers, primary CTAs |
| Primary Foreground | `210 20% 95%` | `#EEF2F5` | Text on primary backgrounds |

**Primary Scale:**
- 50: `210 60% 95%` - Lightest tint
- 100: `210 60% 90%`
- 200: `210 60% 80%`
- 300: `210 60% 70%`
- 400: `210 60% 45%`
- 500: `210 60% 25%` - Base
- 600: `210 60% 20%`
- 700: `210 60% 15%`
- 800: `210 60% 10%`
- 900: `210 60% 5%` - Darkest shade

### Secondary Colors

| Color | HSL Value | Hex Approximation | Usage |
|-------|-----------|-------------------|--------|
| Secondary | `190 45% 55%` | `#5BAFBD` | Secondary actions, accents |
| Secondary Foreground | `0 0% 100%` | `#FFFFFF` | Text on secondary backgrounds |

**Secondary Scale:** 50-900 (same pattern as primary)

### Accent Colors

| Color | HSL Value | Hex Approximation | Usage |
|-------|-----------|-------------------|--------|
| Accent | `25 85% 60%` | `#F27843` | Highlights, notifications, special emphasis |
| Accent Foreground | `0 0% 100%` | `#FFFFFF` | Text on accent backgrounds |

**Accent Scale:** 50-900 (same pattern as primary)

### Semantic Colors

| Color | HSL Value | Hex Approximation | Usage |
|-------|-----------|-------------------|--------|
| Success | `145 65% 45%` | `#28A866` | Confirmations, completed states, positive feedback |
| Success Foreground | `0 0% 100%` | `#FFFFFF` | Text on success backgrounds |
| Warning | `45 95% 55%` | `#F5C542` | Warnings, caution states |
| Warning Foreground | `0 0% 100%` | `#FFFFFF` | Text on warning backgrounds |
| Error | `0 84% 60%` | `#E94E4E` | Errors, destructive actions |
| Error Foreground | `210 40% 98%` | `#F8FAFC` | Text on error backgrounds |

### Special Feature Colors

| Color | HSL Value | Hex Approximation | Usage |
|-------|-----------|-------------------|--------|
| Energy | `190 75% 50%` | `#20B4BF` | High-energy features, standout elements |
| Energy Foreground | `0 0% 100%` | `#FFFFFF` | Text on energy backgrounds |
| Purple (AI) | `270 70% 60%` | `#A666E6` | AI features, intelligent automation |
| Purple Foreground | `0 0% 100%` | `#FFFFFF` | Text on purple backgrounds |
| Indigo | `240 75% 60%` | `#6B75E6` | Secondary AI features, tech elements |
| Indigo Foreground | `0 0% 100%` | `#FFFFFF` | Text on indigo backgrounds |

### Neutral Colors

| Color | HSL Value | Hex Approximation | Usage |
|-------|-----------|-------------------|--------|
| Background | `245 25% 97%` | `#F6F7F9` | Main background color |
| Foreground | `215 25% 15%` | `#1E2A36` | Main text color |
| Muted | `210 25% 92%` | `#E8EBF0` | Muted backgrounds, disabled states |
| Muted Foreground | `215 15% 50%` | `#6B7785` | Secondary text, muted content |
| Border | `214 32% 91%` | `#E3E8EF` | Border color |

**Gray Scale (50-900):**
- 50: `210 20% 98%` - Lightest
- 100: `210 20% 95%`
- 200: `210 20% 90%`
- 300: `210 20% 80%`
- 400: `210 20% 65%`
- 500: `210 20% 50%`
- 600: `210 20% 40%`
- 700: `210 20% 30%`
- 800: `210 20% 20%`
- 900: `210 20% 10%` - Darkest

---

## Gradients

### Predefined Gradients

```css
/* Primary gradient - main brand gradient */
--gradient-primary: linear-gradient(135deg, hsl(210, 60%, 25%), hsl(190, 75%, 50%));

/* Hero gradient - multi-color brand gradient */
--gradient-hero: linear-gradient(135deg, hsl(210, 60%, 25%) 0%, hsl(190, 75%, 50%) 50%, hsl(145, 65%, 45%) 100%);

/* AI gradient - for AI features */
--gradient-ai: linear-gradient(135deg, hsl(270, 70%, 60%), hsl(240, 75%, 60%));

/* Energy gradient - high-energy features */
--gradient-energy: linear-gradient(135deg, hsl(190, 75%, 50%), hsl(145, 65%, 45%));

/* Success gradient */
--gradient-success: linear-gradient(135deg, hsl(145, 65%, 45%), hsl(170, 70%, 50%));

/* Accent gradient */
--gradient-accent: linear-gradient(135deg, hsl(25, 85%, 60%), hsl(45, 95%, 55%));

/* Soft gradients (subtle backgrounds) */
--gradient-primary-soft: linear-gradient(135deg, hsl(210, 60%, 95%), hsl(190, 75%, 95%));
--gradient-energy-soft: linear-gradient(135deg, hsl(190, 75%, 95%), hsl(145, 65%, 95%));
--gradient-glass: linear-gradient(135deg, hsl(0, 0%, 100% / 0.1), hsl(0, 0%, 100% / 0.05));
--gradient-card: linear-gradient(145deg, hsl(0, 0%, 100%) 0%, hsl(210, 25%, 97%) 100%);
```

### Gradient Usage

| Gradient | Button Variant | Use Case |
|----------|---------------|----------|
| `gradient-hero` | `hero` | Primary navigation (Next) |
| `gradient-ai` | `ai` | AI features (Improve, AI Helper) |
| `gradient-success` | `success` | Completion actions |
| `gradient-energy` | `energy` | High-energy CTAs |
| `gradient-primary` | - | Headers, hero sections |

---

## Shadows & Elevation

### Shadow Scale

```css
--shadow-xs: 0 1px 2px 0 hsl(210 60% 25% / 0.05);
--shadow-sm: 0 1px 3px 0 hsl(210 60% 25% / 0.1), 0 1px 2px -1px hsl(210 60% 25% / 0.1);
--shadow-md: 0 4px 6px -1px hsl(210 60% 25% / 0.1), 0 2px 4px -2px hsl(210 60% 25% / 0.1);
--shadow-lg: 0 10px 15px -3px hsl(210 60% 25% / 0.1), 0 4px 6px -4px hsl(210 60% 25% / 0.1);
--shadow-xl: 0 20px 25px -5px hsl(210 60% 25% / 0.1), 0 8px 10px -6px hsl(210 60% 25% / 0.1);
--shadow-2xl: 0 25px 50px -12px hsl(210 60% 25% / 0.25);
```

### Colored Shadows

```css
--shadow-primary: 0 8px 25px -8px hsl(210 60% 25% / 0.3);
--shadow-secondary: 0 8px 25px -8px hsl(190 45% 55% / 0.3);
--shadow-accent: 0 8px 25px -8px hsl(25 85% 60% / 0.3);
--shadow-success: 0 8px 25px -8px hsl(145 65% 45% / 0.3);
--shadow-warning: 0 8px 25px -8px hsl(45 95% 55% / 0.3);
--shadow-error: 0 8px 25px -8px hsl(0 84% 60% / 0.3);
```

### Shadow Usage Guidelines

- **xs**: Input fields, small cards
- **sm**: Buttons, badges, chips
- **md**: Cards, dropdowns
- **lg**: Modals, popovers
- **xl**: Hero sections, featured cards
- **2xl**: Full-page overlays, important dialogs

---

## Typography

### Font Scale

| Name | Size | Line Height | Usage |
|------|------|-------------|--------|
| xs | 0.75rem (12px) | 1.25 (tight) | Small labels, captions |
| sm | 0.875rem (14px) | 1.5 (normal) | Secondary text, descriptions |
| base | 1rem (16px) | 1.5 (normal) | Body text, paragraphs |
| lg | 1.125rem (18px) | 1.5 (normal) | Large body text |
| xl | 1.25rem (20px) | 1.375 (snug) | Small headings |
| 2xl | 1.5rem (24px) | 1.375 (snug) | Section headings |
| 3xl | 1.875rem (30px) | 1.25 (tight) | Page headings |
| 4xl | 2.25rem (36px) | 1.25 (tight) | Large headings |
| 5xl | 3rem (48px) | 1 (none) | Hero headings |
| 6xl | 3.75rem (60px) | 1 (none) | Extra large headings |
| 7xl | 4.5rem (72px) | 1 (none) | Display headings |
| 8xl | 6rem (96px) | 1 (none) | Massive display |
| 9xl | 8rem (128px) | 1 (none) | Ultra display |

### Font Weights

| Weight | Value | Usage |
|--------|-------|--------|
| thin | 100 | Decorative only |
| extralight | 200 | Subtle emphasis |
| light | 300 | Secondary text |
| normal | 400 | Body text |
| medium | 500 | Emphasis, labels |
| semibold | 600 | Subheadings, buttons |
| bold | 700 | Headings, strong emphasis |
| extrabold | 800 | Display headings |
| black | 900 | Maximum emphasis |

### Line Heights

- **none** (1): Display headings
- **tight** (1.25): Large headings
- **snug** (1.375): Small headings
- **normal** (1.5): Body text
- **relaxed** (1.625): Comfortable reading
- **loose** (2): Maximum readability

---

## Spacing Scale

| Name | Value | Usage |
|------|-------|--------|
| xs | 0.25rem (4px) | Tight spacing, icon gaps |
| sm | 0.5rem (8px) | Button padding, small gaps |
| md | 1rem (16px) | Standard spacing, card padding |
| lg | 1.5rem (24px) | Section spacing |
| xl | 2rem (32px) | Large section gaps |
| 2xl | 3rem (48px) | Major section dividers |
| 3xl | 4rem (64px) | Page section spacing |
| 4xl | 6rem (96px) | Large page sections |
| 5xl | 8rem (128px) | Hero section spacing |

---

## Border Radius

| Name | Value | Usage |
|------|-------|--------|
| xs | 0.125rem (2px) | Minimal rounding |
| sm | 0.25rem (4px) | Small elements |
| md | 0.375rem (6px) | Inputs, small buttons |
| lg | 0.5rem (8px) | Cards, buttons (DEFAULT) |
| xl | 0.75rem (12px) | Large cards |
| 2xl | 1rem (16px) | Hero cards |
| 3xl | 1.5rem (24px) | Extra large elements |
| full | 9999px | Pills, circles |

---

## Component Guidelines

### Buttons

```tsx
// Always use semantic variants, never custom classes
<Button variant="hero">Primary Action</Button>
<Button variant="success">Complete Action</Button>
<Button variant="ai">AI Feature</Button>
<Button variant="outline">Secondary Action</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon Only</Button>
```

### Cards

```tsx
// Use semantic colors via design tokens
<Card className="shadow-md"> // ✅ Good
<Card className="shadow-[0_4px_20px]"> // ❌ Bad - use design token
```

### Text Colors

```tsx
// Always use design tokens
className="text-foreground" // ✅ Good - primary text
className="text-muted-foreground" // ✅ Good - secondary text
className="text-primary" // ✅ Good - brand color text
className="text-success" // ✅ Good - success state text

className="text-[#1A4D6B]" // ❌ Bad - hardcoded color
className="text-gray-700" // ❌ Bad - direct color (use gray-700 from system)
```

### Background Colors

```tsx
// Always use design tokens
className="bg-background" // ✅ Good - main background
className="bg-card" // ✅ Good - card background
className="bg-primary" // ✅ Good - primary background
className="bg-muted" // ✅ Good - muted background

className="bg-[#F6F7F9]" // ❌ Bad - hardcoded
className="bg-white" // ❌ Bad - use bg-card or bg-background
```

---

## Design System Rules

### Critical Rules

1. **All colors MUST be HSL format** - No RGB, hex, or named colors in CSS variables
2. **Use semantic tokens** - Never hardcode colors in components
3. **Follow CTA hierarchy** - Use correct button variant for each action type
4. **Consistent spacing** - Use spacing scale tokens, not arbitrary values
5. **Shadow semantics** - Match shadow size to component importance
6. **Gradient usage** - Only use predefined gradients, don't create custom ones

### Color Usage Priority

1. Use semantic tokens (`text-foreground`, `bg-primary`, etc.)
2. Use color scale (`primary-500`, `gray-600`, etc.)
3. Only in rare cases, use CSS variables directly (`hsl(var(--primary))`)
4. Never hardcode colors

### Accessibility

- **Contrast ratios**: All text must meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- **Focus states**: All interactive elements must have visible focus indicators
- **Color alone**: Never rely on color alone to convey information
- **Text on backgrounds**: Always use appropriate foreground colors for each background

---

## Implementation Checklist

When creating new components:

- [ ] Use semantic button variants (`hero`, `success`, `ai`, etc.)
- [ ] Use design system colors (no hardcoded values)
- [ ] Use spacing scale tokens
- [ ] Use border radius tokens
- [ ] Use shadow scale tokens
- [ ] Use typography scale tokens
- [ ] Use predefined gradients when needed
- [ ] Ensure proper contrast ratios
- [ ] Test in both light and dark modes
- [ ] Use HSL color format in CSS variables

---

## Quick Reference: Button Variant Decision Tree

```
Is it the main forward action? → `hero`
Is it a completion/publish action? → `success`
Is it an AI feature? → `ai`
Is it adding/requesting new content? → `secondary`
Is it uploading/selecting files? → `outline`
Is it going back/canceling? → `outline`
Is it a preview option? → `secondary`
Is it a dangerous action? → `destructive`
Is it a subtle inline action? → `ghost` or `link`
Otherwise → `default`
```

---

## Updates & Maintenance

This branding guide should be updated whenever:
- New button variants are added
- Color palette is expanded
- New semantic colors are introduced
- Typography scale changes
- Shadow or spacing scales are modified

Last Updated: 2025-01-26
