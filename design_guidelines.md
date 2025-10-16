# PostPilot Design Guidelines

## Design Approach: User-Specified Brand Identity
**Primary Direction**: Following user's explicit design requirements - modern SaaS platform with vibrant gradient aesthetics combining purple, sky blue, and pink tones.

## Brand Identity
- **Name**: 🚀 PostPilot
- **Tagline**: "Simplify Your Socials" / "Plan Once. Post Everywhere."
- **Personality**: Modern, energetic, professional yet approachable, tech-forward

## Core Design Elements

### A. Color Palette

**Primary Gradient System**:
- Purple: 270 70% 60%
- Sky Blue: 200 80% 65%
- Pink: 330 75% 70%
- Apply as gradient backgrounds on hero sections and accent elements

**Functional Colors**:
- **Background (Light)**: 0 0% 100%
- **Background (Dark)**: 240 10% 10%
- **Surface (Light)**: 0 0% 98%
- **Surface (Dark)**: 240 8% 15%
- **Text Primary (Light)**: 240 10% 10%
- **Text Primary (Dark)**: 0 0% 95%
- **Success**: 142 71% 45%
- **Error**: 0 84% 60%
- **Warning**: 38 92% 50%

### B. Typography

**Font Families**:
- Primary: 'Inter' (Google Fonts) - UI, body text, navigation
- Headings: 'Plus Jakarta Sans' (Google Fonts) - hero text, section titles

**Scale**:
- Hero/H1: text-5xl to text-6xl, font-bold
- H2: text-3xl to text-4xl, font-semibold
- H3: text-2xl, font-semibold
- Body: text-base, font-normal
- Small: text-sm, font-normal
- Micro: text-xs, font-medium

### C. Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 8, 12, 16, 20, 24, 32
- Component padding: p-4, p-6, p-8
- Section spacing: py-12, py-16, py-24
- Card gaps: gap-4, gap-6, gap-8

**Grid System**:
- Dashboard cards: 2-3 column grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Pricing tiers: 3-column grid (grid-cols-1 md:grid-cols-3)
- Post tables: Full-width responsive tables
- Max container width: max-w-7xl

### D. Component Library

**Navigation**:
- Fixed top navigation bar with gradient background blur
- Links: Dashboard | SEO Tools | Pricing | Logout
- Logo placement: left, user avatar/logout: right
- Mobile: Hamburger menu

**Cards**:
- Rounded corners: rounded-xl to rounded-2xl
- Soft shadows: shadow-md to shadow-lg
- Smooth hover: transform hover:scale-105 transition-all duration-300
- Background: white (light mode) or dark surface (dark mode)

**Buttons**:
- Primary: Gradient background (purple-blue-pink), white text, rounded-lg
- Secondary: Border with gradient, transparent background, gradient text
- Sizes: px-6 py-3 (default), px-8 py-4 (large)
- All buttons: font-semibold with smooth hover transitions

**Forms**:
- Input fields: Bordered, rounded-lg, focus:ring-2 with gradient ring
- Text areas: Matching style, min-h-32 for post content
- Date/time pickers: Modern calendar UI with gradient accents
- File upload: Drag-and-drop zone with dashed border and gradient on hover

**Tables**:
- Striped rows with subtle gradient on hover
- Headers: Gradient background or bold text with bottom border
- Status badges: Rounded-full pills with color-coded backgrounds
- Responsive: Stack columns on mobile

**Pricing Cards**:
- Three distinct tiers with visual hierarchy
- Most popular (Pro): Slightly larger, gradient border, "Most Popular" badge
- Feature lists: Checkmark icons with gradient colors
- CTA buttons: Full-width, gradient backgrounds

**Toast Notifications**:
- Top-right positioning
- Gradient accent bar on left edge
- Icons for success/error/warning
- Smooth slide-in animation

### E. Page-Specific Layouts

**Login/Hero Page**:
- Full viewport height hero section with gradient background
- Center-aligned content with logo, tagline, and auth forms
- Subtle animated gradient background
- Glassmorphism card for login form (backdrop-blur)

**Dashboard**:
- Grid layout: Connect Accounts section (top), Create Post section (center-left), Tables (bottom)
- Social platform buttons: Icon + name, gradient border on hover
- Visual separation between scheduled and past posts

**SEO Assistant**:
- Single-column layout with max-w-3xl
- Input section: Large text area with gradient focus ring
- Results: Card-based display with copy buttons
- Hashtags: Pill-style badges with gradient backgrounds

**Pricing Page**:
- Hero section with "Choose Your Plan" heading
- 3-column grid of pricing tiers
- Annual/Monthly toggle switch with gradient slider
- Comparison table below cards (optional)

### F. Animations & Interactions

**Minimal & Purposeful**:
- Smooth transitions: transition-all duration-300
- Hover states: Slight scale (hover:scale-105) or shadow increase
- Page transitions: Fade in/out
- Avoid: Excessive animations, bouncing, spinning

**Focus States**:
- Gradient ring: ring-2 ring-offset-2 with purple-blue gradient

### G. Dark Mode Implementation

- Toggle switch in navigation (sun/moon icon)
- Consistent dark backgrounds across all components
- Maintain gradient accents in both modes
- Adjust text contrast appropriately
- Form inputs: Dark backgrounds with lighter borders

## Images

**Hero Section**: Large gradient background (generated via CSS) - NO photographic hero image needed
**Social Platform Icons**: Use Font Awesome or Heroicons for Facebook, Instagram, YouTube, TikTok, LinkedIn, X/Twitter
**Dashboard Illustrations**: Optional empty state illustrations for when no posts are scheduled
**Profile Avatars**: Circular placeholders for user profiles

## Critical Success Factors

✅ Consistent gradient application across all interactive elements
✅ Smooth, subtle animations that enhance rather than distract
✅ Clean, spacious layouts with generous whitespace
✅ Professional SaaS aesthetic with playful gradient personality
✅ Fully responsive at all breakpoints
✅ Accessible contrast ratios in both light and dark modes
✅ Polished, production-ready feel with attention to micro-interactions