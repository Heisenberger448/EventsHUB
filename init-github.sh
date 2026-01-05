#!/bin/bash

# 🚀 SharedCrowd Platform - GitHub Setup Script
echo "🚀 SharedCrowd Platform - GitHub Setup"
echo "======================================"

# Vraag gebruiker om GitHub username
echo ""
read -p "📝 Wat is je GitHub username? " GITHUB_USERNAME

# Vraag om repository naam (default: sharedcrowd-platform)
echo ""
read -p "📝 Repository naam [sharedcrowd-platform]: " REPO_NAME
REPO_NAME=${REPO_NAME:-sharedcrowd-platform}

# Controleer of git geïnstalleerd is
if ! command -v git &> /dev/null; then
    echo "❌ Git is niet geïnstalleerd. Installeer git eerst."
    exit 1
fi

# Controleer of we in de juiste directory zijn
if [ ! -f "package.json" ]; then
    echo "❌ Fout: Dit script moet uitgevoerd worden in de Applicatie directory"
    echo "   Gebruik: cd 'Applicatie' && ./init-github.sh"
    exit 1
fi

# Update .do/app.yaml met correcte GitHub repository
if [ -f ".do/app.yaml" ]; then
    echo "🔧 Updating DigitalOcean configuration..."
    sed -i.bak "s/jouw-github-username\/sharedcrowd-platform/${GITHUB_USERNAME}\/${REPO_NAME}/g" .do/app.yaml
    rm .do/app.yaml.bak
    echo "✅ Updated .do/app.yaml"
fi

# Initialize git repository
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "📝 Git repository already exists"
fi

# Add all files
echo "📦 Adding files to git..."
git add .

# Commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit - SharedCrowd Platform

- Next.js application with Prisma
- DigitalOcean deployment configuration
- GitHub Actions workflow
- Health check endpoint
- Database migration scripts" 2>/dev/null || echo "📝 No changes to commit or already committed"

# Add remote origin
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
echo "🔗 Adding remote origin: $REPO_URL"
git remote remove origin 2>/dev/null || true
git remote add origin $REPO_URL

# Set main branch
echo "🌿 Setting main branch..."
git branch -M main

echo ""
echo "🎉 Setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Create repository on GitHub: https://github.com/new"
echo "   - Repository name: $REPO_NAME"
echo "   - Keep it public or private (your choice)"
echo "   - DON'T initialize with README, .gitignore, or license"
echo ""
echo "2. Push your code:"
echo "   git push -u origin main"
echo ""
echo "3. Follow the deployment guide in DEPLOYMENT.md"
echo ""
echo "🔧 Repository URL: $REPO_URL"
echo "📖 Deployment guide: DEPLOYMENT.md"