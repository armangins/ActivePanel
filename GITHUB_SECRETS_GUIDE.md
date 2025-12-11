# 📝 Step-by-Step: Adding GitHub Secrets

## Current Location
You're in the **Settings** page of your GitHub repository. Perfect! ✅

## Next Steps

### 1. Navigate to Secrets
In the left sidebar menu you can see:
- Look for the **Security** section (scroll down if needed)
- Click on **Secrets and variables** (it has a dropdown arrow ▶)
- Click on **Actions** from the dropdown menu

### 2. Add Your First Secret
You'll see a page with a button **"New repository secret"** at the top right.

Click it and you'll see a form with two fields:
- **Name**: Enter the secret name
- **Secret**: Enter the secret value

### 3. Add These 5 Secrets (One at a Time)

#### Secret 1: FTP_SERVER
- **Name**: `FTP_SERVER`
- **Secret**: Your Hostinger FTP server address
  - Example: `ftp.yourdomain.com`
  - Or: `files.000webhost.com` (if using Hostinger's free hosting)
- Click **"Add secret"**

#### Secret 2: FTP_USERNAME
- Click **"New repository secret"** again
- **Name**: `FTP_USERNAME`
- **Secret**: Your Hostinger FTP username
  - Example: `username@yourdomain.com`
  - Or: `u123456789` (if using Hostinger's format)
- Click **"Add secret"**

#### Secret 3: FTP_PASSWORD
- Click **"New repository secret"** again
- **Name**: `FTP_PASSWORD`
- **Secret**: Your Hostinger FTP password
- Click **"Add secret"**

#### Secret 4: FTP_PORT
- Click **"New repository secret"** again
- **Name**: `FTP_PORT`
- **Secret**: `21` (for regular FTP) or `990` (for FTPS)
  - Try `21` first, if it doesn't work, try `990`
- Click **"Add secret"**

#### Secret 5: VITE_API_URL
- Click **"New repository secret"** again
- **Name**: `VITE_API_URL`
- **Secret**: Your backend API URL
  - Example: `https://api.yourdomain.com/api`
  - Or: `https://your-backend-domain.com/api`
  - **Important**: Replace with your actual backend URL!
- Click **"Add secret"**

### 4. Verify All Secrets Are Added
After adding all 5 secrets, you should see them listed on the Secrets page:
- ✅ FTP_SERVER
- ✅ FTP_USERNAME
- ✅ FTP_PASSWORD
- ✅ FTP_PORT
- ✅ VITE_API_URL

## 🎯 Quick Reference

**Where to find Hostinger FTP details:**
1. Log in to Hostinger (hpanel.hostinger.com)
2. Go to **Hosting** → **Manage**
3. Click **FTP Accounts**
4. You'll see all your FTP details there

**Common Hostinger FTP formats:**
- Server: `ftp.yourdomain.com` or `files.000webhost.com`
- Username: Usually `username@yourdomain.com` or `u123456789`
- Port: Usually `21` (FTP) or `990` (FTPS)

## ✅ Once All Secrets Are Added

You're ready to deploy! Go back to `START_HERE.md` and continue with Step 3 (Push to Main Branch).

---

**Need help finding your FTP details?** Check your Hostinger control panel or contact Hostinger support.
