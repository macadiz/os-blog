# Open Blog - Backend API

A NestJS-based backend API for the Open Blog platform.

## Description

This is the backend API for Open Blog, built with [NestJS](https://github.com/nestjs/nest) framework and TypeScript. It provides authentication, blog post management, and administrative features.

## Features

- JWT-based authentication
- Blog post CRUD operations
- Category and tag management
- User management with role-based access
- PostgreSQL database with Prisma ORM
- Comprehensive API documentation (OpenAPI/Swagger)
- CORS configuration for production safety

## Environment Setup

1. **Copy the environment configuration:**
```bash
cp .env.example .env
```

2. **Configure your environment variables in `.env`:**
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens (change in production!)
- `NODE_ENV`: Environment (development/production)
- `CORS_ORIGINS`: Allowed frontend origins
- Other CORS and application settings

3. **Set up the database:**
```bash
# Run database migrations
npm run prisma:migrate

# (Optional) Seed the database
npm run prisma:db:seed
```

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Documentation

When running in development, visit:
- Swagger UI: `http://localhost:3001/api/docs`
- OpenAPI JSON: `http://localhost:3001/api/docs-json`

## Environment Variables

The application uses environment variables for configuration. Copy `.env.example` to `.env` and configure the values below:

| Variable | Required | Default | Description | Development Example | Production Example |
|----------|----------|---------|-------------|-------------------|-------------------|
| **Database Configuration** |
| `DATABASE_URL` | ✅ | - | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5434/open_blog?schema=public` | `postgresql://user:pass@prod-db:5432/open_blog?schema=public` |
| **JWT Authentication** |
| `JWT_SECRET` | ✅ | - | Secret key for signing JWT tokens (64+ chars recommended) | `your-super-secret-jwt-key-change-this-in-production` | Use a strong random string |
| `JWT_EXPIRES_IN` | ❌ | `7d` | Token expiration time | `7d`, `24h`, `60m` | `24h` (shorter for production) |
| **Application Settings** |
| `NODE_ENV` | ❌ | `development` | Runtime environment | `development` | `production` |
| `PORT` | ❌ | `3001` | Server port | `3001` | `3001` or container port |
| **CORS Configuration** |
| `CORS_ORIGINS` | ✅ | - | Comma-separated allowed origins | `http://localhost:4200,http://localhost:3000` | `https://yourdomain.com,https://www.yourdomain.com` |
| `CORS_ALLOW_CREDENTIALS` | ❌ | `true` | Allow credentials in CORS requests | `true` | `true` |
| `CORS_MAX_AGE` | ❌ | `86400` | Preflight cache time (seconds) | `3600` (1 hour) | `86400` (24 hours) |
| **Optional Production Settings** |
| `FORCE_HTTPS` | ❌ | `false` | Force HTTPS redirects | `false` | `true` |
| `TRUST_PROXY` | ❌ | `false` | Trust proxy headers (nginx, etc.) | `false` | `true` |
| `LOG_LEVEL` | ❌ | `info` | Logging level | `debug` | `info` or `warn` |

### Security Notes
- ⚠️ **Always change `JWT_SECRET` in production** - use a strong, unique secret
- ⚠️ **Never use wildcard (`*`) for `CORS_ORIGINS` in production** with credentials enabled
- ⚠️ **Use HTTPS** in production environments
- ⚠️ **Keep secrets out of version control** - use environment variables in production

**Production Deployment**: Use environment variables instead of `.env` files in production. The application will automatically detect and use system environment variables.

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Security Notes

- Always change `JWT_SECRET` in production
- Configure `CORS_ORIGINS` with your actual domain(s) 
- Never use wildcard (`*`) CORS origins in production with credentials
- Use HTTPS in production environments

## License

MIT licensed.
