# 🚀 Deployment Guide - Start Here!

This guide will walk you through deploying your React app to Hostinger.

## Choose Your Deployment Method

### Option 1: Automatic Deployment (Recommended) ⚡
Deploy automatically every time you push to GitHub - **Set it up once, deploy forever!**

### Option 2: Manual Deployment 📤
Deploy manually by building and uploading files yourself.

---

## 🎯 Option 1: Automatic Deployment (CI/CD)

### Step 1: Set Up GitHub Secrets

1. **You're already in the right place!** 
   - You're in the **Settings** page (you can see the menu on the left)
   - In the left sidebar, look for the **Security** section
   - Click on **Secrets and variables** (you'll see a dropdown arrow next to it)
   - Click on **Actions** from the dropdown
   - You'll see a button **"New repository secret"** - click it

2. **Add these 4 secrets** (one at a time):

   **Secret 1: FTP_SERVER**
   - Name: `FTP_SERVER`
   - Value: Your Hostinger FTP server (e.g., `ftp.yourdomain.com` or `files.000webhost.com`)
   - Click **Add secret**

   **Secret 2: FTP_USERNAME**
   - Name: `FTP_USERNAME`
   - Value: Your Hostinger FTP username
   - Click **Add secret**

   **Secret 3: FTP_PASSWORD**
   - Name: `FTP_PASSWORD`
   - Value: Your Hostinger FTP password
   - Click **Add secret**

   **Secret 4: FTP_PORT**
   - Name: `FTP_PORT`
   - Value: `21` (for FTP) or `990` (for FTPS)
   - Click **Add secret**

### Step 2: Set Production Environment Variable

You need to set your backend API URL for production builds. You have two options:

**Option A: Add as GitHub Secret (Recommended for CI/CD)**
1. Go to GitHub → Settings → Secrets → Actions
2. Add secret:
   - Name: `VITE_API_URL`
   - Value: `https://your-backend-domain.com/api` (replace with your actual backend URL)

Then update the workflow to use it (I'll help with this if needed).

**Option B: Create .env.production file locally**
1. Create `.env.production` file in your project root:
   ```bash
   VITE_API_URL=https://your-backend-domain.com/api
   NODE_ENV=production
   ```
2. Commit this file (it's safe - contains no secrets, just the API URL)

### Step 3: Push to Main Branch

```bash
# Make sure you're on main branch
git checkout main

# Add all changes
git add .

# Commit
git commit -m "Ready for deployment"

# Push to trigger automatic deployment
git push origin main
```

### Step 4: Monitor Deployment

1. Go to your GitHub repository
2. Click on the **Actions** tab
3. You'll see the workflow running
4. Wait for it to complete (usually 2-5 minutes)
5. Check the green checkmark ✅ when done

### Step 5: Verify Deployment

1. Visit your website: `https://your-domain.com`
2. Test the application
3. Check browser console for any errors

**That's it!** Every time you push to `main`, it will automatically deploy! 🎉

---

## 📤 Option 2: Manual Deployment

### Step 1: Set Environment Variables

1. Create `.env.production` file in your project root:
   ```bash
   VITE_API_URL=https://your-backend-domain.com/api
   NODE_ENV=production
   ```
   **Important**: Replace `https://your-backend-domain.com/api` with your actual backend API URL.

### Step 2: Build the Project

```bash
# Install dependencies (if not already done)
npm install

# Build for production
npm run build
```

This creates a `build/` folder with all production files.

### Step 3: Upload to Hostinger

**Using FTP Client (FileZilla, WinSCP, etc.):**

1. Connect to your Hostinger FTP:
   - Host: `ftp.yourdomain.com` (or your FTP server)
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: `21` or `990`

2. Navigate to `public_html` folder

3. Upload ALL contents from the `build/` folder:
   - Select all files in `build/` folder
   - Drag and drop to `public_html`
   - Make sure `.htaccess` is included

**Using Hostinger File Manager:**

1. Log in to Hostinger control panel
2. Go to **File Manager**
3. Navigate to `public_html`
4. Click **Upload**
5. Select all files from your `build/` folder
6. Wait for upload to complete

### Step 4: Verify Deployment

1. Visit your website: `https://your-domain.com`
2. Test the application
3. Check browser console for any errors

---

## 🔍 Finding Your Hostinger FTP Details

1. **Log in to Hostinger**
   - Go to hpanel.hostinger.com
   - Log in with your credentials

2. **Find FTP Details**
   - Go to **Hosting** → **Manage**
   - Click on **FTP Accounts** or **File Manager**
   - You'll see:
     - FTP Server/Host
     - FTP Username
     - FTP Password (or create a new FTP account)

3. **Find Your Domain**
   - Your domain is usually: `yourdomain.com`
   - Or check **Domains** section in Hostinger panel

---

## ⚠️ Important Notes

### Backend API URL
- Make sure your backend is deployed and accessible
- Update `VITE_API_URL` to point to your production backend
- Ensure backend CORS allows requests from your frontend domain

### .htaccess File
- The `.htaccess` file is automatically included in the `build/` folder
- It enables React Router (client-side routing)
- If you get 404 errors on page refresh, check that `.htaccess` is uploaded

### HTTPS
- Make sure your Hostinger domain uses HTTPS
- Update your backend CORS to allow HTTPS requests

---

## 🐛 Troubleshooting

### "404 Error" when refreshing pages
**Solution**: Make sure `.htaccess` file is in your `public_html` root directory

### "API calls failing" or "CORS errors"
**Solution**: 
- Check `VITE_API_URL` is set correctly
- Verify backend CORS allows your frontend domain
- Check browser console for specific error messages

### "Build fails" in GitHub Actions
**Solution**:
- Check the Actions tab for error details
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### "FTP deployment fails"
**Solution**:
- Double-check FTP credentials in GitHub Secrets
- Try changing `protocol: ftps` to `protocol: ftp` in `.github/workflows/deploy.yml`
- Verify FTP port (21 for FTP, 990 for FTPS)

---

## 📚 Need More Help?

- **Detailed CI/CD Setup**: See `CI_CD_SETUP.md`
- **Full Deployment Guide**: See `DEPLOYMENT.md`
- **Quick Reference**: See `QUICK_DEPLOY.md`

---

## ✅ Quick Checklist

Before deploying, make sure:

- [ ] Backend is deployed and accessible
- [ ] Backend CORS allows your frontend domain
- [ ] `VITE_API_URL` is set to your production backend
- [ ] FTP credentials are correct (for automatic deployment)
- [ ] GitHub Secrets are set (for automatic deployment)
- [ ] `.htaccess` file will be uploaded

---

**Ready to deploy?** Choose your method above and follow the steps! 🚀
