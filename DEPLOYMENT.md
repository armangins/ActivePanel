# Deployment Guide for Hostinger

This guide will help you deploy the React frontend to Hostinger hosting.

## 🚀 Automatic Deployment (CI/CD)

**Recommended**: The project is configured with GitHub Actions for automatic deployment. See `.github/workflows/README.md` for setup instructions.

When you push to the `main` branch, the workflow will:
1. Build your React app
2. Deploy it automatically to Hostinger via FTP

**Manual deployment instructions are below if you prefer to deploy manually.**

## Prerequisites

- Node.js 18+ installed locally
- Hostinger hosting account with FTP/SSH access
- Backend API URL ready

## Step 1: Prepare Environment Variables

1. Copy the example production environment file:
   ```bash
   cp .env.production.example .env.production
   ```

2. Edit `.env.production` and set your backend API URL:
   ```
   VITE_API_URL=https://your-backend-domain.com/api
   NODE_ENV=production
   ```

   **Important**: Replace `https://your-backend-domain.com/api` with your actual backend API URL.

## Step 2: Build the Production Bundle

1. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

2. Build the production bundle:
   ```bash
   npm run build
   ```

   This will create a `build` folder with optimized production files.

## Step 3: Upload to Hostinger

### Option A: Using FTP (FileZilla, WinSCP, etc.)

1. Connect to your Hostinger FTP account
2. Navigate to the `public_html` folder (or your domain's root folder)
3. Upload all contents from the `build` folder to `public_html`
4. Make sure the `.htaccess` file is uploaded (it's in the `public` folder and should be copied to `build`)

### Option B: Using Hostinger File Manager

1. Log in to your Hostinger control panel
2. Go to File Manager
3. Navigate to `public_html`
4. Upload all files from the `build` folder
5. Extract if uploaded as ZIP

### Option C: Using Git (if SSH access is available)

1. SSH into your Hostinger server
2. Clone your repository or pull latest changes
3. Run `npm install` and `npm run build`
4. Copy `build` contents to `public_html`

## Step 4: Verify .htaccess File

Ensure the `.htaccess` file is in your `public_html` root directory. This file:
- Enables client-side routing (React Router)
- Enables GZIP compression
- Sets up browser caching
- Adds security headers

If the `.htaccess` file is missing, copy it from `public/.htaccess` to your `public_html` root.

## Step 5: Configure Backend CORS

Make sure your backend allows requests from your frontend domain. Update your backend CORS configuration:

```javascript
// Example backend CORS config
const corsOptions = {
  origin: ['https://your-frontend-domain.com', 'https://www.your-frontend-domain.com'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

## Step 6: Test the Deployment

1. Visit your domain: `https://your-domain.com`
2. Check browser console for any errors
3. Test login and API connections
4. Verify all routes work correctly

## Troubleshooting

### Issue: 404 errors on page refresh
**Solution**: Ensure `.htaccess` file is in the root directory and mod_rewrite is enabled.

### Issue: API calls failing
**Solution**: 
- Check `VITE_API_URL` in `.env.production`
- Verify backend CORS settings
- Check browser console for CORS errors

### Issue: Assets not loading
**Solution**: 
- Verify all files from `build` folder are uploaded
- Check file permissions (should be 644 for files, 755 for directories)
- Clear browser cache

### Issue: Build fails
**Solution**:
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version: `node --version` (should be 18+)
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

## Build Optimization

The production build includes:
- ✅ Code minification
- ✅ Tree shaking (removed unused code)
- ✅ Code splitting (separate vendor chunks)
- ✅ Console.log removal
- ✅ Source map disabled (for security)
- ✅ Asset optimization

## File Structure After Build

```
build/
├── index.html
├── .htaccess
├── assets/
│   ├── js/
│   │   ├── index-[hash].js
│   │   ├── react-vendor-[hash].js
│   │   ├── ui-vendor-[hash].js
│   │   └── ...
│   ├── css/
│   │   └── index-[hash].css
│   └── [other assets]
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://api.yourdomain.com/api` |
| `NODE_ENV` | Environment mode | `production` |

## Security Checklist

- [ ] `.env.production` is not committed to Git
- [ ] `.htaccess` is uploaded and working
- [ ] HTTPS is enabled on Hostinger
- [ ] Backend CORS is configured correctly
- [ ] API keys are not exposed in frontend code
- [ ] Source maps are disabled in production

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Hostinger error logs
3. Verify all files are uploaded correctly
4. Test API connectivity separately

## Quick Deploy Script

Create a `deploy.sh` script for easier deployment:

```bash
#!/bin/bash
echo "Building production bundle..."
npm run build

echo "Build complete! Upload the 'build' folder contents to Hostinger."
echo "Don't forget to:"
echo "1. Set VITE_API_URL in .env.production"
echo "2. Upload .htaccess file"
echo "3. Configure backend CORS"
```

Make it executable: `chmod +x deploy.sh`
