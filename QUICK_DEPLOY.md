# Quick Deployment Guide

## 🚀 Fast Track to Deploy

### Step 1: Set Environment Variables
```bash
# Create production environment file
cp .env.production.example .env.production

# Edit .env.production and set your backend URL:
# VITE_API_URL=https://your-backend-domain.com/api
```

### Step 2: Build
```bash
npm run build:prod
# OR use the deploy script:
./deploy.sh
```

### Step 3: Upload to Hostinger
Upload **all contents** from the `build/` folder to your Hostinger `public_html/` directory.

### Step 4: Verify
- ✅ `.htaccess` file is in the root
- ✅ All files from `dist/` are uploaded
- ✅ Backend CORS allows your domain

## 📝 Important Notes

1. **Backend URL**: Make sure `VITE_API_URL` in `.env.production` points to your production backend
2. **CORS**: Configure your backend to allow requests from your frontend domain
3. **HTTPS**: Ensure your Hostinger domain uses HTTPS
4. **.htaccess**: This file enables React Router and optimizations - it's already in `public/` and will be copied to `build/`

## 🔍 Troubleshooting

**404 on refresh?** → Check `.htaccess` is uploaded  
**API errors?** → Check `VITE_API_URL` and CORS settings  
**Build fails?** → Run `npm install` first

For detailed instructions, see `DEPLOYMENT.md`
