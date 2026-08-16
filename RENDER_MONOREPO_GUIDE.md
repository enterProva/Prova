# Render Monorepo Setup Guide

Since your repository has multiple apps (main-app, landing-page, mobile-app, expo-app), you need to tell Render specifically to deploy from the `main-app` directory.

## Method 1: Using render.yaml (Recommended) ✓

The `render.yaml` file now includes:
```yaml
rootDir: main-app
```

This tells Render to:
- Look for `package.json` in `main-app/` instead of repo root
- Run all build/start commands from that directory
- Only trigger redeploys when files in `main-app/` change

**Nothing more needed** — just connect your repo to Render and it will use this config automatically.

---

## Method 2: Manual UI Configuration (Backup)

If `render.yaml` doesn't work or you're editing an existing service:

### When Connecting Repository

1. Go to Render Dashboard → **New** → **Web Service**
2. Select your **Prova** repository
3. Fill in basic info:
   - **Name**: `pause-protect-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default)

4. **IMPORTANT** — Before clicking Create, scroll to **Root Directory** field
5. Enter: `main-app`
6. Then set **Build Command** and **Start Command**:
   ```
   Build: npm run build
   Start: npm start
   ```

7. Click **Create Web Service**

### For Existing Services

If you already created a service without setting the Root Directory:

1. Go to your service dashboard
2. Click **Settings**
3. Scroll to **Root Directory**
4. Change to: `main-app`
5. Click **Save**
6. Render will redeploy automatically

---

## Why Root Directory Matters

Without setting it:
- ❌ Render looks for `package.json` at repo root
- ❌ All subdirectories trigger redeployment (inefficient)
- ❌ Build fails because main-app dependencies aren't at root

With `rootDir: main-app`:
- ✅ Render uses `main-app/package.json`
- ✅ Only changes to `main-app/**` trigger redeploy
- ✅ Build runs in correct context

---

## Testing Locally

Before deploying, verify the build works from anywhere:

```bash
# From Prova root directory (NOT main-app)
cd main-app
npm run build
npm start

# Should see: ✅ serving on http://...
```

---

## Multiple Apps in Same Repo?

If you want to deploy other apps (landing-page, mobile-app) later:

1. Create a **separate** Render service for each
2. Each service gets its own `rootDir`:
   - Service 1: `rootDir: main-app`
   - Service 2: `rootDir: landing-page`
   - Service 3: `rootDir: mobile-app`

3. Each can use the same GitHub repo (no need to fork)
4. Each deploys independently

---

## Troubleshooting

**Q: "Cannot find module 'express'"**
- Root Directory isn't set to `main-app`
- Check Render dashboard: Settings → Root Directory should be `main-app`

**Q: Build succeeded but "Cannot GET /"`
- Verify `npm run build` outputs to `dist/public` in main-app directory
- Check `vite.config.ts` build output path

**Q: Changes don't trigger redeploy**
- If Root Directory is not set, Render redeploys on any file change
- Once set to `main-app`, only changes in that directory trigger deploys

---

## Next Steps

1. ✅ `render.yaml` has `rootDir: main-app` configured
2. Connect your GitHub repo to Render
3. Render will auto-detect and use the `render.yaml` config
4. Set environment variables in Render dashboard
5. Deploy!
