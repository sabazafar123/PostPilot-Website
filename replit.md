# PostPilot - Social Media Management SaaS

## Overview
PostPilot is a professional SaaS platform that helps users manage and schedule social media content across multiple platforms with AI-powered SEO content generation.

**Tagline**: "Plan Once. Post Everywhere."

## Tech Stack
- **Frontend**: React + Wouter (routing), Tailwind CSS, Shadcn UI components
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Neon-backed) via Drizzle ORM
- **Authentication**: Replit Auth (supports Google, GitHub, X, Apple, email/password)
- **AI**: OpenAI via Replit AI Integrations (GPT-4o-mini for SEO generation)
- **Payments**: Stripe (subscription payments in test mode)
- **File Storage**: Replit Object Storage (Google Cloud Storage)

## Features Implemented

### 1. Authentication
- **Replit Auth** integration with Google sign-in support
- Session management with PostgreSQL-backed sessions
- Protected routes and API endpoints
- Automatic token refresh

### 2. Dashboard
- **Social Account Connections**: Placeholder integrations for Facebook, Instagram, YouTube, TikTok, LinkedIn, X (Twitter)
- **Post Creation**:
  - Rich text content editor
  - Image/video upload with object storage
  - Date/time scheduling
  - Multi-platform selection
- **Post Management**:
  - Scheduled posts table (upcoming posts)
  - Past posts table (published history)
  - Real-time status tracking

### 3. SEO Assistant
- **AI-Powered Content Generation** using OpenAI:
  - SEO-optimized titles (60 chars max)
  - Compelling descriptions (160 chars max)
  - 10-15 relevant hashtags
  - Best posting time suggestions
- **Copy All** functionality for easy content export
- Beautiful gradient-themed result cards

### 4. Pricing Page
Three subscription tiers with Stripe integration:

**Free - "Takeoff"** ($0/forever)
- Schedule up to 5 posts/month
- Manage 1 social account
- Access to basic dashboard
- Limited AI SEO tools
- View past posts

**Pro - "Cruise Mode"** ($9.99/month or $99/year)
- Unlimited scheduling
- Up to 5 social accounts
- Full AI SEO tools
- Smart posting time suggestions
- Basic analytics dashboard
- Priority support

**Agency - "Full Control"** ($24.99/month or $249/year)
- Unlimited posts & uploads
- Manage up to 20 accounts
- Team collaboration (multi-user access)
- Advanced analytics + performance reports
- Custom branding & white-label option
- Dedicated support + onboarding help

### 5. Design System
- **Color Palette**: Gradient scheme with purple (270° 70% 60%), sky blue (200° 80% 65%), and pink (330° 75% 70%)
- **Typography**: Inter (body) + Plus Jakarta Sans (headings)
- **Dark/Light Mode**: Fully supported with theme toggle
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Component Library**: Shadcn UI with custom gradient styling
- **Animations**: Smooth transitions, hover states, and micro-interactions

## Database Schema

### users
- `id` (varchar, primary key) - From Replit Auth
- `email`, `firstName`, `lastName`, `profileImageUrl` - User profile data
- `subscriptionTier` - free, pro, or agency
- `stripeCustomerId`, `stripeSubscriptionId` - Stripe integration
- Timestamps: `createdAt`, `updatedAt`

### connectedAccounts
- `id` (varchar, primary key)
- `userId` (foreign key to users)
- `platform` - facebook, instagram, youtube, tiktok, linkedin, twitter
- `accountName` - Optional account identifier
- `isConnected` - Boolean status (placeholder for future API integration)
- Timestamp: `createdAt`

### posts
- `id` (varchar, primary key)
- `userId` (foreign key to users)
- `content` - Post text content
- `imageUrl` - URL to uploaded media (object storage)
- `platforms` - Array of selected platforms
- `scheduledFor` - Scheduled date/time
- `status` - scheduled, published, or failed
- Timestamps: `createdAt`, `publishedAt`

### sessions
- Required for Replit Auth session storage
- PostgreSQL-backed for reliability

## API Endpoints

