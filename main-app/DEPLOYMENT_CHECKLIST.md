# Deployment Checklist

## Pre-Deployment ✓

- [ ] Ensure repository is pushed to GitHub with all changes
- [ ] Review `.env.example` for required environment variables
- [ ] Verify Firebase service account key is accessible
- [ ] Confirm API keys (Google, Groq) are valid
- [ ] Test locally: `npm run dev` ✓
- [ ] Run build locally: `npm run build` ✓
- [ ] Check TypeScript: `npm run check` ✓

## Render Backend Deployment

### Create Web Service
- [ ] Go to https://render.com
- [ ] Sign in with GitHub
- [ ] Click **New** → **Web Service**
- [ ] Select your repository
- [ ] Name it `pause-protect-backend`
- [ ] Environment: `Node`
- [ ] Build Command: `npm run build`
- [ ] Start Command: `npm start`
- [ ] Select plan (Free or Starter)

### Environment Variables
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3000`
- [ ] `BASE_URL` = (get from Render dashboard after deploy)
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` = (from .env)
- [ ] `VITE_GOOGLE_FACTCHECK_API_KEY` = (from .env)
- [ ] `GROQ_API_KEY` = (from .env)
- [ ] `GROQ_LINK_CHECK_MODEL` = `openai/gpt-oss-120b`
- [ ] `FRONTEND_URL` = (set after Vercel deployment)

### Deploy
- [ ] Click **Create Web Service**
- [ ] Wait for build to complete (5-10 minutes)
- [ ] ✅ Note your Render URL: `https://pause-protect-backend.onrender.com`

## Vercel Frontend Deployment

### Create Project
- [ ] Go to https://vercel.com
- [ ] Sign in with GitHub
- [ ] Click **Add New** → **Project**
- [ ] Select your repository
- [ ] Framework Preset: `Vite`
- [ ] Root Directory: `main-app`

### Environment Variables
- [ ] `VITE_API_URL` = `https://pause-protect-backend.onrender.com` (use your Render URL)

### Deploy
- [ ] Click **Deploy**
- [ ] Wait for build to complete (2-5 minutes)
- [ ] ✅ Note your Vercel URL: `https://pause-protect.vercel.app`

## Post-Deployment

### Update Render CORS
- [ ] Go to Render dashboard → Your backend service
- [ ] Settings → Environment Variables
- [ ] Update `FRONTEND_URL` = `https://pause-protect.vercel.app` (your Vercel URL)
- [ ] Save (auto-redeploys)

### Test the Deployment
- [ ] Open your Vercel URL in browser
- [ ] Check browser console for errors
- [ ] Test API call: Open DevTools → Network
- [ ] Perform an action that calls `/api` endpoint
- [ ] Verify request goes to Render backend
- [ ] Verify response has correct CORS headers

### Monitor Logs
- [ ] **Render**: Check build and runtime logs for errors
- [ ] **Vercel**: Check build logs and runtime logs
- [ ] Set up error tracking (optional): Sentry, DataDog, etc.

---

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| CORS error | Verify `FRONTEND_URL` matches your Vercel domain |
| `VITE_API_URL` undefined | Set in Vercel environment variables & redeploy |
| API calls timeout | Check if Render service is running (may have auto-stopped on Free plan) |
| Build fails | Check build logs; verify all `.env` values are set |
| "Cannot GET /" | Ensure `npm run build` outputs to `dist/public` |

---

## Domain Setup (Optional)

### Custom Domain on Vercel
1. Go to Vercel Project → **Settings** → **Domains**
2. Add your custom domain (e.g., `www.pauseprotect.app`)
3. Update DNS records as instructed
4. Update `FRONTEND_URL` on Render to your custom domain

### Custom Domain on Render
1. Go to Render Service → **Settings** → **Custom Domain**
2. Add your backend domain (e.g., `api.pauseprotect.app`)
3. Update DNS records as instructed
4. Update `VITE_API_URL` on Vercel to your custom domain

---

## Production Monitoring

- [ ] Set up error tracking (Sentry, Rollbar, etc.)
- [ ] Monitor Render logs for API errors
- [ ] Monitor Vercel logs for frontend errors
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Enable Render notification alerts (optional)

---

## Rollback Plan

If something goes wrong after deployment:

1. **Vercel**: Click **Deployments** → Select previous build → **Promote to Production**
2. **Render**: Click **Deployments** → Select previous build → **Deploy**

---

## Next Steps

After successful deployment:
- [ ] Collect user feedback
- [ ] Monitor error rates
- [ ] Optimize performance if needed
- [ ] Plan future feature deployments
- [ ] Consider upgrading plans if hitting limits

---

**Need Help?**
- Check `DEPLOYMENT.md` for detailed instructions
- Render Support: https://render.com/docs
- Vercel Support: https://vercel.com/docs
