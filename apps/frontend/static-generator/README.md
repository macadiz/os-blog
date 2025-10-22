# Static Page Generator

This directory contains the static page generation system for OpenGraph meta tags and social media sharing.

## 📁 Files

- **`generate-static-pages.js`** - Main script that generates static HTML pages with proper meta tags
- **`auto-generate-webhook.js`** - Webhook server that listens for automatic regeneration triggers
- **`prerender-routes.js`** - Route discovery script that fetches blog posts from API

## 🚀 Usage

### Development

```bash
# Start webhook server for automatic regeneration
npm run webhook:start

# Generate static pages manually
npm run generate-static

# Build app and generate static pages
npm run build:static
```

### Testing & Verification

After making changes or deploying, you can test the static page generation:

```bash
# On Linux/macOS
cd apps/frontend/test/static-page-generator
./test-static-gen.sh

# On Windows
cd apps\frontend\test\static-page-generator
.\test-static-gen.ps1
```

This will:
1. Check your configuration
2. Generate static pages
3. Display sample OpenGraph tags
4. Show links to validation tools

### How It Works

1. **Route Discovery**: `prerender-routes.js` fetches all published blog posts from your API
2. **Static Generation**: `generate-static-pages.js` creates HTML files with proper OpenGraph and Twitter Card meta tags
3. **Automatic Updates**: `auto-generate-webhook.js` runs a webhook server that regenerates pages when posts are updated

### Generated Structure

```
dist/frontend/
├── index.html              # Main Angular app
└── blog/                   # Static pages with meta tags
    ├── post-slug-1/
    │   └── index.html       # Static HTML with meta tags
    └── post-slug-2/
        └── index.html       # Static HTML with meta tags
```

## 🔧 Configuration

### Environment Variables

Configuration is handled via environment variables. The scripts automatically load variables from `static-generator/.env`:

- `WEBHOOK_PORT` - Port for webhook server (default: 3002)
- `API_URL` - Backend API URL (default: http://localhost:3001)
- `BASE_URL` - Base URL for meta tags (default: http://localhost:4200)
- `DIST_DIR` - Directory containing built frontend files (default: ./dist/frontend)

### Setup

1. **Copy the example configuration:**
   ```bash
   cp static-generator/.env.example static-generator/.env
   ```

2. **Edit the configuration for your environment:**
   ```bash
   # Development (these are the defaults)
   WEBHOOK_PORT=3002
   API_URL="http://localhost:3001"
   BASE_URL="http://localhost:4200"

   # Production example
   WEBHOOK_PORT=3002
   API_URL="http://localhost:3001"
   BASE_URL="https://yourdomain.com"
   ```

### Default Behavior

If no `.env` file exists, the scripts use these defaults:
- Webhook runs on port 3002
- API calls go to http://localhost:3001
- Meta tags use http://localhost:4200 as base URL

## 🌐 Integration

The backend automatically triggers regeneration when:
- New posts are published
- Existing posts are updated
- Posts are deleted

This ensures social media crawlers always get the latest meta tags without manual intervention.

## 📊 Meta Tags Generated

Each static page includes:
- `<title>` with post title and blog name
- `<meta name="description">` with post excerpt
- OpenGraph tags (`og:title`, `og:description`, `og:image`, `og:url`, etc.)
- Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, etc.)

Perfect for sharing on Facebook, Twitter, LinkedIn, and other social platforms!

## 🔍 Troubleshooting

### OpenGraph Images Not Showing

If social media platforms can't see your featured images:

1. **Check BASE_URL is set correctly**
   - In production, BASE_URL must be your public domain (e.g., `https://yourdomain.com`)
   - In development, use `http://localhost:4200`
   - Edit `apps/frontend/static-generator/.env` to set this value

2. **Verify image URLs in generated HTML**
   ```bash
   # Check a generated file
   cat dist/frontend/blog/your-post-slug/index.html | grep "og:image"
   ```
   The URL should be: `https://yourdomain.com/api/files/blog_images/filename.jpg`

3. **Test the image URL directly**
   - Open the og:image URL in your browser
   - It should load the image correctly
   - If it returns 404, check your nginx/backend configuration

4. **Clear social media caches**
   - Facebook: https://developers.facebook.com/tools/debug/
   - Twitter: https://cards-dev.twitter.com/validator
   - LinkedIn: https://www.linkedin.com/post-inspector/

### Meta Tags Not Appearing

If OpenGraph tags are missing from generated pages:

1. **Check the frontend build exists**
   ```bash
   # Build must be done before generating static pages
   npm run build  # or ng build from apps/frontend
   ```

2. **Verify API is accessible**
   - The generator needs to fetch posts from your API
   - Check that API_URL in .env points to running backend

3. **Review generator logs**
   - Run with the test script to see detailed output
   - Look for errors or missing featured images

### Image URLs Structure

The system generates image URLs as follows:

- **Backend stores:** `/files/blog_images/abc123.jpg` (relative path in database)
- **Static generator creates:** `https://yourdomain.com/api/files/blog_images/abc123.jpg`
- **Nginx proxies:** `/api/*` → backend (strips `/api` prefix)
- **Backend receives:** `/files/blog_images/abc123.jpg`
- **Files controller serves:** File from disk via `GET /files/:category/:filename`

This architecture ensures images work correctly in both development and production.