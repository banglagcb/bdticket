# BD TicketPro - Production Deployment Guide 🚀

## 📋 Pre-Deployment Checklist

### ✅ Environment Setup
- [ ] Copy `.env.example` to `.env`
- [ ] Update `JWT_SECRET` with a strong production key
- [ ] Set `NODE_ENV=production`
- [ ] Configure `ALLOWED_ORIGINS` with your domain
- [ ] Update `APP_URL` with your production domain
- [ ] Set strong `SESSION_SECRET`

### ✅ Security Configuration
- [ ] Generate secure JWT secret (minimum 32 characters)
- [ ] Configure rate limiting settings
- [ ] Set up CORS for specific domains only
- [ ] Review and update default admin credentials
- [ ] Enable HTTPS in production

### ✅ Database Configuration
- [ ] Ensure SQLite file permissions are correct
- [ ] Set up automated backups
- [ ] Configure backup retention policy
- [ ] Test database initialization

### ✅ Build Verification
- [ ] Run `npm run build` successfully
- [ ] Test production server with `npm start`
- [ ] Verify all API endpoints work
- [ ] Test authentication flow
- [ ] Confirm role-based access control

## 🔧 Production Environment Variables

```env
# Critical Production Settings
NODE_ENV=production
JWT_SECRET=your-super-secure-64-character-production-secret-key-here
PORT=8080
ALLOWED_ORIGINS=https://your-domain.com
APP_URL=https://your-domain.com

# Security
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100
SESSION_SECRET=another-secure-session-secret-key

# Company Information
COMPANY_NAME=Your Travel Agency Name
COMPANY_EMAIL=info@yourcompany.com
COMPANY_PHONE=+880-XXX-XXX-XXXX
COMPANY_ADDRESS=Your Address, Dhaka, Bangladesh
```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set permissions
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 8080

CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  bd-ticketpro:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
    volumes:
      - ./data:/app/data
      - ./backups:/app/backups
    restart: unless-stopped
```

## ☁️ Platform-Specific Deployment

### Netlify Deployment (Recommended)
This project is configured for Netlify deployment:

1. **Connect Repository**
   - Link your Git repository to Netlify
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist/spa`

2. **Environment Variables**
   ```
   NODE_ENV=production
   JWT_SECRET=your-production-secret
   ALLOWED_ORIGINS=https://your-site.netlify.app
   ```

3. **Functions Configuration**
   - Netlify Functions are pre-configured in `netlify/functions/`
   - API endpoints available at `/.netlify/functions/api`

### Digital Ocean App Platform
```yaml
name: bd-ticketpro
services:
- name: web
  source_dir: /
  github:
    repo: your-username/bd-ticketpro
    branch: main
  run_command: npm start
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET
    value: your-production-secret
```

### Railway
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

## 🔒 Security Considerations

### 1. Authentication
- Change default admin credentials immediately
- Enforce strong password policies
- Set short JWT expiration times
- Implement session management

### 2. Database Security
- Regular automated backups
- Encrypted database file (if supported)
- Restricted file permissions
- Monitor database access

### 3. API Security
- Rate limiting enabled
- CORS properly configured
- Input validation with Zod
- SQL injection prevention

### 4. HTTPS Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# API Health Check
curl https://your-domain.com/api/auth/health

# Database Check
curl https://your-domain.com/api/settings/system-info
```

### Log Management
```bash
# Application logs
tail -f logs/app.log

# Error monitoring
tail -f logs/error.log

# Database backup logs
tail -f logs/backup.log
```

### Backup Strategy
- **Daily**: Automated database backups
- **Weekly**: Full system backups
- **Monthly**: Archive old backups
- **Monitoring**: Backup success/failure alerts

### Performance Monitoring
- Monitor response times
- Track database query performance
- Monitor memory usage
- Set up uptime monitoring

## 🚨 Troubleshooting

### Common Production Issues

1. **Database Permission Errors**
   ```bash
   chmod 755 /app/data
   chmod 666 /app/data/bd-ticketpro.db
   ```

2. **Memory Issues**
   ```bash
   # Check memory usage
   ps aux --sort=-%mem | head
   
   # Restart if needed
   pm2 restart bd-ticketpro
   ```

3. **Port Conflicts**
   ```bash
   # Check port usage
   lsof -i :8080
   
   # Kill conflicting process
   kill -9 <PID>
   ```

## 📞 Production Support

### Emergency Contacts
- **System Admin**: admin@yourcompany.com
- **Database Admin**: dba@yourcompany.com
- **24/7 Support**: +880-XXX-XXX-XXXX

### Rollback Procedure
1. Stop current service
2. Restore from last known good backup
3. Verify functionality
4. Update DNS if needed
5. Notify users of restoration

---

**BD TicketPro** - সফলভাবে প্রোডাকশনে ডিপ্লয় করার জন্য সম্পূর্ণ গাইড ✈️
