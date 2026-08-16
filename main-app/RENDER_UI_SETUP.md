# Render Setup: Step-by-Step Screenshots Reference

## For Your Monorepo Structure

```
Prova/                          ← Repository root
├── main-app/                   ← ⭐ Deploy this to Render
│   ├── package.json
│   ├── render.yaml
│   ├── client/
│   └── server/
├── landing-page/
├── mobile-app/
├── expo-app/
└── ...
```

---

## When Connecting GitHub Repo to Render

### Step 1: Choose Repository
- Click **New** → **Web Service**
- Select: `Prova` repository

### Step 2: Configure Service
Fill in these fields:

| Field | Value |
|-------|-------|
| **Name** | `pause-protect-backend` |
| **Environment** | `Node` |
| **Region** | Select closest to users |
| **Branch** | `main` (or your default) |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |
| **Plan** | Free or Starter |

### Step 3: SET ROOT DIRECTORY ⭐
**BEFORE clicking "Create Web Service"**, find **Root Directory** field:

```
Root Directory: main-app
```

> This tells Render:
> - Use `main-app/package.json`
> - Run commands in `main-app/` directory
> - Only redeploy when files in `main-app/` change

---

## Why render.yaml Has rootDir

The file `main-app/render.yaml` includes:
```yaml
rootDir: main-app
```

Render reads this automatically, so you don't have to manually enter it each time. **This is the recommended approach.**

---

## Common Mistakes 🚨

### ❌ Mistake 1: Leave Root Directory Empty
```
Root Directory: [blank]
```
**Result**: Render looks for `package.json` at repo root → **Build fails**

### ❌ Mistake 2: Enter Full Path Wrong
```
Root Directory: ./main-app     (Wrong!)
Root Directory: /main-app      (Wrong!)
```
**Result**: Path not found → **Build fails**

### ✅ Correct Way
```
Root Directory: main-app       (Correct!)
```

---

## After Creating Service

Once created, you'll see:
- **Settings** tab
- **Environment** tab (for env vars)
- **Deployments** tab (shows build status)
- **Logs** tab (shows output)

If you made a mistake with Root Directory:
1. Go to **Settings**
2. Scroll to **Root Directory**
3. Fix to: `main-app`
4. Click **Save** (auto-redeploys)

---

## Environment Variables Location

In Render dashboard:
1. Click your service name
2. Click **Environment** tab
3. Add all required env vars:
   - `FIREBASE_SERVICE_ACCOUNT_KEY`
   - `VITE_GOOGLE_FACTCHECK_API_KEY`
   - `GROQ_API_KEY`
   - `NODE_ENV=production`
   - `PORT=3000`
   - `FRONTEND_URL=` (set after Vercel deploy)

---

## Deployment Trigger

After setup:
- Every push to `main` → Render auto-deploys
- Only changes to `main-app/` trigger deploy (thanks to `rootDir`)
- Changes to `landing-page/`, `mobile-app/` don't affect this service

---

## Getting Your Render URL

After deployment succeeds:
1. Click **Deployments** tab
2. Click the green checkmark for latest build
3. Find **Service URL** at the top:
   ```
   https://pause-protect-backend.onrender.com
   ```

Copy this URL → You'll need it for Vercel's `VITE_API_URL`

---

## Need More Info?

- Full guide: See `DEPLOYMENT.md`
- Render docs: https://render.com/docs/monorepo-support
- Specific issues: Check `RENDER_MONOREPO_GUIDE.md`
