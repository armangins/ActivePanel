# 🚀 Production Setup Guide

Complete step-by-step guide to set up ActivePanel with secure backend API.

## Quick Start

### 1. Backend Setup (5 minutes)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Edit .env and add:
# - JWT_SECRET (from above)
# - CORS_ORIGIN (your frontend URL)
# - COOKIE_SECURE=true (for HTTPS)

# Start backend
npm start
```

### 2. Frontend Setup (2 minutes)

```bash
# In root directory
# Create .env file
echo "VITE_API_URL=http://localhost:3001/api" > .env
echo "VITE_GOOGLE_CLIENT_ID=453875825131-i9sav6ub9525388acahj87um5mrp2g7l.apps.googleusercontent.com" >> .env

# Build frontend
npm run build
```

### 3. Test Locally

1. Start backend: `cd backend && npm start`
2. Start frontend: `npm run dev`
3. Visit: `http://localhost:3000`
4. Login with: `admin@mail.com` / `admin`

## Production Deployment

### Option 1: Same Server (Recommended for Small Scale)

**Backend:** `https://your-domain.com/api`  
**Frontend:** `https://your-domain.com`

### Option 2: Separate Servers

**Backend:** `https://api.your-domain.com`  
**Frontend:** `https://your-domain.com`

## Security Checklist

- [x] Backend API created with JWT authentication
- [x] Password hashing with bcrypt
- [x] CSRF protection implemented
- [x] Rate limiting enabled
- [x] Security headers configured
- [x] HTTP-only cookies for tokens
- [ ] SSL certificate installed
- [ ] Environment variables secured
- [ ] Database configured (optional)
- [ ] Monitoring set up

## Next Steps

1. **Deploy Backend**: Follow `DEPLOYMENT.md`
2. **Configure Nginx**: See `DEPLOYMENT.md` for Nginx config
3. **Set Up SSL**: Use Let's Encrypt
4. **Configure Google OAuth**: Update authorized origins
5. **Test Everything**: Verify all features work

## Files Created

### Backend
- `backend/server.js` - Main server file
- `backend/routes/auth.js` - Authentication routes
- `backend/routes/users.js` - User routes
- `backend/routes/settings.js` - Settings routes
- `backend/middleware/auth.js` - Authentication middleware
- `backend/middleware/csrf.js` - CSRF protection
- `backend/models/User.js` - User model with password hashing

### Frontend Updates
- `src/services/api.js` - New API client for backend
- Updated `src/contexts/AuthContext.jsx` - Uses backend API
- Updated `src/components/Auth/Login.jsx` - Uses backend API
- Updated `src/components/Auth/SignUp.jsx` - Uses backend API

### Documentation
- `DEPLOYMENT.md` - Complete deployment guide
- `PRODUCTION_SETUP.md` - This file
- `backend/README.md` - Backend documentation

## Switching Between Modes

### Demo Mode (localStorage)
- Don't set `VITE_API_URL` in `.env`
- Uses localStorage for authentication
- Good for development/testing

### Production Mode (Backend API)
- Set `VITE_API_URL=https://api.your-domain.com/api`
- Uses secure backend API
- JWT tokens in HTTP-only cookies
- Password hashing on backend

## Troubleshooting

### Backend won't start
- Check Node.js version: `node --version` (need 18+)
- Check port 3001 is available
- Verify `.env` file exists

### Frontend can't connect to backend
- Check `VITE_API_URL` in `.env`
- Verify backend is running
- Check CORS settings in backend

### Authentication not working
- Check JWT_SECRET is set
- Verify cookies are enabled
- Check browser console for errors

## Support

For detailed information:
- `DEPLOYMENT.md` - Full deployment guide
- `SECURITY_GUIDE.md` - Security best practices
- `backend/README.md` - Backend API documentation

