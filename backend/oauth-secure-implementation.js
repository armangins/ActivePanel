/**
 * Secure OAuth Implementation - Backend
 * 
 * This file provides a secure implementation for OAuth token handling
 * that eliminates token exposure in URLs.
 * 
 * Framework: Node.js with Express
 * OAuth Provider: Google OAuth 2.0
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const router = express.Router();

// Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const REDIRECT_URI = `${process.env.API_URL || 'http://localhost:3001'}/api/auth/google/callback`;

/**
 * OPTION 1: POST Request with Token in Body (Recommended)
 * 
 * This approach uses POST requests to pass tokens, eliminating URL exposure.
 */

/**
 * Step 1: Initiate Google OAuth
 * Redirects user to Google with OAuth parameters
 */
router.get('/auth/google', (req, res) => {
  const state = generateSecureState();
  
  // Store state in session for CSRF protection
  req.session.oauthState = state;
  
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  googleAuthUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'consent');
  
  res.redirect(googleAuthUrl.toString());
});

/**
 * Step 2: Handle Google OAuth Callback
 * Receives authorization code and exchanges it for tokens server-side
 * Then redirects to frontend WITHOUT token in URL
 */
router.get('/auth/google/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    // Validate state (CSRF protection)
    if (!state || state !== req.session.oauthState) {
      return res.redirect(`${FRONTEND_URL}/login?error=invalid_state`);
    }
    
    // Clear state from session
    delete req.session.oauthState;
    
    if (error) {
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(error)}`);
    }
    
    if (!code) {
      return res.redirect(`${FRONTEND_URL}/login?error=no_authorization_code`);
    }
    
    // Exchange authorization code for tokens (server-side)
    const tokenResponse = await exchangeCodeForTokens(code);
    
    if (!tokenResponse.access_token) {
      return res.redirect(`${FRONTEND_URL}/login?error=token_exchange_failed`);
    }
    
    // Verify and decode the ID token to get user info
    const userInfo = await verifyGoogleToken(tokenResponse.id_token);
    
    // Create or find user in database
    const user = await findOrCreateUser(userInfo);
    
    // Generate JWT access token
    const accessToken = generateAccessToken(user);
    
    // Generate refresh token
    const refreshToken = generateRefreshToken(user);
    
    // OPTION 1A: Store tokens in httpOnly cookies (MOST SECURE)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/api/auth'
    });
    
    // Redirect to frontend with token in POST body
    // Frontend will receive POST request with token
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Redirecting...</title>
      </head>
      <body>
        <p>Redirecting...</p>
        <form id="token-form" method="POST" action="${FRONTEND_URL}/oauth/callback">
          <input type="hidden" name="access_token" value="${accessToken}">
          <input type="hidden" name="user" value='${JSON.stringify(user)}'>
        </form>
        <script>
          // Auto-submit form to send token via POST
          document.getElementById('token-form').submit();
        </script>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
  }
});

/**
 * OPTION 1B: Alternative - Use Session Storage
 * Store token in server session and redirect to frontend
 * Frontend makes API call to retrieve token from session
 */
router.get('/auth/google/callback-session', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    // Validate state
    if (!state || state !== req.session.oauthState) {
      return res.redirect(`${FRONTEND_URL}/login?error=invalid_state`);
    }
    
    delete req.session.oauthState;
    
    if (error || !code) {
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(error || 'no_code')}`);
    }
    
    // Exchange code for tokens
    const tokenResponse = await exchangeCodeForTokens(code);
    const userInfo = await verifyGoogleToken(tokenResponse.id_token);
    const user = await findOrCreateUser(userInfo);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Store tokens in session
    req.session.accessToken = accessToken;
    req.session.refreshToken = refreshToken;
    req.session.userId = user.id;
    
    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/api/auth'
    });
    
    // Redirect to frontend (no token in URL)
    res.redirect(`${FRONTEND_URL}/oauth/callback`);
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
  }
});

/**
 * Endpoint for frontend to retrieve token from session
 * Called after redirect to /oauth/callback
 */
