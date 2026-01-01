# Deployment Guide - Salon Events Wix App

This guide provides step-by-step instructions for deploying your Salon Events Wix App to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment Options](#production-deployment-options)
4. [Heroku Deployment](#heroku-deployment)
5. [AWS EC2 Deployment](#aws-ec2-deployment)
6. [DigitalOcean Deployment](#digitalocean-deployment)
7. [Docker Deployment](#docker-deployment)
8. [Post-Deployment Configuration](#post-deployment-configuration)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git installed
- Domain name (for production)
- SSL certificate (Let's Encrypt recommended)

---

## Local Development Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-org/Wix-Middlewear.git
cd Wix-Middlewear

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
# Wix App Credentials
WIX_APP_ID=a88e57a2-8663-43a0-954a-1d669869b8bb
WIX_APP_SECRET=641a5b63-f3b1-40c6-8b45-d7e14d54f8f0
WIX_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
[Paste your public key from Wix Dashboard]
-----END PUBLIC KEY-----"

# Server Configuration
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-random-secret-key-change-in-production

# Notification Settings
ENABLE_EMAIL_NOTIFICATIONS=false
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=

# Frontend
ALLOWED_ORIGINS=http://localhost:3001
```

### Step 3: Create Logs Directory

```bash
mkdir -p logs
```

### Step 4: Run Development Server

```bash
# Terminal 1: Run backend
npm run dev

# Terminal 2: Run frontend
cd frontend
npm start
```

Your backend will run on `http://localhost:3000` and frontend on `http://localhost:3001`.

---

## Production Deployment Options

We'll cover four popular deployment options:
1. **Heroku** - Easiest, good for quick deployment
2. **AWS EC2** - Full control, scalable
3. **DigitalOcean** - Balance of ease and control
4. **Docker** - Containerized, portable

---

## Heroku Deployment

### Step 1: Install Heroku CLI

```bash
# Install Heroku CLI (macOS)
brew tap heroku/brew && brew install heroku

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Login to Heroku

```bash
heroku login
```

### Step 3: Create Heroku App

```bash
heroku create salon-events-app
```

### Step 4: Set Environment Variables

```bash
heroku config:set WIX_APP_ID=a88e57a2-8663-43a0-954a-1d669869b8bb
heroku config:set WIX_APP_SECRET=641a5b63-f3b1-40c6-8b45-d7e14d54f8f0
heroku config:set WIX_PUBLIC_KEY="$(cat wix_public_key.pem)"
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set ENABLE_EMAIL_NOTIFICATIONS=true
heroku config:set EMAIL_PROVIDER=sendgrid
heroku config:set EMAIL_API_KEY=your-sendgrid-key
```

### Step 5: Create Procfile

Create a file named `Procfile` in the root directory:

```
web: node src/server.js
```

### Step 6: Deploy

```bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main
```

### Step 7: Open Your App

```bash
heroku open
```

Your app URL will be: `https://salon-events-app.herokuapp.com`

---

## AWS EC2 Deployment

### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2
2. Click **Launch Instance**
3. Choose **Ubuntu Server 22.04 LTS**
4. Instance type: **t2.small** or larger
5. Configure Security Group:
   - SSH (22) - Your IP
   - HTTP (80) - Anywhere
   - HTTPS (443) - Anywhere
   - Custom TCP (3000) - Anywhere (temporary)
6. Launch and download key pair

### Step 2: Connect to Instance

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 3: Install Node.js

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 4: Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 5: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/salon-events
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/salon-events /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### Step 7: Clone and Setup Application

```bash
# Clone repository
git clone https://github.com/your-org/Wix-Middlewear.git
cd Wix-Middlewear

# Install dependencies
npm install

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Create .env file
nano .env
# Paste your production environment variables
```

### Step 8: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Start application
pm2 start src/server.js --name salon-events

# Setup auto-restart on reboot
pm2 startup
pm2 save

# View logs
pm2 logs salon-events
```

---

## DigitalOcean Deployment

### Step 1: Create Droplet

1. Go to DigitalOcean dashboard
2. Create → Droplets
3. Choose **Ubuntu 22.04**
4. Plan: **Basic $12/month** or higher
5. Add SSH key
6. Create Droplet

### Step 2: Point Domain to Droplet

1. Go to **Networking** → **Domains**
2. Add your domain
3. Create A record pointing to your droplet IP

### Step 3: Follow AWS EC2 Steps 2-8

The setup is identical to AWS EC2 from Step 2 onwards.

---

## Docker Deployment

### Step 1: Create Dockerfile

Create `Dockerfile` in root directory:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm ci
RUN npm run build

WORKDIR /app

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "src/server.js"]
```

### Step 2: Create .dockerignore

```
node_modules
npm-debug.log
.git
.env
logs
frontend/node_modules
frontend/build
```

### Step 3: Create docker-compose.yml

```yaml
version: '3.8'

services:
  salon-events:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - WIX_APP_ID=${WIX_APP_ID}
      - WIX_APP_SECRET=${WIX_APP_SECRET}
      - WIX_PUBLIC_KEY=${WIX_PUBLIC_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - BASE_URL=${BASE_URL}
      - ENABLE_EMAIL_NOTIFICATIONS=${ENABLE_EMAIL_NOTIFICATIONS}
      - EMAIL_PROVIDER=${EMAIL_PROVIDER}
      - EMAIL_API_KEY=${EMAIL_API_KEY}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - salon-events
    restart: unless-stopped
```

### Step 4: Build and Run

```bash
# Build image
docker build -t salon-events .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Post-Deployment Configuration

### Step 1: Verify Deployment

```bash
# Check health endpoint
curl https://your-domain.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

### Step 2: Update Wix App Dashboard

1. Go to your Wix App Dashboard
2. Update all URLs from localhost to your production domain:
   - OAuth Redirect URL: `https://your-domain.com/auth/callback`
   - Dashboard URL: `https://your-domain.com/dashboard`
   - Widget URL: `https://your-domain.com/widget/events`
   - Webhook URLs: `https://your-domain.com/plugins-and-webhooks/*`

### Step 3: Test All Features

- [ ] OAuth authentication
- [ ] Dashboard loads
- [ ] API endpoints respond
- [ ] Webhooks are received
- [ ] Notifications send correctly
- [ ] Widget displays on test site

### Step 4: Enable Monitoring

**For PM2:**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

**For Docker:**
Setup logging driver in docker-compose.yml:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

---

## Monitoring and Maintenance

### Health Checks

Setup a cron job to monitor your app:

```bash
crontab -e
```

Add:
```bash
*/5 * * * * curl -f https://your-domain.com/health || echo "App down!" | mail -s "Alert" your@email.com
```

### Log Management

View logs:

```bash
# PM2
pm2 logs salon-events

# Docker
docker-compose logs -f salon-events

# Direct log files
tail -f logs/combined.log
tail -f logs/error.log
```

### Backup Strategy

Backup important data:

```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf backup-$DATE.tar.gz .env logs/
```

### Updates and Maintenance

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Restart application
pm2 restart salon-events

# Or with Docker
docker-compose down
docker-compose build
docker-compose up -d
```

---

## Security Checklist

- [ ] Environment variables stored securely
- [ ] SSL/HTTPS enabled
- [ ] Firewall configured (only necessary ports open)
- [ ] SSH key-based authentication (no password)
- [ ] Regular security updates (`sudo apt update && sudo apt upgrade`)
- [ ] Strong JWT secret
- [ ] Rate limiting enabled (consider adding express-rate-limit)
- [ ] Wix JWT validation working correctly

---

## Performance Optimization

### Enable Compression

Add to your Express app:

```javascript
import compression from 'compression';
app.use(compression());
```

### Add Caching

```javascript
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes
```

### Setup CDN

Consider using Cloudflare for:
- CDN for static assets
- DDoS protection
- SSL management
- Caching

---

## Troubleshooting

### App Won't Start

```bash
# Check logs
pm2 logs salon-events --lines 100

# Check port availability
sudo lsof -i :3000

# Check environment variables
pm2 env 0
```

### High Memory Usage

```bash
# Monitor
pm2 monit

# Restart app
pm2 restart salon-events
```

### Webhooks Not Received

1. Check firewall allows HTTPS
2. Verify SSL certificate is valid
3. Check webhook URLs in Wix dashboard
4. Review server logs for incoming requests

---

## Support Resources

- **Wix Developers:** https://dev.wix.com/
- **Node.js Docs:** https://nodejs.org/docs
- **PM2 Docs:** https://pm2.keymetrics.io/
- **Nginx Docs:** https://nginx.org/en/docs/

---

## Summary

Your app is now deployed and ready to use! Make sure to:
1. ✅ Update all URLs in Wix dashboard
2. ✅ Test all functionality
3. ✅ Setup monitoring
4. ✅ Configure backups
5. ✅ Enable HTTPS
6. ✅ Review logs regularly

For production use, consider:
- Load balancing for high traffic
- Database for persistent storage
- Redis for caching and session management
- Automated backups
- Monitoring service (New Relic, Datadog, etc.)
