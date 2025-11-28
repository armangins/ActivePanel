# ActivePanel Backend API

Secure backend API for ActivePanel with authentication, CSRF protection, and rate limiting.

## Features

- ✅ JWT-based authentication with HTTP-only cookies
- ✅ Password hashing with bcrypt
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Security headers (Helmet)
- ✅ Input validation
- ✅ Google OAuth support

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

4. Update `.env` with your configuration:
- Set `JWT_SECRET` to the generated secret
- Set `CORS_ORIGIN` to your frontend URL
- Configure other settings as needed

## Running

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users

- `GET /api/users/me` - Get user profile
- `PUT /api/users/me` - Update user profile

### Settings

- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

## Security Features

1. **JWT Tokens**: Secure token-based authentication
2. **HTTP-Only Cookies**: Tokens stored in secure cookies
3. **Password Hashing**: bcrypt with salt rounds
4. **CSRF Protection**: Token-based CSRF protection
5. **Rate Limiting**: Prevents brute force attacks
6. **Security Headers**: Helmet.js for security headers
7. **Input Validation**: express-validator for input sanitization

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Set `COOKIE_SECURE=true` for HTTPS
3. Use a proper database (PostgreSQL, MongoDB, etc.)
4. Set up reverse proxy (Nginx)
5. Configure SSL/TLS certificates
6. Set up monitoring and logging

## Database

Currently uses file-based storage (`data/users.json`). For production, replace with:
- PostgreSQL
- MongoDB
- MySQL
- Or any other database

Update `models/User.js` to use your database.

