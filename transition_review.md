# Review: main-app → expo-app Transition

## Overview

The project is a **PPP (Pause, Protect, Post)** misinformation-detection app being transitioned from a **React web app** (Vite + Express + Drizzle/Postgres) to a **React Native Expo** mobile app. This review covers what transferred well, what's missing, and what needs attention.

---

## Architecture Comparison

| Aspect | main-app | expo-app |
|---|---|---|
| **Framework** | React 18 + Vite | React Native 0.81 + Expo 54 |
| **Routing** | [wouter](file:///c:/Users/Felicia/Documents/Projects/Prova/main-app/client/src/App.tsx) (web router) | [@react-navigation/native-stack](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/App.tsx) |
| **State/Data** | [@tanstack/react-query](file:///c:/Users/Felicia/Documents/Projects/Prova/main-app/client/src/lib/queryClient.ts) + server API | Local state only (react-query installed but unused) |
| **Backend** | Express server + Firestore | ❌ No backend connection |
| **Styling** | Tailwind CSS + Radix UI + shadcn | React Native `StyleSheet` |
| **Auth** | Google OAuth via Passport + Guest mode | Guest mode only (no real auth) |
| **DB** | Drizzle ORM → Postgres/Neon | ❌ None |

---

## ✅ What Transferred Well

### 1. Screen / Page Parity
All three main screens were ported:
- **Landing** → [Landing.tsx](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/screens/Landing.tsx) — Fade-in animation, matching copy
- **Auth Selection** → [AuthSelection.tsx](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/screens/AuthSelection.tsx) — Login + Guest options
- **Home** → [Home.tsx](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/screens/Home.tsx) — Tab-based layout with sidebar

### 2. All 8 Feature Tabs Exist
Both apps share the same `TabType` type and all 8 tabs:
`feed` · `link-checker` · `pause-nudges` · `learn` · `community` · `social-companion` · `advanced-ai` · `profile`

### 3. Shared Type Definitions
The `User` type in [expo useAuth](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/hooks/useAuth.ts) mirrors the [main-app useAuth](file:///c:/Users/Felicia/Documents/Projects/Prova/main-app/client/src/hooks/useAuth.ts) exactly — same fields, same guest user object shape.

### 4. FactCheck Analysis Logic
The `FactCheckService` was cleanly ported to [expo factCheck.ts](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/services/factCheck.ts), preserving:
- Domain credibility lists (same credible/suspicious domains)
- Content pattern analysis (same regex patterns)
- Bias determination logic
- Verdict thresholds

### 5. UI Component Library Started
A small native component library exists in [`src/components/ui/`](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/components/ui): `Avatar`, `Badge`, `Button`, `Card` — good foundation.

---

## ⚠️ Issues & Gaps

### 1. Backend Not Connected — **CRITICAL**

> [!CAUTION]
> The expo-app has **zero backend connectivity**. The main-app's entire value proposition relies on server-side processing.

| Feature | main-app | expo-app |
|---|---|---|
| Link checking | Server-side scraping + AI analysis via [routes.ts](file:///c:/Users/Felicia/Documents/Projects/Prova/main-app/server/routes.ts) | **Mock data with `setTimeout`** — [LinkCheckerTab.tsx:52-76](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/components/LinkCheckerTab.tsx#L52-L76) |
| Feed posts | Fetched from API (`/api/feed`) | **Hardcoded dummy data** — [FeedTab.tsx:23-49](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/components/FeedTab.tsx#L23-L49) |
| User data | Persisted in Firestore via [storage.firestore.ts](file:///c:/Users/Felicia/Documents/Projects/Prova/main-app/server/storage.firestore.ts) | **None persisted** |
| Learning progress | Server-side tracking | **Static hardcoded lessons** |
| Pause nudges | Server-side CRUD | **Not implemented** |

**The `@tanstack/react-query` package is installed but entirely unused.** The [useAuth hook](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/hooks/useAuth.ts) was rewritten to use raw `useState` instead of `useQuery`.

### 2. LinkChecker Service Is a Stub

The [expo linkChecker.ts](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/services/linkChecker.ts) creates **mock scraped content** (lines 31-36) instead of actually scraping URLs:

```typescript
// Line 31-36 of expo linkChecker.ts
const scrapedContent: ScrapedContent = {
  title: 'Content from ' + domain,
  content: 'Sample content for analysis',  // ← always the same
  publishedDate: null,
  domain: domain,
};
```

Meanwhile, the `LinkCheckerTab` component doesn't even use this service — it generates **completely random mock results** inline (lines 54-68).

### 3. Authentication Is Incomplete

- The [AuthSelection screen](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/screens/AuthSelection.tsx#L19-L23) has a `handleLogin` that just navigates to Home — no actual auth flow
- The [useAuth hook](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/hooks/useAuth.ts#L22-L54) has a custom `storage` abstraction that checks for `localStorage` but falls back to `null` for React Native — it should use `@react-native-async-storage/async-storage` (which is already in `package.json` but **never imported**)

### 4. Storage Adapter Not Using AsyncStorage

> [!WARNING]
> `@react-native-async-storage/async-storage` is listed as a dependency but the [storage abstraction](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/hooks/useAuth.ts#L22-L54) falls back to `localStorage`, which doesn't exist in React Native. Guest mode persistence will silently fail on device.

### 5. Web Scraping Won't Work on Mobile

The main-app's [factCheck.ts](file:///c:/Users/Felicia/Documents/Projects/Prova/main-app/client/src/services/factCheck.ts#L34-L145) uses `axios` + `DOMParser`/`JSDOM` to scrape URLs. This approach won't work in React Native — there's no DOM. The expo-app correctly skipped this, but the replacement (mock data) isn't a real solution. **Web scraping must remain server-side.**

### 6. Missing Features from main-app

| Feature | main-app | expo-app |
|---|---|---|
| `ProtectedRoute` guard | ✅ [App.tsx:12-25](file:///c:/Users/Felicia/Documents/Projects/Prova/main-app/client/src/App.tsx#L12-L25) | ❌ Any screen is accessible |
| `SplashScreen` component | ✅ Loading state | ❌ Missing |
| `not-found` page | ✅ 404 handler | ❌ No fallback route |
| Toast notifications | ✅ via Radix Toast | ❌ Using `Alert` only |
| `Collapsible` technical details | ✅ In link checker | ❌ Not ported |
| Clickable source links | ✅ `<a href>` | ❌ Plain text |
| `QueryClientProvider` wrapper | ✅ Root-level | ❌ Missing |
| Responsive desktop layout | ✅ Sidebar + mobile nav | N/A (mobile-only is fine) |

### 7. React Version Mismatch

- **main-app**: React `^18.3.1`
- **expo-app**: React `19.1.0`

This is fine for Expo 54 (which supports React 19), but the imported types `@types/react: ~19.1.0` should match. Just note this if sharing code between the two.

---

## 🔧 Recommendations

### Priority 1: Connect to Backend API
1. Create an API client module (e.g. `src/services/api.ts`) with the backend base URL
2. Wire up `@tanstack/react-query` — it's already installed
3. Replace all mock/hardcoded data in tabs with real API calls
4. Add a `QueryClientProvider` in [App.tsx](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/App.tsx)

### Priority 2: Fix AsyncStorage
Replace the `localStorage` fallback in [useAuth.ts](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/hooks/useAuth.ts) with the already-installed `@react-native-async-storage/async-storage`:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};
```

### Priority 3: Implement Auth Flow
- Add Google Sign-In using `expo-auth-session` or `@react-native-google-signin/google-signin`
- Wire the login button in [AuthSelection](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/screens/AuthSelection.tsx) to the backend's `/api/auth` endpoints
- Add route protection (navigation guard before entering Home)

### Priority 4: Make LinkChecker Functional
- The `LinkCheckerTab` should call the actual backend API (`POST /api/link-checks`) rather than generating random mocks
- Remove the inline `setTimeout` mock and use `react-query`'s `useMutation`
- The local `FactCheckService` could serve as a **fallback** for offline mode

### Priority 5: Expand UI Component Library
The 4 components in `ui/` are a good start, but the main-app uses ~20+ shadcn components (Input, Label, Dialog, Collapsible, Skeleton, etc.). Consider:
- Adding a native `TextInput` wrapper
- Building a native `Skeleton` component for loading states
- Creating a `Toast`/`Snackbar` system instead of `Alert.alert()`

---

## Summary

The structural transition is **well-planned** — same screen hierarchy, same tab system, same types, same feature set. The gap is in the **data layer**: the expo-app is currently a UI shell with mock data. Connecting it to the existing Express backend (or a shared API) would instantly bring it to feature parity.

| Category | Status |
|---|---|
| Navigation & routing | ✅ Complete |
| Screen/tab structure | ✅ Complete |
| Type definitions | ✅ Complete |
| FactCheck analysis logic | ✅ Ported (but unused in UI) |
| Backend connectivity | ❌ Not started |
| Authentication | ⚠️ Guest-only stub |
| Data persistence | ❌ Not wired (AsyncStorage unused) |
| Real link checking | ❌ Mock data |
| UI polish & components | ⚠️ Partial |
