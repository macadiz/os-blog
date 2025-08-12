# CORS Configuration Guide

This document explains how to configure Cross-Origin Resource Sharing (CORS) for the OS Blog application.

## Overview

The application uses an environment-based CORS configuration system that provides:
- Secure defaults for different environments
- Flexible origin allowlisting
- Production safety checks
- Development convenience features

## Environment Variables

### `CORS_ORIGINS`
**Required in production**, optional in development.

Comma-separated list of allowed origins.

**Examples:**
```bash
# Development
CORS_ORIGINS="http://localhost:4200,http://localhost:3000"

# Production
CORS_ORIGINS="https://yourblog.com,https://www.yourblog.com"

# Development wildcard (NOT ALLOWED IN PRODUCTION)
CORS_ORIGINS="*"
```

### `CORS_ALLOW_CREDENTIALS`
**Default:** `true`

Whether to allow credentials (cookies, authorization headers) in CORS requests.

```bash
CORS_ALLOW_CREDENTIALS=true   # Allow credentials
CORS_ALLOW_CREDENTIALS=false  # Block credentials
```

### `CORS_MAX_AGE`
**Default:** `86400` (24 hours)

Maximum age for preflight cache in seconds.

```bash
CORS_MAX_AGE=86400  # 24 hours
CORS_MAX_AGE=3600   # 1 hour
```

## Configuration by Environment

### Development
- Allows common development ports by default
- Supports wildcard (`*`) for convenience
- Logs all CORS requests for debugging
- Less restrictive validation

**Default development origins:**
- `http://localhost:3000`
- `http://localhost:4200`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:4200`

### Production
- **Requires explicit origin configuration**
- **Blocks wildcard (`*`) completely**
- Warns about non-HTTPS origins
- Strict validation and error handling

## Security Features

### 1. Production Safety
- Prevents wildcard CORS in production
- Validates HTTPS usage in production
- Requires explicit origin configuration

### 2. Origin Validation
- Parses and validates environment variables
- Checks for common misconfigurations
- Provides clear error messages

### 3. Logging
- Logs configuration on startup
- Warns about suspicious requests
- Tracks non-allowed origins

## Setup Instructions

### 1. Development Setup

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

The default settings work for most development scenarios. Customize if needed:
```bash
CORS_ORIGINS="http://localhost:4200,http://localhost:3000"
CORS_ALLOW_CREDENTIALS=true
CORS_MAX_AGE=3600
```

### 2. Production Setup

1. Configure your environment variables (recommended) or update your `.env` file:
```bash
# Via environment variables (recommended for production)
export CORS_ORIGINS="https://yourblog.com,https://www.yourblog.com"
export CORS_ALLOW_CREDENTIALS=true
export CORS_MAX_AGE=86400

# Or via .env file (for development/testing)
CORS_ORIGINS="https://yourblog.com,https://www.yourblog.com"
CORS_ALLOW_CREDENTIALS=true
CORS_MAX_AGE=86400
```

3. Ensure HTTPS is used for all origins (except localhost)

## Troubleshooting

### Common Issues

#### 1. "CORS error" in browser
**Symptoms:** Browser console shows CORS errors
**Solution:** Check that your frontend URL is in `CORS_ORIGINS`

#### 2. "CORS wildcard not allowed in production"
**Symptoms:** Server fails to start
**Solution:** Replace `CORS_ORIGINS="*"` with explicit origins

#### 3. "CORS_ORIGINS required in production"
**Symptoms:** Server fails to start in production
**Solution:** Set the `CORS_ORIGINS` environment variable

#### 4. Credentials not working
**Symptoms:** Authentication headers not sent
**Solution:** Ensure `CORS_ALLOW_CREDENTIALS=true` and frontend sends credentials

### Debug Mode

To enable CORS request logging in development:
1. Set `NODE_ENV=development`
2. Check server logs for CORS request information

### Testing CORS

Use browser developer tools to check:
1. Network tab for preflight OPTIONS requests
2. Console for CORS error messages
3. Response headers for CORS configuration

## Best Practices

### 1. Environment-Specific Configuration
- Use environment variables for production deployments
- Use `.env` file for local development (copied from `.env.example`)
- Never commit production secrets to version control

### 2. Origin Management
- Use specific domains instead of wildcards
- Include both www and non-www versions if needed
- Use HTTPS in production

### 3. Security
- Keep `CORS_ALLOW_CREDENTIALS=true` only if needed
- Use appropriate `CORS_MAX_AGE` values
- Regularly audit allowed origins

### 4. Monitoring
- Monitor CORS-related errors in production
- Log and alert on requests from non-allowed origins
- Review CORS configuration during security audits

## Examples

### Simple Blog Setup
```bash
# Frontend on Vercel, backend on Railway
CORS_ORIGINS="https://myblog.vercel.app"
CORS_ALLOW_CREDENTIALS=true
CORS_MAX_AGE=86400
```

### Multi-Domain Setup
```bash
# Multiple domains and subdomains
CORS_ORIGINS="https://blog.example.com,https://www.blog.example.com,https://admin.blog.example.com"
CORS_ALLOW_CREDENTIALS=true
CORS_MAX_AGE=86400
```

### Development Team Setup
```bash
# Multiple development ports for team
CORS_ORIGINS="http://localhost:3000,http://localhost:4200,http://localhost:8080"
CORS_ALLOW_CREDENTIALS=true
CORS_MAX_AGE=3600
```
