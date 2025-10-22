#!/bin/bash

# Test script to verify nginx serves static blog pages correctly
# Run this inside the Docker container after deployment

echo "🧪 Testing Static Page Serving"
echo "==============================="
echo ""

# Test 1: Check if static blog directory exists
echo "📁 Test 1: Checking static blog directory..."
if [ -d "/app/frontend/dist/blog" ]; then
    echo "✅ Blog directory exists"
    echo "   Found posts:"
    ls -1 /app/frontend/dist/blog/ | head -5
    POST_COUNT=$(ls -1 /app/frontend/dist/blog/ | wc -l)
    echo "   Total: $POST_COUNT posts"
else
    echo "❌ Blog directory not found at /app/frontend/dist/blog"
    exit 1
fi

echo ""

# Test 2: Check if index.html exists in a post directory
echo "📄 Test 2: Checking for index.html in post directories..."
FIRST_POST=$(ls -1 /app/frontend/dist/blog/ | head -1)
if [ -n "$FIRST_POST" ]; then
    echo "   Checking: /app/frontend/dist/blog/$FIRST_POST/index.html"
    if [ -f "/app/frontend/dist/blog/$FIRST_POST/index.html" ]; then
        echo "✅ index.html exists"

        # Check for OpenGraph tags
        if grep -q "og:image" "/app/frontend/dist/blog/$FIRST_POST/index.html"; then
            echo "✅ OpenGraph tags found in static page"
        else
            echo "⚠️  OpenGraph tags NOT found in static page"
        fi
    else
        echo "❌ index.html NOT found"
    fi
else
    echo "⚠️  No posts found to test"
fi

echo ""

# Test 3: Test nginx response for static page
echo "🌐 Test 3: Testing nginx response..."
if [ -n "$FIRST_POST" ]; then
    echo "   Testing URL: http://localhost/blog/$FIRST_POST/"

    # Make request and capture headers
    RESPONSE=$(curl -s -I http://localhost/blog/$FIRST_POST/ 2>&1)

    if echo "$RESPONSE" | grep -q "200 OK"; then
        echo "✅ HTTP 200 OK response"

        # Check for X-Static-Page header
        if echo "$RESPONSE" | grep -q "X-Static-Page"; then
            echo "✅ X-Static-Page header present (static page served)"
        else
            echo "⚠️  X-Static-Page header missing (may be SPA instead)"
        fi
    else
        echo "⚠️  Non-200 response:"
        echo "$RESPONSE" | head -5
    fi

    # Test HTML content
    echo ""
    echo "📝 Checking HTML content..."
    HTML=$(curl -s http://localhost/blog/$FIRST_POST/)

    if echo "$HTML" | grep -q "og:image"; then
        echo "✅ OpenGraph tags in served HTML"
        echo "   Sample og:image tag:"
        echo "$HTML" | grep "og:image" | head -1 | sed 's/^/   /'
    else
        echo "❌ OpenGraph tags NOT in served HTML"
        echo "   This means static pages aren't being served properly"
    fi
fi

echo ""
echo "💡 Debugging tips:"
echo "   - Check nginx error log: tail -f /var/log/nginx/error.log"
echo "   - Test nginx config: nginx -t"
echo "   - Reload nginx: nginx -s reload"
echo "   - Check permissions: ls -la /app/frontend/dist/blog/"
