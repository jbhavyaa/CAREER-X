# Mody University Placement Portal

## Overview

The Mody University Placement Portal is a full-stack web application designed to manage placement activities for Mody University of Science and Technology. The system supports two distinct user roles: Students and Admins. Students can browse job opportunities, apply to positions they're eligible for, share interview experiences, view company presentations, and manage their profiles. Admins can post and manage job listings, moderate forum content, upload company presentations, manage the placement calendar, and analyze placement statistics through visual charts.

The portal implements role-based access control with JWT authentication, ensuring secure separation of student and admin functionalities. The system automatically calculates job eligibility based on student profiles (CGPA, branch, course) and provides a comprehensive dashboard experience tailored to each user type.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for type safety
- Vite as the build tool and development server
- React Router (Wouter) for client-side routing
- TanStack Query for server state management and data fetching
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom design system

**Design System:**
- Material Design principles adapted for institutional branding
- Royal Blue primary color with Gold accents
- Custom spacing units (2, 4, 6, 8, 12, 16, 24)
- Typography system using Inter/Roboto for body text and Poppins for navigation
- Responsive grid layouts: 3-column for dashboards, 2-column for job listings

**Component Organization:**
- Shared UI components in `client/src/components/ui/` (buttons, cards, forms, dialogs, etc.)
- Layout components (Navbar, Sidebar, AuthLayout) for consistent structure
- Role-specific page components in `client/src/pages/student/` and `client/src/pages/admin/`
- Preloader component with university branding

**State Management Approach:**
- Server state managed via TanStack Query with automatic caching and refetching
- Authentication state centralized in AuthContext
- Local component state using React hooks (useState, useEffect)
- Form state managed with React Hook Form and Zod validation

**Routing Strategy:**
- Role-based route protection using authentication context
- Separate route hierarchies for students (`/jobs`, `/forums`, etc.) and admins (`/admin/jobs`, `/admin/forums`, etc.)
- Redirect logic based on user role after authentication
- 404 handling for undefined routes

### Backend Architecture

**Technology Stack:**
- Express.js as the web server framework
- TypeScript for type-safe server code
- Drizzle ORM for database interactions
- PostgreSQL (Neon) as the database
- JWT for stateless authentication
- Bcrypt for password hashing
- Multer for file upload handling

**API Design:**
- RESTful API endpoints organized by resource type
- Authentication middleware (`authenticateToken`) for protected routes
- Role-based authorization middleware (`requireRole`) to restrict admin-only endpoints
- JSON request/response format
- Cookie-based JWT token storage

**Authentication Flow:**
1. User submits credentials with role selection (student/admin)
2. Server validates credentials and hashes password using bcrypt
3. JWT token generated containing userId and role
4. Token stored in HTTP-only cookie for security
5. Subsequent requests include token for authentication
6. Middleware verifies token and attaches user info to request object

**File Upload Strategy:**
- Resumes and PPT files stored in server-side `uploads/` directory
- Multer middleware handles file validation (PDF only, 10MB limit)
- Unique filenames generated using timestamp and random suffix
- Static file serving for uploaded documents with inline disposition

**Database Schema Design:**

*Users Table:*
- Stores core user authentication data (email, hashed password, name, role)
- UUID primary keys for security

*Student Profiles Table:*
- One-to-one relationship with users
- Contains academic details (CGPA, branch, course, roll number)
- Resume URL reference

*Jobs Table:*
- Posted by admin users
- Eligibility criteria stored as arrays (allowed branches, courses)
- Minimum CGPA requirement
- Application deadline

*Job Applications Table:*
- Junction table linking students to jobs
- Tracks application status and timestamp

*Forum Posts Table:*
- Student-created interview experiences
- Admin moderation capability

*PPTs Table:*
- Company presentation files with metadata
- Admin upload only

*Events Table:*
- Placement calendar events
- Admin-managed

*Placements Table:*
- Records of successful placements for analytics
- Company, student count, branch, year data

*Notifications Table:*
- Admin-to-student communication
- Broadcast messages visible on student dashboard

**Eligibility Calculation Logic:**
- Server-side filtering of jobs based on student profile
- CGPA comparison (student CGPA >= job minimum CGPA)
- Branch matching (student branch in job's allowed branches)
- Course matching (student course in job's allowed courses)
- Frontend displays only eligible opportunities

**Analytics Implementation:**
- Admin inputs placement data (company name, student count)
- System aggregates data by company, branch, and year
- Recharts library generates visualizations:
  - Bar chart: Company-wise placements
  - Pie chart: Branch-wise distribution
  - Line chart: Year-wise trends

### Data Storage Solutions

**PostgreSQL Database (Neon):**
- Hosted PostgreSQL instance via Neon serverless platform
- Connection pooling for performance
- WebSocket support for serverless environments
- DATABASE_URL environment variable for connection string

**Drizzle ORM:**
- Type-safe database queries with TypeScript
- Schema definitions in `shared/schema.ts`
- Migration management via `drizzle-kit`
- Zod integration for runtime validation

**File Storage:**
- Local filesystem storage in `uploads/` directory
- PDF files for resumes and presentations
- Organized by upload type (resume, ppt)
- Served via Express static middleware

### Authentication and Authorization

**JWT-based Authentication:**
- Secret key stored in SESSION_SECRET environment variable
- Tokens contain userId and role claims
- HTTP-only cookies prevent XSS attacks
- Token expiration and refresh not implemented (stateless design)

**Password Security:**
- Bcrypt hashing with salt rounds
- Passwords never stored in plaintext
- Comparison done via bcrypt.compare()

**Authorization Middleware:**
- `authenticateToken`: Verifies JWT and attaches user info to request
- `requireRole(role)`: Restricts endpoints to specific roles (student/admin)
- Chained middleware for layered security

**Role Separation:**
- Students: Read access to jobs/PPTs, write access to applications/forums/profile
- Admins: Full CRUD on jobs/PPTs/events, moderation on forums, read-only on applications

### External Dependencies

**UI Component Libraries:**
- Radix UI primitives for accessible components (dialogs, dropdowns, menus, etc.)
- Shadcn/ui as component collection built on Radix
- Lucide React for icons
- React Day Picker for calendar component
- Recharts for data visualization

**Form Handling:**
- React Hook Form for form state management
- Zod for schema validation
- @hookform/resolvers for Zod integration

**Development Tools:**
- Vite plugins for development experience (@replit/vite-plugin-runtime-error-modal, @replit/vite-plugin-cartographer)
- TypeScript compiler for type checking
- ESBuild for production bundling

**Database & ORM:**
- @neondatabase/serverless for Neon PostgreSQL client
- Drizzle ORM and Drizzle Kit for schema management
- ws package for WebSocket support in serverless environment

**Utilities:**
- class-variance-authority for component variant management
- clsx and tailwind-merge for className composition
- nanoid for unique ID generation
- cookie-parser for cookie handling in Express

**Third-Party Services:**
- Neon Database (serverless PostgreSQL hosting)
- Google Fonts (Inter, Roboto, Poppins fonts)
