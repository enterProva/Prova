# PPP - Pause, Prove & Protect

## Overview

PPP (Pause, Prove & Protect) is a full-stack web application designed to combat misinformation through interactive fact-checking and mindful content consumption. The application provides users with tools to verify link credibility, receive pause nudges before sharing content, and learn about media literacy through gamified educational content.

The project follows a modern full-stack architecture with a React frontend built using Vite and shadcn/ui components, an Express.js backend API, PostgreSQL database with Drizzle ORM, and Replit authentication for user management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack React Query for server state and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation schemas

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured route handlers
- **Request/Response**: JSON-based communication with comprehensive error handling
- **Middleware**: Custom logging, authentication, and CORS handling

### Database & ORM
- **Database**: PostgreSQL for reliable relational data storage
- **ORM**: Drizzle ORM with Drizzle Kit for type-safe database operations
- **Migrations**: Schema-first approach with automated migration generation
- **Connection**: Neon Database serverless PostgreSQL hosting

### Authentication System
- **Provider**: Replit OIDC authentication with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL session store
- **Security**: HTTP-only cookies, CSRF protection, and secure session handling
- **Authorization**: Role-based access with authenticated route protection

### Data Models
- **Users**: Profile management with statistics tracking (links checked, trust score, streaks)
- **Link Checks**: URL analysis with credibility scoring and fact-check results
- **Feed Posts**: Social sharing with community engagement features
- **Pause Nudges**: Mindfulness prompts with response tracking
- **Learning Progress**: Gamified educational content with progress tracking
- **Reports**: Content moderation and user reporting system

### Content Analysis Pipeline
- **URL Scraping**: Cheerio-based content extraction with metadata parsing
- **Fact Checking**: Multi-source verification using external fact-checking APIs
- **Credibility Scoring**: Algorithmic assessment of source reliability and bias detection
- **Real-time Analysis**: Immediate feedback on link credibility and bias ratings

### Development & Deployment
- **Development**: Hot module replacement with Vite development server
- **Production**: Static asset serving with Express.js backend
- **Build Process**: TypeScript compilation with esbuild for server bundling
- **Environment**: Replit-optimized with development banner and error overlays

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon Database
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect support
- **axios**: HTTP client for external API requests and web scraping

### Authentication
- **openid-client**: OpenID Connect client for Replit authentication
- **passport**: Authentication middleware with OpenID Connect strategy
- **express-session**: Session management with PostgreSQL store
- **connect-pg-simple**: PostgreSQL session store adapter

### UI & Design System
- **@radix-ui/***: Comprehensive component primitives for accessibility
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variant management
- **lucide-react**: Consistent icon library

### Development Tools
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form handling with validation
- **zod**: Runtime type validation and schema definition
- **cheerio**: Server-side HTML parsing for content scraping

### Replit Platform Integration
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit-specific development tools