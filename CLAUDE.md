# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Main Project (Root Level)
- `npm run dev` - Start both frontend (Angular) and backend (NestJS) in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run dev:backend` - Start only the NestJS backend in development mode
- `npm run dev:frontend` - Start only the Angular frontend in development mode

### Backend Development (apps/backend)
- `npm run start:dev` - Start backend with hot reload
- `npm run build` - Build backend for production
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run test` - Run Jest unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Apply database migrations
- `npm run prisma:studio` - Open Prisma Studio database GUI

### Frontend Development (apps/frontend)
- `npm run start` - Start Angular dev server (port 4200)
- `npm run build` - Build Angular app for production
- `npm run test` - Run Karma/Jasmine tests
- `npm run watch` - Build with watch mode

### Docker Development
- `./setup.sh` (Linux/macOS) or `./setup.ps1` (Windows) - Complete setup script
- `npm run docker:build` - Build Docker image for production
- `docker-compose up -d` - Start with Docker Compose

## Architecture Overview

### Project Structure
This is a **monorepo** with NestJS backend and Angular frontend:

```
apps/
├── backend/          # NestJS API server
│   ├── src/
│   │   ├── auth/     # Authentication module (JWT, guards, decorators)
│   │   ├── users/    # User management
│   │   ├── posts/    # Blog post management
│   │   ├── categories/ # Post categories
│   │   ├── tags/     # Post tags
│   │   ├── files/    # File upload handling
│   │   ├── setup/    # First-time setup wizard
│   │   └── rss/      # RSS feed generation
│   └── prisma/       # Database schema and migrations
└── frontend/         # Angular SPA
    └── src/app/
        ├── core/     # Guards, interceptors, services
        ├── features/ # Feature modules (admin, auth, blog)
        └── shared/   # Shared components
libs/shared-types/    # TypeScript types shared between frontend/backend
```

### Backend Architecture (NestJS)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport.js (local and JWT strategies)
- **Authorization**: Role-based access control (ADMIN, AUTHOR roles)
- **Guards**: Multiple guards for auth, roles, active users, and optional auth
- **File Uploads**: Multer with organized storage by category (profile pictures, blog images, settings)
- **API Documentation**: OpenAPI/Swagger (openapi.yaml)

### Frontend Architecture (Angular)
- **Framework**: Angular 19 with standalone components
- **Styling**: TailwindCSS
- **State Management**: Angular services with RxJS
- **Content Rendering**: Marked for Markdown, Prism.js for syntax highlighting
- **Guards**: Route guards for authentication, roles, and setup states
- **File Uploads**: Custom components for profile pictures and blog images

### Key Data Models (Prisma Schema)
- **User**: Authentication, roles (ADMIN/AUTHOR), profile management
- **Post**: Blog posts with rich content, SEO fields, categories, and tags
- **Category**: Post categorization with hierarchical support
- **Tag**: Post tagging system (many-to-many via PostTag)
- **BlogSettings**: Site configuration (title, theme, SEO settings)

### Authentication Flow
1. Local strategy for login (email/password)
2. JWT tokens for session management (7-day expiry by default)
3. Role-based guards protecting admin routes
4. Support for temporary passwords and forced password changes
5. User status management (active/inactive)

### File Management System
- Organized by categories: `profile_pictures`, `blog_images`, `settings`
- Size limits configurable via environment variables
- Static file serving through NestJS
- Upload validation and error handling

### Setup & Configuration
- Initial setup wizard for creating admin user and blog settings
- Environment-based configuration (.env files)
- Docker support with multi-stage builds
- CORS configuration for development and production
- HTTPS redirect middleware (configurable)

## Development Workflow

### Database Changes
1. Modify `apps/backend/prisma/schema.prisma`
2. Run `npm run prisma:migrate` to create and apply migration
3. Update shared types in `libs/shared-types/src/index.ts` if needed
4. Update backend DTOs and services as required
5. Update frontend interfaces and services accordingly

### Adding New Features
1. Backend: Create module with controller, service, and DTOs
2. Add necessary guards and validation
3. Update Prisma schema if database changes needed
4. Frontend: Create feature module with components and services
5. Add necessary guards and update routing
6. Update shared types library for any new interfaces

### Testing
- Backend has Jest unit tests and e2e tests
- Use Bruno collections in `/REST` folder for API testing
- Frontend uses Karma/Jasmine for unit tests