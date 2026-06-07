# 🚀 Deployment Guide

## Architecture
- **Frontend**: React/Vite → Vercel (dist/client)
- **Backend**: Express.js → VPS (Node.js server)

---

## 1️⃣ Frontend Deployment (Vercel)

### Prerequisites
- GitHub account
- Vercel account (free tier OK)
- Repository pushed to GitHub

### Steps

1. **Connect Repository to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select the root folder (Commercial-Music-Licensing-Platform)

2. **Configure Build Settings**
   - Build Command: `npm run build:frontend`
   - Output Directory: `dist/client`
   - Framework: `Vite`

3. **Set Environment Variables** (Vercel Settings → Environment Variables)
   ```
   VITE_API_URL = https://api.your-vps-domain.com
   ```

4. **Deploy**
   - Vercel auto-deploys on git push
   - Frontend is live at: `https://your-project.vercel.app`

---

## 2️⃣ Backend Deployment (VPS)

### Prerequisites
- VPS with Node.js 18+ (or use nvm)
- SSH access to VPS
- Domain/subdomain for backend (e.g., api.your-domain.com)

### Option A: Manual Deployment (SSH)

#### Step 1: Connect to VPS
```bash
ssh user@your-vps-ip
```

#### Step 2: Install Node.js (if not installed)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Step 3: Clone Repository
```bash
cd /opt
git clone https://github.com/your-repo/Commercial-Music-Licensing-Platform.git
cd Commercial-Music-Licensing-Platform
npm install
```

#### Step 4: Create Production `.env`
```bash
sudo nano .env
```
Paste (update values):
```
NODE_ENV=production
PORT=9108
APP_ORIGIN=https://your-vercel-app.vercel.app
JWT_SECRET=<generate: openssl rand -base64 32>
HMAC_SECRET=<generate: openssl rand -base64 32>
HEADLESS_SECRET=<generate: openssl rand -base64 32>
TOKEN_TTL_SECONDS=7200
```

#### Step 5: Build Backend
```bash
npm run build:backend
```

#### Step 6: Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
pm2 start dist/server.cjs --name "hrl-backend"
pm2 startup
pm2 save
```

#### Step 7: Setup Reverse Proxy (Nginx)
```bash
sudo apt-get install -y nginx
```

Create `/etc/nginx/sites-available/api.your-domain.com`:
```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:9108;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/api.your-domain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 8: Setup SSL (Let's Encrypt)
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

✅ Backend is now live at `https://api.your-domain.com`

---

### Option B: Docker Deployment

#### Step 1: Build Docker Image
```bash
docker build -t hrl-backend .
```

#### Step 2: Run Container
```bash
docker run -d \
  --name hrl-backend \
  -p 9108:9108 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your_secret \
  -e HMAC_SECRET=your_secret \
  -e HEADLESS_SECRET=your_secret \
  hrl-backend
```

#### Step 3: Setup with Docker Compose
```bash
cd deploy
docker-compose up -d
```

---

## 🔗 Connect Frontend to Backend

In Vercel **Environment Variables**, set:
```
VITE_API_URL=https://api.your-domain.com
```

Redeploy frontend: `git push` to GitHub

---

## ✅ Testing

### Local
```bash
npm run dev:backend      # Backend on :9108
npm run dev:frontend     # Frontend on :5173
npm run test:smoke       # Test API endpoints
```

### Production
```bash
curl https://api.your-domain.com/api/health
# Response: {"status":"ok"}
```

---

## 📝 Environment Variables Summary

| Variable | Dev (localhost) | Production (Vercel + VPS) |
|----------|--------|---------------------------|
| `VITE_API_URL` | `http://localhost:9108` | `https://api.your-domain.com` |
| `APP_ORIGIN` | `http://localhost:5173` | `https://your-app.vercel.app` |
| `NODE_ENV` | `development` | `production` |
| `JWT_SECRET` | local_dev_123... | `openssl rand -base64 32` |
| `PORT` | 9108 | 9108 (internal VPS port) |

---

## 🆘 Troubleshooting

### Frontend not connecting to Backend
- Check CORS in `backend/server.ts` - `APP_ORIGIN` must match Vercel URL
- Verify `VITE_API_URL` is set in Vercel environment

### Backend not starting
- Check `.env` file exists with required variables
- Verify port 9108 is available: `lsof -i :9108`
- Check logs: `pm2 logs hrl-backend`

### SSL Certificate Issues
- Ensure DNS points to VPS IP
- Run: `sudo certbot renew --dry-run`

---

**Questions?** Check `.env.example` and `backend/server.ts` for current configuration.
