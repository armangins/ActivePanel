#!/bin/bash

# Deployment script for Hostinger
# This script builds the production bundle and provides deployment instructions

echo "🚀 Starting deployment preparation..."
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️  Warning: .env.production not found!"
    echo "📝 Creating .env.production from template..."
    cp .env.production.example .env.production
    echo "✅ Created .env.production"
    echo "⚠️  IMPORTANT: Edit .env.production and set your VITE_API_URL before building!"
    echo ""
    read -p "Press Enter to continue after setting VITE_API_URL, or Ctrl+C to cancel..."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Build the production bundle
echo "🔨 Building production bundle..."
npm run build:prod

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Upload all contents from the 'build' folder to Hostinger's public_html"
    echo "2. Make sure .htaccess file is in the root directory"
    echo "3. Verify VITE_API_URL in .env.production matches your backend URL"
    echo "4. Test your site at https://your-domain.com"
    echo ""
echo "📁 Files to upload:"
echo "   - All files from: $(pwd)/build/"
echo ""
echo "🔍 Build output location: $(pwd)/build/"
else
    echo ""
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
