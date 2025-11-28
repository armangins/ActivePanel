# 🔐 Google Sign-In & Sign-Up Setup Guide

## Required Data/Configuration

To make Google Sign-In and Sign-Up fully functional, you need the following:

### 1. ✅ Google OAuth Client ID (Required)

**What you need:**
- A Google OAuth 2.0 Client ID from Google Cloud Console

**How to get it:**

1. **Go to Google Cloud Console:**
   - Visit [https://console.cloud.google.com/](https://console.cloud.google.com/)

2. **Create or Select a Project:**
   - Click "Select a project" → "New Project"
   - Enter project name (e.g., "ActivePanel")
   - Click "Create"

3. **Enable Google Identity Services API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Identity Services API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure OAuth consent screen first:
     - User Type: External (for public use)
     - App name: ActivePanel
     - User support email: your-email@example.com
     - Developer contact: your-email@example.com
     - Click "Save and Continue"
     - Scopes: Add `email`, `profile`, `openid`
     - Click "Save and Continue"
     - Test users: Add your email (optional for testing)
     - Click "Save and Continue"

5. **Create OAuth Client ID:**
   - Application type: **Web application**
   - Name: ActivePanel Web Client
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (for development)
     - `http://localhost:5173` (Vite default)
     - Your production URL: `https://your-domain.com`
   - **Authorized redirect URIs:**
     - `http://localhost:3000` (for development)
     - `http://localhost:5173` (Vite default)
     - Your production URL: `https://your-domain.com`
   - Click "Create"
   - **Copy the Client ID** (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)

6. **Add to your project:**
   - Create a `.env` file in the root directory:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```
   - Replace `your-client-id.apps.googleusercontent.com` with your actual Client ID

7. **Restart your dev server:**
   ```bash
   npm run dev
   ```

### 2. 📋 Current Implementation Status

**✅ What Works Now (Demo Mode):**
- Google Sign-In button appears
- Google Sign-Up button appears
- OAuth flow works
- User data is saved to `localStorage`
- Users can log in/out
- Email/password authentication works

**⚠️ Current Limitations:**
- User data stored in browser `localStorage` (not persistent across devices)
- No backend API integration
- No password hashing (passwords stored in plain text)
- No email verification
- No password reset functionality

### 3. 🚀 For Production (Recommended)

To make it production-ready, you'll need:

#### A. Backend API (Optional but Recommended)

**What you need:**
- A backend server (Node.js, Python, PHP, etc.)
- Database (PostgreSQL, MySQL, MongoDB, etc.)
- API endpoints for:
  - User registration
  - User login
  - Google OAuth verification
  - User profile management
  - Password reset

**Backend API Endpoints Needed:**
```
POST /api/auth/register          - Register new user
POST /api/auth/login             - Login with email/password
POST /api/auth/google            - Verify Google token & login/register
GET  /api/auth/verify            - Verify JWT token
POST /api/auth/refresh           - Refresh access token
POST /api/auth/logout            - Logout user
POST /api/auth/forgot-password   - Request password reset
POST /api/auth/reset-password    - Reset password
GET  /api/user/profile           - Get user profile
PUT  /api/user/profile           - Update user profile
```

#### B. Environment Variables (Production)

Create `.env.production`:
```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com

# Backend API (if using)
VITE_API_URL=https://api.your-domain.com

# WooCommerce (optional, can be set in Settings)
VITE_WOOCOMMERCE_URL=https://your-store.com
VITE_CONSUMER_KEY=ck_xxxxxxxxxxxxx
VITE_CONSUMER_SECRET=cs_xxxxxxxxxxxxx
```

#### C. Security Enhancements

1. **Password Hashing:**
   - Use bcrypt or Argon2 for password hashing
   - Never store plain text passwords

2. **JWT Tokens:**
   - Use JWT for session management
   - Implement refresh tokens
   - Set appropriate expiration times

3. **HTTPS:**
   - Always use HTTPS in production
   - Update Google OAuth authorized origins to HTTPS

4. **CORS Configuration:**
   - Configure CORS on your backend
   - Only allow your frontend domain

5. **Rate Limiting:**
   - Implement rate limiting on auth endpoints
   - Prevent brute force attacks

### 4. 📝 Minimum Requirements for Basic Functionality

**To get started immediately, you only need:**

1. ✅ **Google OAuth Client ID** (see step 1 above)
2. ✅ **`.env` file** with `VITE_GOOGLE_CLIENT_ID`

That's it! The app will work with localStorage for user storage.

### 5. 🔍 Testing Checklist

After setup, test:

- [ ] Google Sign-In button appears
- [ ] Google Sign-Up button appears
- [ ] Clicking Google button opens Google OAuth popup
- [ ] After authorizing, user is logged in
- [ ] User data appears in Header
- [ ] Logout works
- [ ] Email/password sign-up works
- [ ] Email/password sign-in works
- [ ] Navigation between login/signup pages works

### 6. 🐛 Troubleshooting

**Google Sign-In button doesn't appear:**
- Check if `VITE_GOOGLE_CLIENT_ID` is set in `.env`
- Restart dev server after adding `.env`
- Check browser console for errors
- Verify Google script loads: `https://accounts.google.com/gsi/client`

**"Error 400: redirect_uri_mismatch":**
- Check authorized redirect URIs in Google Cloud Console
- Make sure your current URL matches exactly (including http/https, port, trailing slash)

**"Error 403: access_denied":**
- Check OAuth consent screen configuration
- Verify test users are added (if app is in testing mode)
- Check if required scopes are added

**Users not persisting:**
- This is expected with localStorage (only persists in same browser)
- For production, implement backend API

### 7. 📚 Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

## Summary

**Minimum Required:**
- ✅ Google OAuth Client ID
- ✅ `.env` file with `VITE_GOOGLE_CLIENT_ID`

**For Production:**
- Backend API (recommended)
- Database
- Password hashing
- JWT tokens
- HTTPS
- Email verification (optional)
- Password reset (optional)

The app works immediately with just the Google Client ID, but for production use, consider implementing a backend API.

