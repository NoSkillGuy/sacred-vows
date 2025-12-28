# Landing Page Flow

**URL:** `/`

**Description:** The main landing page serves as the entry point for all users.

## Key Elements

### Navigation Bar
- Logo/Brand name: "Sacred Vow" (links to home)
- Navigation links: "Layout", "How It Work"
- Action buttons: "Start Free", "Sign In"
- Mobile menu toggle button

### Hero Section
- Tagline: "Digital Wedding Invitation"
- Main heading: "Your Love Story Deserve A Beautiful Beginning"
- Description text about creating personalized digital wedding invitations
- Primary CTA: "Start Creating Free →" (redirects to `/signup`)
- Secondary CTA: "View Layout" (scrolls to layouts section)
- Trust indicator: "Private links, no spam. Live preview before sharing."

### Layouts Showcase Section
- Category tabs: "All" and "Popular"
- Search bar: "Search layouts"
- Layout cards with:
  - Layout preview image
  - "Customize This Design" button (redirects to `/signup` if not authenticated)
  - "View Demo" button (opens preview modal)

### How It Works Section
- Step 1: "Choose Your Layout" - Browse and select design
- Step 2: "Customize Every Detail" - Add photos, edit text, choose colors
- Step 3: "Share With Guests" - Send invitations with a click

### Call-to-Action Section
- Heading: "Ready to Begin Your Forever?"
- Description text
- CTA button: "Create Your Invitation →"
- Trust indicator: "No spam. Private links, easy export, delete anytime."
- "Back to top" button

### Footer
- Social media links: Instagram, Pinterest, Facebook, Twitter
- Layout categories: All Layout, Traditional, Modern, Minimal, Floral
- Company links: About Us, Blog, Career, Press, Contact
- Support links: Help Center, FAQ, Pricing, Tutorial, API
- Legal links: Privacy Policy, Terms of Service, Cookie Policy
- Copyright notice

## User Actions

- Click "Start Free" or "Start Creating Free" → Redirects to signup page
- Click "Sign In" → Redirects to login page
- Click "Layout" link → Scrolls to layouts section (uses hash anchor `#layouts`)
- Click "View Demo" → Opens preview modal dialog
- Click "Customize This Design" → Redirects to signup page (if not authenticated)
- Click "Start with this layout" (in demo modal) → Redirects to signup page

## User Journey

1. User lands on homepage
2. User can explore the hero section and value proposition
3. User can scroll to see available layouts
4. User can browse and search layouts
5. User can view demos of layouts
6. User can initiate signup/login to start creating