router.post('/auth/oauth/verify', (req, res) => {
  try {
    if (!req.session.accessToken || !req.session.userId) {
      return res.status(401).json({ error: 'No active session' });
    }
    
    // Get user from database
    const user = getUserById(req.session.userId);
    
    // Return token and user data
    res.json({
      accessToken: req.session.accessToken,
      user: user
    });
    
    // Optionally clear from session (token is now in httpOnly cookie)
    // delete req.session.accessToken;
    
  } catch (error) {
    console.error('OAuth verify error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

/**
 * OPTION 2: httpOnly Cookies Only (MOST SECURE)
 * 
 * Store both access and refresh tokens in httpOnly cookies.
 * Frontend never sees tokens directly.
 */

router.get('/auth/google/callback-cookies', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    // Validate state
    if (!state || state !== req.session.oauthState) {
      return res.redirect(`${FRONTEND_URL}/login?error=invalid_state`);
    }
    
    delete req.session.oauthState;
    
    if (error || !code) {
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(error || 'no_code')}`);
    }
    
    // Exchange code for tokens
    const tokenResponse = await exchangeCodeForTokens(code);
    const userInfo = await verifyGoogleToken(tokenResponse.id_token);
    const user = await findOrCreateUser(userInfo);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Store both tokens in httpOnly cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/api/auth'
    });
    
    // Redirect to frontend (no token in URL)
    // Frontend will detect authenticated state via API call
    res.redirect(`${FRONTEND_URL}/oauth/callback`);
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
  }
});

/**
 * Helper Functions
 */

/**
 * Exchange authorization code for access and ID tokens
 */
async function exchangeCodeForTokens(code) {
  const response = await axios.post('https://oauth2.googleapis.com/token', {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code'
  });
  
  return response.data;
}

/**
 * Verify Google ID token and extract user info
 */
async function verifyGoogleToken(idToken) {
  try {
    // Verify token signature with Google's public keys
    const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`);
    return response.data;
  } catch (error) {
    // Alternative: Use Google's token verification library
    // const { OAuth2Client } = require('google-auth-library');
    // const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    // const ticket = await client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
    // return ticket.getPayload();
    throw new Error('Token verification failed');
  }
}

/**
 * Generate secure state for CSRF protection
 */
function generateSecureState() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate JWT access token
 */
function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      provider: 'google'
    },
    JWT_SECRET,
    {
      expiresIn: '15m', // 15 minutes
      issuer: 'your-app-name',
      audience: 'your-app-audience'
    }
  );
}

/**
 * Generate refresh token
 */
function generateRefreshToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      type: 'refresh'
    },
    JWT_SECRET,
    {
      expiresIn: '30d', // 30 days
      issuer: 'your-app-name'
    }
  );
}

/**
 * Find or create user in database
 */
async function findOrCreateUser(googleUserInfo) {
  // Implement your database logic here
  // Example:
  // let user = await User.findOne({ email: googleUserInfo.email });
  // if (!user) {
  //   user = await User.create({
  //     email: googleUserInfo.email,
  //     name: googleUserInfo.name,
  //     picture: googleUserInfo.picture,
  //     provider: 'google',
  //     providerId: googleUserInfo.sub
  //   });
  // }
  // return user;
  
  // Placeholder return
  return {
    id: googleUserInfo.sub,
    email: googleUserInfo.email,
    name: googleUserInfo.name,
    picture: googleUserInfo.picture,
    role: 'user',
    provider: 'google'
  };
}

/**
 * Get user by ID
 */
function getUserById(userId) {
  // Implement your database logic here
  // return User.findById(userId);
  
  // Placeholder return
  return {
    id: userId,
    email: 'user@example.com',
    name: 'User',
    role: 'user'
  };
}

/**
 * Middleware to verify JWT token from httpOnly cookie
 */
function verifyTokenFromCookie(req, res, next) {
  const token = req.cookies.accessToken;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'your-app-name',
      audience: 'your-app-audience'
    });
    
    req.user = decoded;
    next();
  } catch (error) {
    // Try to refresh token if expired
    if (error.name === 'TokenExpiredError') {
      return refreshTokenAndRetry(req, res, next);
    }
    
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Refresh token middleware
 */
async function refreshTokenAndRetry(req, res, next) {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }
  
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = getUserById(decoded.userId);
    const newAccessToken = generateAccessToken(user);
    
    // Set new access token in cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/'
    });
    
    req.user = { userId: user.id, email: user.email, role: user.role };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
}

module.exports = router;

