import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

const GUEST_KEY = "isGuest";

// Full user type covering Google users and guest users
export type User = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  name?: string;
  guest?: boolean;
  avatarUrl?: string | null;

  // Optional stats
  linksChecked?: number;
  streakDays?: number;
  trustScore?: number;
  completedLessons?: number;
};

export function useAuth() {
  const queryClient = useQueryClient();
  const [isGuest, setIsGuestState] = useState<boolean>(false);
  const [guestRestored, setGuestRestored] = useState(false);

  // Restore guest flag from sessionStorage
  useEffect(() => {
    const storedGuest = sessionStorage.getItem(GUEST_KEY) === "true";
    if (storedGuest) {
      console.log("[useAuth] guest flag found in sessionStorage:", storedGuest);
      setGuestRestored(true);
      setIsGuestState(true); // activate guest mode immediately on restore
    }
  }, []);

  // Fetch Google-authenticated user only if NOT in guest mode
  const { data: fetchedUser, isLoading, isFetching, error, refetch } = useQuery<User, Error>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user", { credentials: "include" });
      if (!res.ok) throw new Error("Not authenticated");
      return res.json();
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !isGuest, // <-- do NOT fetch if guest mode is active
  });

  // Current user: guest object overrides Google user
  const user: User | undefined = isGuest
    ? {
        id: "guestuser",
        name: "Guest User",
        email: null,
        guest: true,
        avatarUrl: null,
        linksChecked: 0,
        streakDays: 0,
        trustScore: 50,
        completedLessons: 0,
      }
    : fetchedUser;

  const isAuthenticated = !!user;

  // Persist guest mode in sessionStorage
  useEffect(() => {
    if (isGuest) {
      sessionStorage.setItem(GUEST_KEY, "true");
    } else if (!guestRestored) {
      sessionStorage.removeItem(GUEST_KEY);
    }
  }, [isGuest, guestRestored]);

  // Wrapped setter for guest mode
  const setIsGuest = (value: boolean) => {
    console.log("[useAuth] setIsGuest called with:", value);

    if (value) {
      // Cancel any in-flight Google user fetch and clear cached data
      queryClient.cancelQueries({ queryKey: ["/api/auth/user"] });
      queryClient.setQueryData<User | undefined>(["/api/auth/user"], undefined);
      setIsGuestState(true);
      sessionStorage.setItem(GUEST_KEY, "true");
    } else {
      setIsGuestState(false);
      sessionStorage.setItem(GUEST_KEY, "false");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      refetch(); // fetch Google user after disabling guest
    }
  };

  // Debug logging
  useEffect(() => {
    console.log("[useAuth] state update:", {
      user,
      isLoading,
      isFetching,
      error: error ? error.message : null,
      isGuest,
      isAuthenticated,
      guestRestored,
    });
  }, [user, isLoading, isFetching, error, isGuest, isAuthenticated, guestRestored]);

  return { user, isLoading, isFetching, isAuthenticated, isGuest, setIsGuest, refetch };
}
