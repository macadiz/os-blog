#!/bin/bash

# Build script for Open Blog
# Builds the frontend and backend, then creates a Docker image

set -e

echo "🏗️  Building Open Blog..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
mkdir -p dist/frontend dist/backend

# Build frontend
echo "⚛️  Building frontend..."
cd apps/frontend
npm run build
cp -r dist/frontend/* ../../dist/frontend/
cd ../..

# Build backend
echo "🚀 Building backend..."
cd apps/backend
npm run build
cp -r dist/* ../../dist/backend/
cp package*.json ../../dist/backend/
cp -r prisma ../../dist/backend/
cd ../..

# Copy shared types
echo "📦 Copying shared types..."
cp -r libs dist/ || true

echo "🐳 Building Docker image..."
docker build -t open-blog:latest .

echo "✅ Build complete!"
echo ""
echo "🚀 To run Open Blog:"
echo "   docker run -p 80:80 -e POSTGRES_PASSWORD=your_password open-blog:latest"
echo ""
echo "🌐 Access your blog at: http://localhost"
