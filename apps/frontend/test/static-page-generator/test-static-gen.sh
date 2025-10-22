#!/bin/bash

# Test script for static page generation
# This script helps verify that OpenGraph tags are generated correctly

echo "🧪 Testing Static Page Generation"
echo "=================================="
echo ""

# Navigate to static-generator directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATIC_GEN_DIR="$SCRIPT_DIR/../../static-generator"
cd "$STATIC_GEN_DIR"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env and set BASE_URL to your production domain!"
    echo ""
fi

# Show current configuration
echo "📍 Current Configuration:"
if [ -f ".env" ]; then
    echo "   (from .env file)"
    grep -E "^(API_URL|BASE_URL|DIST_DIR)" .env || echo "   Using defaults"
else
    echo "   Using defaults from generate-static-pages.js"
fi
echo ""

# Run the generator
echo "🔨 Running static page generator..."
node generate-static-pages.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Generation completed successfully!"
    echo ""

    # Find and display a sample generated file
    SAMPLE_FILE=$(find ../../dist/frontend/blog -name "index.html" 2>/dev/null | head -n 1)

    if [ -n "$SAMPLE_FILE" ]; then
        echo "📄 Sample OpenGraph tags from: $SAMPLE_FILE"
        echo "---"
        grep -A 20 "<!-- OpenGraph tags -->" "$SAMPLE_FILE" | grep -E "(og:|twitter:)" || echo "⚠️  No OpenGraph tags found!"
        echo "---"
        echo ""
        echo "💡 To test OpenGraph tags:"
        echo "   1. Deploy your site or serve the dist folder"
        echo "   2. Use Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/"
        echo "   3. Use Twitter Card Validator: https://cards-dev.twitter.com/validator"
        echo "   4. Use LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/"
    else
        echo "⚠️  No generated files found in dist/frontend/blog/"
    fi
else
    echo ""
    echo "❌ Generation failed!"
    exit 1
fi