### Authentication
- `GET /api/login` - Initiate Replit Auth flow
- `GET /api/callback` - OAuth callback handler
- `GET /api/logout` - End user session
- `GET /api/user` - Get current authenticated user

### Connected Accounts
- `GET /api/connected-accounts` - List user's connected accounts
- `POST /api/connected-accounts` - Add new platform connection

### Posts
- `GET /api/posts` - Get all posts for authenticated user
- `POST /api/posts` - Create new scheduled post

### SEO Generation
- `POST /api/seo-generate` - Generate AI-powered SEO content
  - Request: `{ topic: string }`
  - Response: `{ title, description, hashtags[], suggestedTime }`

### Payments
- `POST /api/create-checkout` - Create Stripe checkout session
  - Request: `{ planId: "pro" | "agency" }`
  - Response: `{ url: string }`

### Object Storage
- `POST /api/objects/upload` - Get presigned upload URL
- `GET /objects/:path` - Serve uploaded files (with ACL check)
- `PUT /api/post-images` - Set ACL policy after upload

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
- `SESSION_SECRET` - Express session secret (auto-configured)
- `REPLIT_DOMAINS` - Domains for auth callback (auto-configured)
- `STRIPE_SECRET_KEY` - Stripe secret key for payments
- `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key (frontend)
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API key via Replit AI Integrations
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI base URL

### Object Storage (auto-configured)
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID`
- `PUBLIC_OBJECT_SEARCH_PATHS`
- `PRIVATE_OBJECT_DIR`

## Running the Project

### Development
```bash
npm run dev
```
Server runs on port 5000 with hot reload.

### Database Migrations
```bash
npm run db:push
```
Pushes Drizzle schema changes to PostgreSQL.

### Type Checking
```bash
npm run check
```

### Production Build
```bash
npm run build
npm start
```

## Architecture Decisions

### State Management
- **TanStack Query v5** for server state management
- Query invalidation on mutations for real-time updates
- Loading and error states for all async operations

### File Uploads
- **Direct-to-storage uploads** using presigned URLs (Uppy + AWS S3 SDK)
- **ACL-based access control** for private user uploads
- Public visibility for post images (shareable across platforms)

### Authentication Flow
1. User clicks "Sign in with Replit"
2. Redirects to Replit OAuth (supports Google, GitHub, etc.)
3. Callback creates/updates user in database
4. Session stored in PostgreSQL for reliability
5. Protected routes check `isAuthenticated` middleware

### Responsive Design
- Mobile-first approach with Tailwind breakpoints
- Collapsible navigation for small screens
- Grid layouts adapt from 1 to 3 columns based on viewport

## Known Limitations & Future Enhancements

### Current Limitations
- Social media posting is placeholder-only (no actual API integrations)
- Post scheduling doesn't trigger actual publishing (requires background jobs)
- Analytics dashboard not yet implemented
- Team collaboration features not yet built

### Planned Enhancements
1. **Real Social Media APIs**: Integrate Facebook, Instagram, LinkedIn, Twitter APIs for actual posting
2. **Background Job System**: Implement scheduled post publishing with cron jobs or queues
3. **Analytics Dashboard**: Track engagement metrics, post performance, growth trends
4. **Team Features**: Multi-user workspaces, role-based permissions, collaboration tools
5. **Content Calendar**: Drag-and-drop calendar view for post scheduling
6. **Bulk Upload**: CSV import for batch post scheduling
7. **Media Library**: Centralized asset management for reusable images/videos

## User Preferences
- Clean, modern SaaS aesthetic with vibrant gradients
- Professional yet approachable design language
- Emphasis on visual polish and smooth interactions
- Mobile-responsive with consistent spacing and typography

## Recent Changes
- **Oct 16, 2024**: Initial MVP implementation
  - Complete authentication with Replit Auth + Google sign-in
  - Dashboard with post creation and management
  - AI-powered SEO assistant using OpenAI
  - Stripe payment integration for subscriptions
  - Object storage for image uploads
  - Dark/light mode theming
  - Fully responsive design system
