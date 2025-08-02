<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Open Blog - Development Instructions

## Project Overview
This is a modern blogging platform built with:
- **Frontend**: Angular 19 with standalone components and modern routing
- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based with passport.js
- **Architecture**: Monorepo with shared types

## Key Features
- Admin setup wizard for initial configuration
- JWT-based authentication system
- Blog post management with categories and tags
- Rich text editing capabilities
- SEO-friendly URLs and metadata
- Responsive design

## Development Guidelines

### Backend (NestJS)
- Use Prisma for all database operations
- Implement proper DTOs with class-validator
- Follow NestJS module structure (controller, service, module)
- Use JWT guards for protected endpoints
- Implement proper error handling with HTTP exceptions

### Frontend (Angular)
- Use standalone components (Angular 19 style)
- Implement proper routing with guards
- Use reactive forms for user input
- Follow Angular best practices for services and dependency injection
- Use shared types from `libs/shared-types`
- All the styling must be done through tailwindcss v3
- All the angular components must be generated in their own directory with the template split from the code file
    - If the component is called navigation-bar. Then it should be in a directory called navigation-bar and within the directory there should be at least the navigation-bar.component.ts and navigation-bar.component.html

### Database
- Use Prisma migrations for schema changes
- Implement proper relationships between entities
- Use transactions for complex operations
- Follow naming conventions (snake_case for database, camelCase for TypeScript)

### Security
- Hash passwords with bcrypt
- Validate all inputs with class-validator
- Use proper JWT token handling
- Implement route guards for protected areas

### Shared Types
- Define all interfaces in `libs/shared-types`
- Export types from the main index file
- Keep DTOs and entities synchronized

## Setup Flow
1. Check if admin exists via `/setup/status`
2. If setup required, show setup wizard
3. Create admin and blog settings via `/setup/admin`
4. Redirect to login after successful setup

## Development Commands
- `npm run dev`: Run both frontend and backend
- `npm run dev:backend`: Run only backend
- `npm run dev:frontend`: Run only frontend
- `npm run prisma:migrate`: Run database migrations
- `npm run prisma:studio`: Open Prisma Studio

## Component paths
- Backend: `<rootDir>/apps/backend/`
- Frontend: `<rootDir>/apps/backend/`

## Component rules
- When executing any command, take in consideration the context of the component that impacts the execution and make sure that you are actually using the command at the right path
