import { useState, useEffect } from "react";

const GUEST_KEY = "isGuest";
const GUEST_PROFILE_KEY = "guestProfile";

export type User = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  name?: string;
  guest?: boolean;
  avatarUrl?: string | null;
  linksChecked?: number;
  streakDays?: number;
  trustScore?: number;
  completedLessons?: number;
  // optional demo flags
  role?: string;
  fullAccess?: boolean;
};

type Subscriber = () => void;

// Simple in-module auth store so multiple hook instances share state
const authStore: {
  isGuest: boolean;
  guestProfile: Partial<User> | null;
  subscribers: Set<Subscriber>;
} = {
  isGuest: false,
  guestProfile: null,
  subscribers: new Set(),
};

// Initialize store from sessionStorage (safe-guarded)
try {
  const rawGuest = sessionStorage.getItem(GUEST_KEY);
  authStore.isGuest = rawGuest === "true";
  const rawProfile = sessionStorage.getItem(GUEST_PROFILE_KEY);
  if (rawProfile) authStore.guestProfile = JSON.parse(rawProfile);
} catch (e) {
  // ignore (e.g., SSR or restricted storage)
}

function notifySubscribers() {
  authStore.subscribers.forEach((cb) => cb());
}

function setIsGuestStore(value: boolean) {
  console.log("[useAuth-store] setIsGuest called with:", value);
  authStore.isGuest = value;
  try {
    sessionStorage.setItem(GUEST_KEY, value ? "true" : "false");
  } catch (e) {
    // ignore storage failures
  }
  notifySubscribers();
}

function setGuestProfileStore(profile: Partial<User> | null) {
  authStore.guestProfile = profile;
  try {
    if (profile) sessionStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
    else sessionStorage.removeItem(GUEST_PROFILE_KEY);
  } catch (e) {
    // ignore
  }
  notifySubscribers();
}

export function useAuth() {
  const [isGuest, setIsGuestState] = useState<boolean>(authStore.isGuest);
  const [guestProfile, setGuestProfileState] = useState<Partial<User> | null>(authStore.guestProfile);

  // Subscribe to store updates
  useEffect(() => {
    const sub = () => {
      setIsGuestState(authStore.isGuest);
      setGuestProfileState(authStore.guestProfile);
    };
    authStore.subscribers.add(sub);
    return () => {
      authStore.subscribers.delete(sub);
    };
  }, []);

  const isLoading = false;
  const isFetching = false;
  const error = null as Error | null;

  const user: User | undefined = isGuest
    ? {
        id: "guestuser",
        name: guestProfile?.name ?? "Guest User",
        email: guestProfile?.email ?? null,
        guest: true,
        avatarUrl: guestProfile?.avatarUrl ?? null,
        linksChecked: guestProfile?.linksChecked ?? 0,
        streakDays: guestProfile?.streakDays ?? 0,
        trustScore: guestProfile?.trustScore ?? 50,
        completedLessons: guestProfile?.completedLessons ?? 0,
        role: (guestProfile as any)?.role,
        fullAccess: (guestProfile as any)?.fullAccess,
      }
    : undefined;

  const isAuthenticated = !!user;

  const setIsGuest = (value: boolean) => {
    setIsGuestStore(value);
  };

  const setGuestProfile = (profile: Partial<User> | null) => {
    setGuestProfileStore(profile);
  };

  const hasFullAccess = !isGuest || (guestProfile && (guestProfile as any).role === "judge") || (guestProfile && (guestProfile as any).fullAccess === true);

  useEffect(() => {
    console.log("[useAuth] state update:", {
      user,
      isLoading,
      isFetching,
      error: error ? error.message : null,
      isGuest,
      isAuthenticated,
      guestProfile,
    });
  }, [user, isLoading, isFetching, error, isGuest, isAuthenticated, guestProfile]);

  return { user, isLoading, isFetching, isAuthenticated, isGuest, setIsGuest, setGuestProfile, hasFullAccess };
}
