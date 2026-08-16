import { useState, useEffect, useCallback, useRef } from 'react';

const GUEST_KEY = 'isGuest';

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

// Simple storage implementation for web/mobile compatibility
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      // For React Native, this would use AsyncStorage
      return null;
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
      // For React Native, this would use AsyncStorage
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
      // For React Native, this would use AsyncStorage
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },
};

export function useAuth() {
  const [isGuest, setIsGuestState] = useState<boolean>(false);
  const [guestRestored, setGuestRestored] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | undefined>(undefined);
  const isInitialized = useRef(false);

  // Restore guest flag from storage (run once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    const restoreGuest = async () => {
      try {
        const storedGuest = await storage.getItem(GUEST_KEY);
        if (storedGuest === 'true') {
          console.log('[useAuth] guest flag found in storage:', storedGuest);
          setGuestRestored(true);
          setIsGuestState(true);
        }
      } catch (error) {
        console.error('[useAuth] Error restoring guest state:', error);
      } finally {
        setIsLoading(false);
        isInitialized.current = true;
      }
    };
    restoreGuest();
  }, []);

  // Current user: guest object overrides fetched user
  const currentUser: User | undefined = isGuest
    ? {
        id: 'guestuser',
        name: 'Guest User',
        email: null,
        guest: true,
        avatarUrl: null,
        linksChecked: 0,
        streakDays: 0,
        trustScore: 50,
        completedLessons: 0,
      }
    : user;

  const isAuthenticated = !!currentUser;

  // Persist guest mode in storage
  useEffect(() => {
    if (!isInitialized.current) return;
    
    const persistGuest = async () => {
      try {
        if (isGuest) {
          await storage.setItem(GUEST_KEY, 'true');
        } else if (!guestRestored) {
          await storage.removeItem(GUEST_KEY);
        }
      } catch (error) {
        console.error('[useAuth] Error persisting guest state:', error);
      }
    };
    persistGuest();
  }, [isGuest, guestRestored]);

  // Wrapped setter for guest mode
  const setIsGuest = useCallback(async (value: boolean) => {
    console.log('[useAuth] setIsGuest called with:', value);

    setIsGuestState(value);
    try {
      await storage.setItem(GUEST_KEY, value ? 'true' : 'false');
    } catch (error) {
      console.error('[useAuth] Error setting guest mode:', error);
    }
  }, []);

  // Set user (for when real auth is implemented)
  const setUserAuth = useCallback((userData: User | undefined) => {
    setUser(userData);
  }, []);

  return {
    user: currentUser,
    isLoading,
    isFetching: false,
    isAuthenticated,
    isGuest,
    setIsGuest,
    setUser: setUserAuth,
  } as const;
}

export default useAuth;
