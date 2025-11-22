# Design Guidelines: Mody University Placement Portal

## Design Approach
**System-Based Design** using Material Design principles adapted for institutional branding, emphasizing clarity, efficiency, and professional credibility suitable for an educational placement portal.

## Core Design Principles
- **Institutional Trust**: Professional, authoritative interface reflecting university standards
- **Role Clarity**: Distinct visual cues for Student vs Admin experiences
- **Data Priority**: Information-dense layouts with clear hierarchy and scannable content
- **Brand Consistency**: Royal Blue dominance with strategic Gold highlights

## Typography System
**Primary Font**: Inter or Roboto (Google Fonts)
- **Headings**: 
  - H1: 2rem (32px), font-weight 700
  - H2: 1.5rem (24px), font-weight 600
  - H3: 1.25rem (20px), font-weight 600
- **Body Text**: 0.875rem (14px), font-weight 400, line-height 1.6
- **Labels/Captions**: 0.75rem (12px), font-weight 500, uppercase tracking

**Secondary Font**: Poppins for navigation and accents
- Navbar & Sidebar: 0.875rem, font-weight 500

## Layout System
**Spacing Units**: Use Tailwind spacing of 2, 4, 6, 8, 12, 16, and 24 units consistently
- Component padding: p-6 to p-8
- Section spacing: mb-8 to mb-12
- Card spacing: gap-6 for grids

**Grid Structure**:
- Dashboard cards: 3-column grid on desktop (grid-cols-3), 1-column on mobile
- Job listings: 2-column grid (grid-cols-2), responsive to single column
- Analytics charts: 2-column layout for bar/pie, full-width for line chart

**Container**: max-w-7xl with px-6 for main content areas

## Component Library

### Preloader
Full-screen overlay with university campus image (semi-transparent Royal Blue overlay at 70% opacity), centered university logo/emblem, animated loading spinner in Gold, 2-second duration with fade-out transition.

### Navigation
**Top Navbar**: 
- Height: h-16
- Sticky positioning with subtle shadow
- Left: Full text "Mody University of Science and Technology – Placement Portal" (truncate responsively)
- Right: Profile avatar (circular, 40px) with dropdown menu showing name, role badge (Student/Admin in Gold), email, and logout button

**Left Sidebar**:
- Width: w-64 fixed on desktop, slide-in drawer on mobile
- Menu items with icons from Heroicons (left-aligned)
- Active state: Royal Blue background with Gold left border (4px)
- Hover: Soft background tint

### Dashboard Cards
**Stats Cards** (Home - Eligible Opportunities, Notifications):
- White background with soft shadow (shadow-md)
- Rounded corners (rounded-lg)
- Icon in Gold circle (top-left or centered)
- Large number display (2.5rem, font-weight 700, Royal Blue)
- Descriptive label below
- Padding: p-6

**Recent Activities Feed**:
- Timeline-style vertical layout
- Each item: Gold dot connector, timestamp (gray), activity text
- Alternating background tints for readability

### Job Listings
**Job Cards**:
- White cards with hover shadow transition (shadow-md to shadow-lg)
- Company logo placeholder (top-left, 60px circle)
- Job title (H3, Royal Blue)
- Eligibility badges (CGPA, Branch, Course) as small pills with Gold borders
- Apply button (Royal Blue background, white text) - disabled state for ineligible (gray)
- Posted date (small, muted text)

### Forums
**Post Cards**:
- White background, soft shadow
- Student name and avatar (top)
- Company name in Gold badge
- Experience text (max-height with "Read more" expansion)
- Timestamp and role indicator
- Admin: delete icon (hover: red)

### Calendar
**Event Display**:
- Monthly grid view with date cells
- Event indicators: Gold dots on dates with events
- Click to reveal: Modal with full event details (title, description, time)
- Add Event (Admin): Floating action button in Gold (bottom-right)

### Forms & Inputs
**Input Fields**:
- Border: 1px solid light gray, focus: Royal Blue border (2px)
- Padding: py-3 px-4
- Rounded: rounded-md
- Labels: Above input, font-weight 500, mb-2

**Buttons**:
- Primary: Royal Blue background, white text, px-6 py-3, rounded-md
- Secondary: White background, Royal Blue border and text
- Danger (Delete): Red background
- Disabled: Gray with 50% opacity

### File Upload Areas
**Resume/PPT Upload**:
- Dashed border box with upload icon (Heroicons: arrow-up-tray)
- Drag-and-drop zone with hover state (Royal Blue tint)
- File list display with download/delete actions
- Maximum 10MB indicator

### Analytics Charts (Admin)
**Chart Container**:
- White background card, shadow-lg, p-8
- Chart title (H2) with company input field inline
- Charts use Royal Blue as primary color, Gold for highlights
- Responsive height: h-80 for bar/pie, h-96 for line chart
- Recharts library with tooltip and legend

### Notifications Panel (Student Home)
**Notification Items**:
- Unread: Gold left border (4px), white background
- Read: Light gray background
- Icon (bell, info) in Royal Blue
- Title (font-weight 600) and message text
- Timestamp (muted, small)

## Images
**Preloader Image**: High-quality photograph of Mody University campus (main building or iconic view), 1920x1080px minimum, centered background-cover

**Dashboard Illustrations** (optional decorative): Isometric illustrations for empty states (no jobs yet, no forum posts) - can use Undraw or similar, tinted in Royal Blue/Gold

**Profile Avatars**: Circular placeholders with user initials on colored backgrounds (random from Royal Blue, Gold, teal palette)

## Animations & Transitions
- **Page Transitions**: Fade-in on route change (300ms)
- **Card Hovers**: Transform scale(1.02) + shadow transition (200ms)
- **Button Clicks**: Ripple effect or subtle scale(0.98)
- **Sidebar**: Slide-in/out (250ms ease-in-out)
- **Modals**: Fade + scale from 95% to 100% (200ms)

## Accessibility
- All interactive elements: min-height 44px (touch targets)
- Form inputs: associated labels, error states in red text with icons
- Focus indicators: Royal Blue outline (2px) on all focusable elements
- Color contrast: Ensure WCAG AA compliance for all text

## Responsive Breakpoints
- **Mobile**: < 768px - Single column, hamburger menu, stacked cards
- **Tablet**: 768px-1024px - 2-column grids, persistent sidebar (collapsible)
- **Desktop**: > 1024px - 3-column grids, fixed sidebar, full navigation