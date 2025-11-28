# 🚀 Deployment Guide - ActivePanel

Complete guide for deploying ActivePanel with secure backend API.

## Architecture

```
Frontend (React) → Backend API (Node.js/Express) → WooCommerce API
```

## Prerequisites

- Node.js 18+ installed
- WooCommerce store with REST API enabled
- Domain name (for production)
- SSL certificate (for HTTPS)

## Step 1: Backend Setup

### 1.1 Install Backend Dependencies

```bash
cd backend
npm install
```

### 1.2 Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3001
NODE_ENV=production

# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-generated-secret-here

JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Your frontend URL
CORS_ORIGIN=https://your-domain.com

RATE_LIMIT_WINDOW_MS=15
RATE_LIMIT_MAX_REQUESTS=100

COOKIE_SECURE=true
COOKIE_SAME_SITE=strict

# Google OAuth
GOOGLE_CLIENT_ID=453875825131-i9sav6ub9525388acahj87um5mrp2g7l.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### 1.3 Test Backend

```bash
npm run dev
```

Visit: `http://localhost:3001/health`

## Step 2: Frontend Setup

### 2.1 Configure Environment Variables

Create `.env` in frontend root:

```env
VITE_API_URL=http://localhost:3001/api
VITE_GOOGLE_CLIENT_ID=453875825131-i9sav6ub9525388acahj87um5mrp2g7l.apps.googleusercontent.com
```

For production:

```env
VITE_API_URL=https://api.your-domain.com/api
VITE_GOOGLE_CLIENT_ID=453875825131-i9sav6ub9525388acahj87um5mrp2g7l.apps.googleusercontent.com
```

### 2.2 Update Frontend to Use Backend API

The frontend has been updated to use the backend API. Make sure `src/services/api.js` is configured correctly.

### 2.3 Build Frontend

```bash
npm run build
```

## Step 3: Server Configuration

### 3.1 Nginx Configuration

Create `/etc/nginx/sites-available/activepanel`:

```nginx
# Frontend
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;

    # Frontend
    root /var/www/activepanel/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/activepanel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3.2 PM2 Process Manager

Install PM2:

```bash
npm install -g pm2
```

Start backend:

```bash
cd backend
pm2 start server.js --name activepanel-api
pm2 save
pm2 startup
```

## Step 4: Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Security headers configured (Nginx + Helmet)
- [ ] JWT_SECRET is strong and unique
- [ ] COOKIE_SECURE=true in production
- [ ] CORS_ORIGIN set to your domain only
- [ ] Rate limiting enabled
- [ ] CSRF protection enabled
- [ ] Environment variables secured
- [ ] Database credentials secured
- [ ] Regular backups configured
- [ ] Monitoring and logging set up

## Step 5: Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Update authorized JavaScript origins:
   - `https://your-domain.com`
3. Update authorized redirect URIs:
   - `https://your-domain.com`
4. Save changes

## Step 6: Database (Optional)

For production, replace file-based storage with a database:

### PostgreSQL Example

```bash
# Install PostgreSQL
sudo apt-get install postgresql

# Create database
sudo -u postgres createdb activepanel

# Update backend/models/User.js to use PostgreSQL
```

### MongoDB Example

```bash
# Install MongoDB
sudo apt-get install mongodb

# Update backend/models/User.js to use MongoDB
```

## Step 7: Monitoring

### Health Check Endpoint

Backend provides `/health` endpoint for monitoring.

### PM2 Monitoring

```bash
pm2 monit
pm2 logs activepanel-api
```

## Troubleshooting

### CORS Errors

- Check `CORS_ORIGIN` in backend `.env`
- Verify frontend URL matches exactly

### Cookie Issues

- Ensure `COOKIE_SECURE=true` only with HTTPS
- Check `COOKIE_SAME_SITE` setting
- Verify domain configuration

### Authentication Issues

- Check JWT_SECRET is set
- Verify token expiration settings
- Check cookie settings

## Production Best Practices

1. **Use Environment Variables**: Never commit secrets
2. **Enable HTTPS**: Always use SSL/TLS
3. **Set Up Monitoring**: Use PM2, Sentry, or similar
4. **Regular Backups**: Backup database regularly
5. **Update Dependencies**: Keep packages updated
6. **Security Audits**: Regular security audits
7. **Rate Limiting**: Prevent abuse
8. **Logging**: Monitor errors and access logs

## Support

For issues or questions, check:
- `SECURITY_GUIDE.md` - Security best practices
- `SECURITY_AUDIT.md` - Security audit report
- `backend/README.md` - Backend documentation

