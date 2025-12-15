# Backend OAuth Secure Implementation

This directory contains secure OAuth implementation examples for the backend.

## Files

- `oauth-secure-implementation.js` - Complete implementation with multiple secure options

## Implementation Options

### Option 1: POST Request with Token in Body (Recommended)
- Backend redirects to frontend with POST form containing token
- Token never appears in URL
- Frontend receives token via POST body

### Option 2: Session Storage
- Backend stores token in server session
- Frontend makes API call to retrieve token
- Token never appears in URL

### Option 3: httpOnly Cookies (Most Secure)
- Both access and refresh tokens stored in httpOnly cookies
- Frontend never sees tokens directly
- Most secure option, but requires cookie-based authentication

## Setup Instructions

1. Install required dependencies:
```bash
npm install express jsonwebtoken axios cookie-parser express-session
```

2. Set environment variables:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
API_URL=http://localhost:3001
NODE_ENV=production
```

3. Configure Express app:
```javascript
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const oauthRoutes = require('./oauth-secure-implementation');

const app = express();

app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use('/api', oauthRoutes);
```

## Security Features

- ✅ CSRF protection with state parameter
- ✅ Token signature verification
- ✅ httpOnly cookies for token storage
- ✅ Secure cookie flags (Secure, SameSite)
- ✅ Token expiration validation
- ✅ Refresh token rotation support
- ✅ No tokens in URLs

## Frontend Integration

After implementing the backend, update the frontend `OAuthCallback.jsx` to handle POST requests:

```javascript
// If backend uses POST form submission
useEffect(() => {
  // Check if this is a POST request with token
  // Backend will auto-submit form, so we need to handle it
}, []);

// If backend uses session storage
useEffect(() => {
  const verifySession = async () => {
    const response = await fetch('/api/auth/oauth/verify', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (response.ok) {
      const { accessToken, user } = await response.json();
      await login(user, accessToken);
      setLoginCompleted(true);
    }
  };
  
  verifySession();
}, []);
```

## Migration Path

1. **Phase 1**: Implement POST request option (Option 1)
   - Update backend to use POST form submission
   - Update frontend to handle POST body
   - Test thoroughly

2. **Phase 2**: Move to httpOnly cookies (Option 3)
   - Update backend to use cookies only
   - Update frontend to use cookie-based auth
   - Remove token from client-side storage

3. **Phase 3**: Add token rotation
   - Implement refresh token rotation
   - Add token blacklist for revoked tokens
   - Add rate limiting

## Testing

Test each implementation option:
1. OAuth flow completes successfully
2. Token is not in URL at any point
3. Token is not in browser history
4. Token is properly stored (cookie/session)
5. Token refresh works correctly
6. Logout clears tokens properly

