# Overview

This is a full-stack Military Academy Management System built for the Hawaii National Guard Youth Challenge Academy. The system provides comprehensive management capabilities for cadets, staff, behavior tracking, physical fitness assessments, mentorship programs, career pathways, communications, and analytics reporting. It features a modern React frontend with TypeScript, a Node.js/Express backend, and PostgreSQL database with Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with dark mode support and custom color theming
- **State Management**: TanStack Query (React Query) for server state, React Context for authentication
- **Routing**: Wouter for client-side routing
- **Authentication**: JWT-based authentication with local storage persistence
- **Charts**: Chart.js with react-chartjs-2 for analytics visualization

## Backend Architecture
- **Framework**: Node.js with Express.js server
- **Database**: PostgreSQL with Neon serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT tokens with bcrypt password hashing
- **API Design**: RESTful API with middleware for authentication and error handling
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

## Database Design
The system uses a comprehensive relational schema with the following core entities:
- **Users**: Staff, administrators, instructors, mentors, and parents
- **Cadets**: Main entity with personal information, enrollment details, and status tracking
- **Behavior Incidents**: Disciplinary tracking with severity levels and follow-up requirements
- **Fitness Assessments**: Physical fitness tracking with scoring and improvement plans
- **Mentorships**: Mentor-cadet relationships with goal tracking and meeting schedules
- **Development Plans**: Career pathway planning with goals and milestone tracking
- **Academic Records**: Academic performance and achievement tracking
- **Communications**: Message system for announcements and notifications
- **Parent Guardians**: Family relationship management

## Key Architectural Decisions
- **Monorepo Structure**: Single repository with client, server, and shared code organization
- **Type Safety**: Full TypeScript implementation with shared schema validation using Zod
- **Real-time Updates**: TanStack Query for efficient data synchronization and caching
- **Security**: Role-based access control with JWT authentication and secure password handling
- **Responsive Design**: Mobile-first responsive design with dark mode support
- **Error Handling**: Comprehensive error boundaries and toast notifications for user feedback

# External Dependencies

## Core Technologies
- **@neondatabase/serverless**: Neon PostgreSQL serverless database driver
- **drizzle-orm**: Type-safe ORM for PostgreSQL database operations
- **@tanstack/react-query**: Server state management and data synchronization
- **bcryptjs**: Password hashing and security
- **jsonwebtoken**: JWT token generation and verification

## UI and Styling
- **@radix-ui/react-***: Comprehensive UI component primitives (dialogs, forms, navigation, etc.)
- **tailwindcss**: Utility-first CSS framework with dark mode support
- **class-variance-authority**: Type-safe styling variants
- **lucide-react**: Icon library for consistent iconography
- **chart.js + react-chartjs-2**: Data visualization and analytics charts

## Development Tools
- **vite**: Fast development server and build tool
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Development debugging tools
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast bundling for production builds

## Form Management
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Schema validation and type safety

## Session and Storage
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **ws**: WebSocket support for real-time database connections