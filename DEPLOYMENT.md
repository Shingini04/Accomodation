# Deployment Guide

Complete guide for deploying the Accommodation Portal to production.

## Overview

- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Railway or Render
- **Database**: PostgreSQL on Railway/Render
- **Payments**: Razorpay (production keys)
- **Emails**: SendGrid

## Prerequisites

- GitHub account
- Vercel account
- Railway or Render account
- Razorpay account with live keys
- SendGrid account with verified sender

## Step 1: Database Setup

### Option A: Railway PostgreSQL

1. Go to [Railway](https://railway.app)
2. Create new project
3. Add PostgreSQL from the dashboard
4. Copy the connection string (DATABASE_URL)
5. Note down the credentials for later

### Option B: Render PostgreSQL

1. Go to [Render](https://render.com)
2. New → PostgreSQL
3. Choose free or paid tier
4. Copy the External Database URL
5. Note down the credentials

## Step 2: Backend Deployment

### Option A: Deploy to Railway

1. **Prepare Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Create Railway Project**
   - Go to Railway dashboard
   - New Project → Deploy from GitHub repo
   - Select your repository
   - Railway will detect the Node.js app

3. **Configure Build Settings**
   - Root Directory: `/backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **Set Environment Variables**
   ```env
   DATABASE_URL=<from-railway-postgres>
   PORT=4000
   RAZORPAY_KEY_ID=<live-key-id>
   RAZORPAY_SECRET=<live-secret>
   SENDGRID_API_KEY=<your-api-key>
   SENDGRID_FROM_EMAIL=noreply@shaastra.org
   FRONTEND_URL=<will-add-after-frontend-deploy>
   ```

5. **Deploy**
   - Click Deploy
   - Wait for build to complete
   - Copy the generated URL (e.g., `https://your-app.railway.app`)

### Option B: Deploy to Render

1. **Create Web Service**
   - Go to Render dashboard
   - New → Web Service
   - Connect your GitHub repository

2. **Configure Service**
   - Name: accommodation-backend
   - Root Directory: `backend`
   - Runtime: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Set Environment Variables**
   Add the same variables as Railway above

4. **Deploy**
   - Click Create Web Service
   - Wait for deployment
   - Copy the URL

## Step 3: Frontend Deployment

### Deploy to Vercel

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Dashboard**
   - Go to [Vercel](https://vercel.com)
   - New Project → Import Git Repository
   - Select your repository
   - Vercel auto-detects Vite configuration

3. **Configure Environment Variables**
   Go to Project Settings → Environment Variables:
   ```env
   VITE_GRAPHQL_ENDPOINT=https://your-backend.railway.app/graphql
   VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
   ```

4. **Deploy**
   - Click Deploy
   - Wait for build to complete
   - Copy the generated URL (e.g., `https://your-app.vercel.app`)

5. **Update Backend CORS**
   Go back to Railway/Render and update:
   ```env
   FRONTEND_URL=https://your-app.vercel.app
   ```
   Redeploy backend for changes to take effect.

## Step 4: Razorpay Production Setup

1. **Get Live Keys**
   - Login to Razorpay Dashboard
   - Settings → API Keys
   - Generate live keys (requires KYC)
   - Copy Key ID and Secret

2. **Update Environment Variables**
   Update in both frontend and backend:
   ```env
   # Frontend
   VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx

   # Backend
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
   RAZORPAY_SECRET=<live-secret>
   ```

3. **Test Payment Flow**
   - Make test booking
   - Complete payment
   - Verify payment in Razorpay dashboard
   - Check database for payment record

## Step 5: SendGrid Production Setup

1. **Verify Domain** (recommended)
   - Go to SendGrid → Settings → Sender Authentication
   - Verify domain or single sender
   - Update DNS records if needed

2. **Create API Key**
   - Settings → API Keys
   - Create API Key with Full Access
   - Copy the key (shown only once)

3. **Update Environment Variables**
   ```env
   SENDGRID_API_KEY=SG.xxxxxxxxxx
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   ```

4. **Test Emails**
   - Make test booking
   - Check inbox for confirmation email
   - Review SendGrid Activity Feed

## Step 6: Database Migrations

### Production Migration Strategy

1. **Disable Auto-Sync**
   In `backend/src/data-source.ts`:
   ```typescript
   synchronize: false, // IMPORTANT for production
   ```

2. **Run Migrations**
   ```bash
   cd backend
   npm run migration:generate -- src/migrations/InitialSchema
   npm run migration:run
   ```

3. **For Railway/Render**
   Add to build command:
   ```bash
   npm install && npm run build && npm run migration:run
   ```

## Step 7: Domain Configuration (Optional)

### Add Custom Domain to Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., accommodation.shaastra.org)
3. Configure DNS:
   ```
   Type: CNAME
   Name: accommodation
   Value: cname.vercel-dns.com
   ```

### Add Custom Domain to Railway

1. Go to Project Settings → Domains
2. Add custom domain
3. Configure DNS:
   ```
   Type: CNAME
   Name: api
   Value: <railway-provided-domain>
   ```

## Step 8: Monitoring & Logging

### Frontend Monitoring (Vercel)
- Automatic deployment logs
- Runtime logs in dashboard
- Analytics in Vercel dashboard

### Backend Monitoring
- View logs in Railway/Render dashboard
- Set up error tracking (Sentry, etc.)
- Configure health checks

### Database Monitoring
- Monitor connections in Railway/Render
- Set up backup schedule
- Configure alerts for storage

## Step 9: Security Checklist

- [ ] Environment variables are not committed
- [ ] CORS is configured for production domain only
- [ ] Database connection uses SSL
- [ ] Razorpay live keys are used
- [ ] SendGrid domain is verified
- [ ] HTTPS is enabled (automatic on Vercel/Railway)
- [ ] Rate limiting is configured
- [ ] Database backups are enabled

## Step 10: Testing Production

### Test Scenarios

1. **User Flow**
   - Access homepage
   - Register for accommodation
   - Complete payment
   - Receive confirmation email

2. **Admin Flow**
   - Access admin dashboard
   - View analytics
   - Create rooms
   - Export data

3. **Support Flow**
   - Submit support ticket
   - Receive confirmation email
   - Admin responds to ticket

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 10 --num 100 https://your-backend.railway.app/health
```

## Rollback Strategy

### Frontend Rollback (Vercel)
1. Go to Deployments
2. Find previous successful deployment
3. Click "..." → Promote to Production

### Backend Rollback (Railway)
1. Go to Deployments
2. Find previous deployment
3. Click Redeploy

### Database Rollback
```bash
cd backend
npm run migration:revert
```

## Common Production Issues

### 1. CORS Errors
**Problem**: Frontend can't reach backend
**Solution**: Verify FRONTEND_URL in backend environment

### 2. Payment Verification Fails
**Problem**: Invalid signature error
**Solution**: Ensure using correct Razorpay secret key

### 3. Database Connection Timeout
**Problem**: Backend can't connect to database
**Solution**: Check DATABASE_URL and firewall rules

### 4. Emails Not Sending
**Problem**: SendGrid errors
**Solution**: Verify API key and sender authentication

### 5. Build Failures
**Problem**: Deployment fails during build
**Solution**: Check logs, verify dependencies

## Monitoring URLs

After deployment, bookmark these:

- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-backend.railway.app`
- GraphQL Playground: `https://your-backend.railway.app/graphql`
- Health Check: `https://your-backend.railway.app/health`

## Maintenance

### Regular Tasks
- Monitor error logs weekly
- Check payment reconciliation
- Backup database monthly
- Update dependencies quarterly

### Scaling Considerations
- Monitor database size and connections
- Upgrade hosting plans as needed
- Implement caching for heavy queries
- Add CDN for static assets

## Cost Estimates

### Free Tier (Testing)
- Vercel: Free
- Railway: $5/month (with usage)
- Render: Free (with limitations)
- Database: Included with Railway/Render

### Production Tier
- Vercel: $20/month (Pro)
- Railway: $20-50/month (depends on usage)
- Database: $15/month (dedicated)
- SendGrid: $15/month (40k emails)
- Razorpay: 2% transaction fee

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Razorpay Documentation](https://razorpay.com/docs)
- [SendGrid Documentation](https://docs.sendgrid.com)

## Emergency Contacts

Maintain a list of:
- Hosting support contacts
- Database admin credentials
- Payment gateway support
- Domain registrar support
