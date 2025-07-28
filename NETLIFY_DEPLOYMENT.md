# BD TicketPro - Netlify Deployment Guide

## 🚀 Quick Deployment

### Prerequisites
- GitHub repository with your code
- Netlify account (free tier available)
- Node.js 18+ locally for testing

### Step 1: Prepare Repository
1. Ensure all files are committed to your GitHub repository
2. Verify the `netlify.toml` configuration is in the root directory
3. Check that all dependencies are listed in `package.json`

### Step 2: Deploy to Netlify

#### Option A: Direct Git Integration (Recommended)
1. Log in to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub account
4. Select your BD TicketPro repository
5. Configure build settings:
   - **Build command**: `npm run build:netlify`
   - **Publish directory**: `dist/spa`
   - **Functions directory**: `netlify/functions`

#### Option B: Manual Deploy
1. Run locally: `npm run build:netlify`
2. Drag and drop the `dist/spa` folder to Netlify
3. Upload functions separately via Netlify dashboard

### Step 3: Environment Variables
Set these in Netlify Dashboard → Site Settings → Environment Variables:

```bash
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
DATABASE_PATH=/.netlify/functions/data/bd-ticketpro.db
```

### Step 4: Domain Configuration
1. In Netlify Dashboard → Domain Settings
2. Add custom domain (optional)
3. Enable HTTPS (automatic with Netlify)

## 🔧 Build Configuration

### Build Scripts
- `npm run build:netlify` - Complete Netlify build
- `npm run build:client` - Client-only build
- `npm run build:server` - Server-only build

### File Structure
```
bd-ticketpro/
├── netlify/
│   ├── functions/
│   │   ├── api.ts          # Main API handler
│   │   ├── health.ts       # Health check endpoint
│   │   └── init-db.ts      # Database initialization
├── scripts/
│   ├── netlify-build.js    # Build script
│   └── verify-deployment.js # Post-deployment verification
├── netlify.toml            # Netlify configuration
└── dist/spa/              # Built client files
```

## 🛠️ Production Features

### ✅ Included Features
- **Serverless Functions**: All API endpoints work via Netlify Functions
- **Database**: SQLite database with automatic initialization
- **Authentication**: JWT-based auth system
- **Security Headers**: XSS protection, CSRF protection, etc.
- **Cache Control**: Optimized static asset caching
- **SPA Routing**: Client-side routing with fallback
- **Health Monitoring**: `/health` endpoint for uptime monitoring

### ✅ Performance Optimizations
- **Code Splitting**: Automatic chunk splitting for faster loading
- **Asset Optimization**: Minified CSS/JS with cache headers
- **Database**: Optimized queries and connection handling
- **CDN**: Netlify's global CDN for fast content delivery

## 🔐 Security Configuration

### Headers Applied
```toml
X-Frame-Options = "DENY"
X-XSS-Protection = "1; mode=block"
X-Content-Type-Options = "nosniff"
Referrer-Policy = "strict-origin-when-cross-origin"
```

### Authentication
- JWT tokens with secure secret
- Password hashing with bcrypt
- Role-based access control
- Session management

## 📊 Monitoring & Maintenance

### Health Check
- Endpoint: `https://your-app.netlify.app/.netlify/functions/health`
- Returns system status, uptime, and performance metrics

### Database Management
- SQLite database stored in function context
- Automatic schema initialization
- Seed data for demo accounts

### Logs
- Function logs available in Netlify Dashboard
- Error tracking and monitoring
- Performance metrics

## 🚨 Troubleshooting

### Common Issues

#### Build Fails
```bash
# Check dependencies
npm install

# Test build locally
npm run build:netlify

# Check build logs in Netlify Dashboard
```

#### Functions Not Working
```bash
# Verify function syntax
cd netlify/functions
node -c api.ts

# Check environment variables
# Ensure all required variables are set in Netlify
```

#### Database Issues
```bash
# Initialize database manually
curl -X POST https://your-app.netlify.app/.netlify/functions/init-db
```

#### Authentication Problems
```bash
# Verify JWT_SECRET is set
# Check browser console for auth errors
# Test with demo credentials
```

### Support Resources
- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Functions Guide](https://docs.netlify.com/functions/overview/)
- [BD TicketPro GitHub Issues](your-repo-url/issues)

## 📈 Scaling Considerations

### Current Limitations (Free Tier)
- 125K function invocations/month
- 100GB bandwidth/month
- 300 build minutes/month

### Upgrade Benefits (Pro Tier)
- Unlimited bandwidth
- More function invocations
- Advanced analytics
- Priority support

## 🎯 Post-Deployment Checklist

- [ ] Site loads successfully
- [ ] Login system works with demo credentials
- [ ] Dashboard displays data correctly
- [ ] Booking system functions properly
- [ ] All pages are accessible
- [ ] Mobile responsiveness verified
- [ ] SSL certificate active
- [ ] Custom domain configured (if applicable)
- [ ] Health check endpoint responding
- [ ] Error monitoring set up

## 🎉 Demo Credentials

Use these credentials to test the deployed application:

**Admin Access:**
- Username: `admin`
- Password: `admin123`

**Manager Access:**
- Username: `manager`
- Password: `manager123`

**Staff Access:**
- Username: `staff`
- Password: `staff123`

---

**Ready for Production! 🚀**

Your BD TicketPro application is now fully configured for Netlify deployment with enterprise-grade features, security, and performance optimizations.
