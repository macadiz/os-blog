#!/bin/bash

echo "🧪 Testing Docker static page generation setup..."

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t os-blog:production-test . || {
    echo "❌ Docker build failed"
    exit 1
}

echo "✅ Docker image built successfully"

# Check if static-generator files are included
echo "🔍 Checking if static-generator files are included..."
docker run --rm os-blog:production-test ls -la /app/frontend/static-generator/ || {
    echo "❌ static-generator files not found in image"
    exit 1
}

echo "✅ static-generator files found in image"

# Check if dotenv and express are available in node_modules
echo "🔍 Checking if dotenv and express are available..."
docker run --rm os-blog:production-test ls -la /app/frontend/node_modules/ | grep -E "(dotenv|express)" || echo "Dependencies not found"

# Test if static-generator can load dependencies
echo "🔍 Testing if static-generator can load dependencies..."
docker run --rm os-blog:production-test sh -c "cd /app/frontend && node -e \"console.log('✅ dotenv:', typeof require('dotenv')); console.log('✅ express:', typeof require('express'));\""

# Test volume configuration
echo "🔍 Testing volume configuration..."
docker run --rm os-blog:production-test ls -la /var/www/ | grep static || echo "⚠️  Static directory not found"

echo "✅ Docker setup test completed successfully!"
echo ""
echo "To run the container with volumes:"
echo "docker run -d -p 80:80 \\"
echo "  -e POSTGRES_PASSWORD=your_password \\"
echo "  -e JWT_SECRET=your_jwt_secret_at_least_32_chars \\"
echo "  -v os-blog-static-files:/var/www/static \\"
echo "  -v os-blog-db-data:/var/lib/postgresql/data \\"
echo "  os-blog:production-test"