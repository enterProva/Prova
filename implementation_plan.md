# Finish expo-app Transition

Complete the data layer, auth, and feature parity gaps between the main-app and expo-app.

## Open Questions

> [!IMPORTANT]
> **Backend URL**: What is the deployed URL of your main-app Express server? For now I'll use a configurable `API_BASE_URL` constant that defaults to `http://localhost:5000` — you can update it later.

## Proposed Changes

### API Client & React Query Infrastructure

Creates the data layer foundation that every other component depends on.

#### [NEW] [api.ts](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/services/api.ts)
- Centralized `API_BASE_URL` constant
- `apiRequest(method, path, data?)` function mirroring the [main-app queryClient.ts](file:///c:/Users/Felicia/Documents/Projects/Prova/main-app/client/src/lib/queryClient.ts)
- Uses `fetch` with JSON headers (no cookies — will use token-based auth for mobile)

#### [NEW] [queryClient.ts](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/services/queryClient.ts)
- `QueryClient` instance with the same defaults as the main-app (staleTime, retry, etc.)
- Default `queryFn` that calls `apiRequest` with the query key as the URL

#### [MODIFY] [App.tsx](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/App.tsx)
- Wrap the `NavigationContainer` with `QueryClientProvider`

---

### Auth & Storage Fix

#### [MODIFY] [useAuth.ts](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/hooks/useAuth.ts)
- Replace the `localStorage` fallback storage adapter with `@react-native-async-storage/async-storage` (already in `package.json`)
- Add a `useQuery` call to fetch the authenticated user from `/api/auth/user` (matching main-app behavior)
- Keep guest mode logic intact

#### [MODIFY] [AuthSelection.tsx](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/screens/AuthSelection.tsx)
- Wire `handleLogin` to open the backend's Google OAuth URL using `Linking.openURL`
- Add a proper redirect-back handler (deep link)

#### [MODIFY] [App.tsx](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/App.tsx)
- Add an auth-gated wrapper around the `Home` screen (port the `ProtectedRoute` pattern from the main-app)

---

### LinkChecker — Backend Integration

#### [MODIFY] [linkChecker.ts](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/services/linkChecker.ts)
- `checkLink()`: Call `POST /api/link-checks` via `apiRequest` instead of mock scraping
- `getRecentChecks()`: Call `GET /api/link-checks/recent`
- `getUserChecks()`: Call `GET /api/link-checks/user`
- Keep the local `FactCheckService` as an **offline fallback** when the API is unreachable

#### [MODIFY] [LinkCheckerTab.tsx](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/components/LinkCheckerTab.tsx)
- Replace the inline `setTimeout` mock with `useMutation` calling `LinkCheckerService.checkLink()`
- Replace local `recentChecks` state with `useQuery` calling `LinkCheckerService.getUserChecks()`
- Add loading skeleton states
- Make source URLs tappable using `Linking.openURL`

#### [MODIFY] [QuickCheckModal.tsx](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/components/QuickCheckModal.tsx)
- Add a `TextInput` for URL entry (currently has no input)
- Wire the "Run Check" button to `LinkCheckerService.checkLink()`
- Show loading indicator and result summary

---

### FeedTab — Backend Integration

#### [MODIFY] [FeedTab.tsx](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/components/FeedTab.tsx)
- Replace hardcoded dummy posts with `useQuery` fetching from `GET /api/feed`
- Keep dummy data as a fallback when API is unreachable
- Add pull-to-refresh using `RefreshControl`
- Remove the fake `setInterval` that generates random posts

---

### PauseNudgesTab — Interactive Upgrade

The expo-app's PauseNudgesTab is static content. The main-app version has rotating nudges, response buttons, categories, and real-time stats.

#### [MODIFY] [PauseNudgesTab.tsx](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/components/PauseNudgesTab.tsx)
- Port the `LESSONS` array and nudge rotation logic from [main-app pause-nudges-tab.tsx](file:///c:/Users/Felicia/Documents/Projects/Prova/main-app/client/src/components/tabs/pause-nudges-tab.tsx)
- Add "I reflected" / "I'll check first" response buttons with animated transitions
- Add nudge category cards (reading, emotional, critical, reflection)
- Add real-time stats tracking (pauses taken, mindful shares, streak)
- Wire to backend API endpoints (`GET /api/pause-nudges`, `POST /api/pause-nudges`)

---

### Profile & Remaining Tabs

#### [MODIFY] [ProfileTab.tsx](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/components/ProfileTab.tsx)
- Wire sign-out button to clear auth state and navigate back to Landing
- Wire "Create Account" button to navigate to Auth screen

#### [MODIFY] [LearnTab.tsx](file:///c:/Users/Felicia/Documents/Projects/Prova/expo-app/src/components/LearnTab.tsx)
- Fetch learning progress from `GET /api/learning/progress`
- Wire lesson completion to `PATCH /api/learning/progress/:lessonId`
- Keep static lesson data as fallback

---

## Verification Plan

### Manual Verification
- Run `npx expo start` and verify on Expo Go
- Test guest mode flow: Landing → Auth → Guest → Home → all tabs
- Test link checker with a real URL
- Test feed loading from API (with fallback when offline)
- Test pause nudge rotation and response flow
- Test profile sign-out navigation
