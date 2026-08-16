# Tasks: Finish expo-app Transition

## API Client & React Query
- [ ] Create `src/services/api.ts` — centralized API client
- [ ] Create `src/services/queryClient.ts` — QueryClient instance
- [ ] Update `App.tsx` — add QueryClientProvider

## Auth & Storage
- [ ] Fix `useAuth.ts` — AsyncStorage + useQuery for real auth
- [ ] Update `AuthSelection.tsx` — wire login + deep link
- [ ] Add auth guard to Home screen in `App.tsx`

## Component Integration
- [ ] Update `linkChecker.ts` service — real API calls
- [ ] Update `LinkCheckerTab.tsx` — useMutation/useQuery
- [ ] Update `QuickCheckModal.tsx` — add URL input + real check
- [ ] Update `FeedTab.tsx` — useQuery + pull-to-refresh
- [ ] Update `PauseNudgesTab.tsx` — interactive nudges + API
- [ ] Update `ProfileTab.tsx` — sign-out + navigation
- [ ] Update `LearnTab.tsx` — API progress tracking
