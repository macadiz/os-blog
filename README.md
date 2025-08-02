# Open Blog - Modern Blogging Platform

A full-stack blogging platform built with Angular 19, NestJS, and PostgreSQL/CockroachDB, featuring JWT authentication and a comprehensive admin setup wizard.

## 🚀 Features

- **Modern Tech Stack**: Angular 19 + NestJS + Prisma + PostgreSQL
- **Admin Setup Wizard**: Easy initial configuration for blog administrators
- **JWT Authentication**: Secure token-based authentication system  
- **Blog Management**: Create, edit, and publish blog posts with categories and tags
- **SEO Optimized**: Meta tags, slugs, and search-friendly URLs
- **Responsive Design**: Works on desktop and mobile devices
- **Rich Text Editor**: Full-featured content editing capabilities
- **Type Safety**: Shared TypeScript types between frontend and backend

## 📁 Project Structure

```
open-blog/
├── apps/
│   ├── backend/          # NestJS API server
│   │   ├── src/
│   │   │   ├── auth/     # Authentication module
│   │   │   ├── setup/    # Admin setup module
│   │   │   ├── posts/    # Blog posts module
│   │   │   ├── users/    # User management
│   │   │   └── prisma/   # Database service
│   │   └── prisma/       # Database schema & migrations
│   └── frontend/         # Angular 19 application
│       └── src/
│           ├── app/
│           │   ├── features/    # Feature modules
│           │   ├── core/        # Guards, interceptors
│           │   └── shared/      # Shared components
│           └── environments/
└── libs/
    └── shared-types/     # Shared TypeScript interfaces
```

## 🛠️ Prerequisites

- Node.js 18+ 
- PostgreSQL 12+ or CockroachDB
- npm or yarn

## ⚡ Quick Start

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd open-blog
npm install
```

2. **Set up the database**
```bash
# Copy environment file
cp apps/backend/.env.example apps/backend/.env

# Edit the DATABASE_URL in apps/backend/.env
# Example: postgresql://username:password@localhost:5432/open_blog

# Run database migrations
npm run prisma:migrate
```

3. **Start development servers**
```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:backend  # Backend on http://localhost:3001
npm run dev:frontend # Frontend on http://localhost:4200
```

4. **Complete setup**
- Visit http://localhost:4200
- Follow the setup wizard to create your admin account
- Start blogging! 🎉

## 📝 Available Scripts

```bash
# Development
npm run dev                 # Start both frontend and backend
npm run dev:backend        # Start NestJS backend only
npm run dev:frontend       # Start Angular frontend only

# Database
npm run prisma:migrate     # Run database migrations  
npm run prisma:generate    # Generate Prisma client
npm run prisma:studio      # Open Prisma Studio

# Build
npm run build              # Build all projects
```

## 🔧 Configuration

### Backend Environment Variables

Create `apps/backend/.env` with:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/open_blog?schema=public"

# JWT Configuration  
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Application
NODE_ENV="development"
PORT=3001

# Setup
ADMIN_SETUP_ENABLED=true
```

### Frontend Configuration

Update `apps/frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001'
};
```

## 🚀 Deployment

### Backend Deployment
1. Build the application: `npm run build --workspace=apps/backend`
2. Set production environment variables
3. Run migrations: `npm run prisma:migrate --workspace=apps/backend`
4. Start the server: `npm run start:prod --workspace=apps/backend`

### Frontend Deployment  
1. Build for production: `npm run build --workspace=apps/frontend`
2. Serve the `dist/frontend` folder with your web server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include error messages, browser/Node.js versions, and steps to reproduce

---

**Happy Blogging!** 📝✨
