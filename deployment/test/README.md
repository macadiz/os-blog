# Deployment Tests

This directory contains test scripts for verifying deployment functionality.

## Directory Structure

```
deployment/test/
└── static-page-serving/
    └── test-nginx-static.sh    # Tests nginx static page serving
```

## Running Tests

### Static Page Serving Test

This test verifies that nginx correctly serves static HTML pages with OpenGraph meta tags for blog posts.

**Run inside the Docker container:**

```bash
# Exec into the running container
docker exec -it <container-name> /bin/sh

# Navigate to the test directory
cd /app/deployment/test/static-page-serving

# Run the test
sh test-nginx-static.sh
```

**What it tests:**
1. ✅ Blog directory exists with generated static pages
2. ✅ index.html files exist in post directories
3. ✅ OpenGraph tags are present in static HTML
4. ✅ Nginx serves the static pages (not the SPA)
5. ✅ X-Static-Page header is present (debugging)

**Expected output:**
- All tests should pass with ✅
- Sample OpenGraph tags should be displayed
- HTTP 200 OK response with X-Static-Page header

## Debugging

If tests fail, check:
- Nginx configuration: `nginx -t`
- Nginx error log: `tail -f /var/log/nginx/error.log`
- File permissions: `ls -la /app/frontend/dist/blog/`
- Generated static pages: `ls -la /app/frontend/dist/blog/[post-slug]/`
