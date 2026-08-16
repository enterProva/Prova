# Deployment Guide: Vercel (Frontend) + Render (Backend)

## Overview

This guide covers deploying the full-stack application:
- **Frontend (Vite React)** → Vercel
- **Backend (Express.js)** → Render

## Architecture

```
┌─────────────────────────────────────────────┐
│         Vercel (Frontend)                   │
│  - Vite React app                           │
│  - Static files + client-side code          │
│  - VITE_API_URL set to Render backend URL   │
└──────────────┬──────────────────────────────┘
               │ API calls to /api/*
               ↓
┌─────────────────────────────────────────────┐
│         Render (Backend)                    │
│  - Express.js server                        │
│  - API routes (/api/*)                      │
│  - Firebase/Firestore integration           │
│  - CORS configured for Vercel domain        │
└─────────────────────────────────────────────┘
```

## Prerequisites

1. **Vercel Account**: https://vercel.com/signup
2. **Render Account**: https://render.com/
3. **GitHub Repository**: Connected to both services
4. **Environment Variables Ready**:
   - Firebase credentials
   - API keys (Google FactCheck, Groq)
   - Database connection strings

---

## Step 1: Deploy Backend to Render

### 1.1 Connect Repository to Render

1. Go to [render.com](https://render.com) and sign in
2. Click **New +** → **Web Service**
3. Select your GitHub repository
4. Configure:
   - **Name**: `pause-protect-backend` (or similar)
   - **Environment**: `Node`
   - **Build Command**: `npm run build` ✓ (already in `render.yaml`)
   - **Start Command**: `npm start` ✓ (already in `render.yaml`)
   - **Plan**: Free or Starter (auto-sleeps after 15 min inactivity on Free)

### 1.2 Set Environment Variables on Render

Navigate to **Environment** tab and add the following:

```
NODE_ENV=production
PORT=3000
BASE_URL=https://pause-protect-backend.onrender.com (← update with your Render URL)

# Firebase
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...} (← from .env)

# API Keys
VITE_GOOGLE_FACTCHECK_API_KEY=<your-key>
GROQ_API_KEY=<your-key>
GROQ_LINK_CHECK_MODEL=openai/gpt-oss-120b

# CORS: Set to your Vercel frontend URL (set after Step 2)
FRONTEND_URL=https://pause-protect.vercel.app (← update after deploying frontend)

# Database (if using)
DATABASE_URL=<your-database-url>
```

### 1.3 Deploy

1. Click **Create Web Service**
2. Wait for build to complete
3. Note your Render URL: `https://pause-protect-backend.onrender.com` (example)

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Select your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `main-app` (or leave blank if in workspace root)

### 2.2 Set Environment Variables on Vercel

Navigate to **Settings** → **Environment Variables** and add:

```
VITE_API_URL=https://pause-protect-backend.onrender.com (← use your Render URL)
```

> **Note**: Environment variables prefixed with `VITE_` are embedded during build (not runtime secrets)

### 2.3 Deploy

1. Click **Deploy**
2. Wait for build to complete
3. Note your Vercel URL: `https://pause-protect.vercel.app` (example)

---

## Step 3: Update CORS on Render Backend

After deploying frontend to Vercel:

1. Go to Render dashboard
2. Navigate to your backend service
3. Update **Environment Variable** `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://pause-protect.vercel.app (← your actual Vercel URL)
   ```
4. Render will redeploy automatically

---

## Troubleshooting

### API calls failing (CORS errors)

**Problem**: Frontend getting CORS errors when calling backend

**Solution**:
1. Verify `FRONTEND_URL` is set correctly on Render (should be your Vercel URL)
2. Check browser DevTools **Network** tab for response headers
3. Ensure CORS headers include `Access-Control-Allow-Origin: <vercel-url>`

### `VITE_API_URL` not recognized in frontend

**Problem**: Environment variable shows as undefined

**Solution**:
1. In `vite.config.ts`, `VITE_*` variables are embedded at build time
2. Verify the variable is set in Vercel **Environment Variables**
3. Redeploy frontend after setting environment variable

### Build fails on Render

**Problem**: `npm run build` fails

**Solution**:
1. Check Render build logs for specific error
2. Verify all dependencies in `package.json` are available
3. Ensure `.env` secrets are set in Render environment (not `.env.local`)

### Connection timeout to Render

**Problem**: Frontend can't reach backend

**Solution**:
1. Verify backend is running (check Render logs)
2. If on Render Free plan, it may have auto-stopped after 15 min of inactivity
3. Manually restart service or upgrade to Starter plan ($7/month)

---

## Development vs. Production

### Development (localhost)

```bash
npm run dev  # Runs on http://localhost:3000
# Vite proxy: /api → http://localhost:3000
# No VITE_API_URL needed (defaults to relative /api)
```

### Production (Vercel + Render)

```
Frontend build:
  VITE_API_URL=https://pause-protect-backend.onrender.com
  
API calls transform:
  /api/users  →  https://pause-protect-backend.onrender.com/api/users
```

---

## Environment Variable Reference

| Variable | Where | Value | Notes |
|----------|-------|-------|-------|
| `NODE_ENV` | Render | `production` | Required |
| `PORT` | Render | `3000` | Server port |
| `VITE_API_URL` | Vercel | `https://...onrender.com` | Set after deploying backend |
| `FRONTEND_URL` | Render | `https://...vercel.app` | Set after deploying frontend; enables CORS |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Render | JSON string | From Firebase console |
| `VITE_GOOGLE_FACTCHECK_API_KEY` | Render | API key | From Google Cloud |
| `GROQ_API_KEY` | Render | API key | From Groq console |

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Vercel
3. ✅ Set `FRONTEND_URL` on Render
4. Test API connectivity from frontend
5. Monitor logs in both platforms
6. Set up error tracking (Sentry, etc.)
7. Configure custom domains if needed

---

## Useful Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Check TypeScript
npm run check

# Database migrations (if applicable)
npm run db:push
```

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Express.js**: https://expressjs.com/
- **Vite**: https://vitejs.dev/
