# Deployment Guide - Static Page Generation

This guide explains how to deploy the automatic static page generation for OpenGraph meta tags.

## 🎯 **Configuration Overview**

You're absolutely right about the environment variables! The configuration is designed to work out-of-the-box for both development and production without requiring additional environment variables.

### **Default Configuration (Recommended)**

- **Backend** → calls → **http://localhost:3002** (webhook server)
- **Webhook Server** → runs on → **port 3002**
- **No environment variables needed** ✅

This works because:
- In development: Both services run on localhost
- In production: Both services run on the same host (localhost from backend's perspective)

### **Only Override If Needed**

Set environment variables only if you have special requirements:

```bash
# Only if you have port conflicts
WEBHOOK_PORT=3003

# Only if webhook server runs on different host (rare)
STATIC_GENERATOR_WEBHOOK_URL=http://different-host:3002/regenerate-static
```

## 🚀 **Deployment Steps**

### **Development Setup**

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run start

# Terminal 3: Webhook Server
cd apps/frontend
npm run webhook:start

# Terminal 4: Initial static pages
npm run build:static
```

### **Production Deployment**

#### **Option 1: PM2 (Recommended)**

```bash
# 1. Build the frontend
cd apps/frontend
npm run build:static

# 2. Start backend with PM2
pm2 start ecosystem.config.js

# 3. Start webhook server with PM2
pm2 start static-generator/auto-generate-webhook.js --name "static-generator"

# 4. Serve static files (nginx/apache)
# Point your web server to serve from: apps/frontend/dist/frontend/
```

#### **Option 2: Docker (Recommended)**

```bash
# Build the Docker image
docker build -t os-blog:latest .

# Run with required environment variables
docker run -d \
  -p 80:80 \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e JWT_SECRET=your_jwt_secret_32_chars_min \
  -e BASE_URL=https://yourdomain.com \
  --name os-blog \
  os-blog:latest
```

**Docker Features:**
- ✅ **Automatic static page generation** on startup for existing posts
- ✅ **Webhook server** starts automatically for real-time regeneration
- ✅ **Nginx configuration** optimized for serving static blog pages with meta tags
- ✅ **PostgreSQL included** - no external database needed
- ✅ **Production ready** with proper error handling and monitoring

**Environment Variables:**
- `POSTGRES_PASSWORD` (required) - Database password
- `JWT_SECRET` (required) - JWT signing secret (min 32 characters)
- `BASE_URL` (important for production) - Your domain for meta tags and image URLs (default: http://localhost)

**⚠️ Important**: Set `BASE_URL` to your actual domain in production to ensure:
- OpenGraph meta tags have correct URLs for social media sharing
- Featured images display properly in social media previews
- Example: `BASE_URL=https://yourdomain.com`

#### **Option 3: Systemd Services**

```bash
# Create service files
sudo nano /etc/systemd/system/blog-webhook.service

[Unit]
Description=Blog Static Generator Webhook
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/your/apps/frontend
ExecStart=/usr/bin/node static-generator/auto-generate-webhook.js
Restart=always

[Install]
WantedBy=multi-user.target
```

## 📁 **File Structure After Deployment**

```
production-server/
├── backend/                 # Your NestJS backend
├── apps/frontend/
│   ├── dist/frontend/       # Built Angular app + static pages
│   │   ├── index.html       # Main Angular app
│   │   └── blog/            # Static pages with meta tags
│   │       ├── post-1/
│   │       │   └── index.html  # Static page with meta tags
│   │       └── post-2/
│   │           └── index.html  # Static page with meta tags
│   └── static-generator/         # Static page generation scripts
│       ├── auto-generate-webhook.js
│       ├── generate-static-pages.js
│       └── prerender-routes.js
```

## 🌐 **Web Server Configuration**

### **Nginx Configuration**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/apps/frontend/dist/frontend;

    # Serve static blog pages first (for social media crawlers)
    location ~* ^/blog/([^/]+)/?$ {
        try_files /blog/$1/index.html /index.html;
    }

    # Serve main Angular app for everything else
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API routes to backend
    location /api {
        proxy_pass http://localhost:3001;
    }
}
```

### **Apache Configuration**

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /path/to/apps/frontend/dist/frontend

    # Rewrite rules for static blog pages
    RewriteEngine On
    RewriteRule ^/blog/([^/]+)/?$ /blog/$1/index.html [L]
    RewriteRule ^(?!.*\.).*$ /index.html [L]

    # Proxy API requests
    ProxyPass /api http://localhost:3001/
</VirtualHost>
```

## 🔄 **How Automation Works**

1. **User publishes/updates post** in admin panel
2. **Backend automatically calls** → `http://localhost:3002/regenerate-static`
3. **Webhook server regenerates** static pages in background
4. **Social media crawlers** get updated meta tags immediately

## 🎛️ **Environment Variables (Optional)**

```bash
# Backend (.env)
NODE_ENV=production
DATABASE_URL=...
# No static generator variables needed!

# Frontend webhook server (.env - optional)
WEBHOOK_PORT=3002           # Only if you have port conflicts
API_URL=http://localhost:3001  # Only if API runs on different port
BASE_URL=https://yourdomain.com  # For production URLs in meta tags
```

## 🔍 **Testing the Deployment**

```bash
# 1. Test webhook health
curl http://localhost:3002/health

# 2. Test manual regeneration
curl -X POST http://localhost:3002/regenerate-static

# 3. Test static page
curl http://yourdomain.com/blog/your-post-slug/
# Should return HTML with OpenGraph meta tags

# 4. Test social media sharing
# Use Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
```

## 🚨 **Troubleshooting**

### **Webhook Server Not Starting**
- Check if port 3002 is available: `lsof -i :3002`
- Check logs: `pm2 logs static-generator`

### **Static Pages Not Updating**
- Check if webhook is reachable from backend
- Check backend logs for webhook calls
- Verify dist folder has write permissions

### **Meta Tags Not Showing**
- Verify static HTML files exist in `/blog/[slug]/index.html`
- Check if web server serves static files before Angular app
- Test with curl to ensure proper HTML is served

## 🎉 **Production Ready!**

Your configuration is optimized for deployment:
- ✅ **No environment variables required** for basic setup
- ✅ **Works on same host** (localhost communication)
- ✅ **Automatic regeneration** when posts change
- ✅ **SEO-friendly** static pages with proper meta tags
- ✅ **Social media ready** for Facebook, Twitter, LinkedIn sharing