#!/bin/bash

echo "🧪 Testing Docker static page generation setup..."

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t os-blog:test . || {
    echo "❌ Docker build failed"
    exit 1
}

echo "✅ Docker image built successfully"

# Check if static-generator files are included
echo "🔍 Checking if static-generator files are included..."
docker run --rm os-blog:test ls -la /app/frontend/static-generator/ || {
    echo "❌ static-generator files not found in image"
    exit 1
}

echo "✅ static-generator files found in image"

# Check if node_modules for static-generator are included
echo "🔍 Checking if node_modules are included..."
docker run --rm os-blog:test ls -la /app/frontend/node_modules/ | head -10

echo "✅ Docker setup test completed successfully!"
echo ""
echo "To run the container:"
echo "docker run -d -p 80:80 -e POSTGRES_PASSWORD=your_password -e JWT_SECRET=your_jwt_secret_at_least_32_chars os-blog:test"