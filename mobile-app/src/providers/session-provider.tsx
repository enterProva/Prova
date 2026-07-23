import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { router, type Href } from "expo-router";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";

import { apiJson, API_BASE_URL } from "@/lib/api";
import type { ApiUser, MobileAuthExchangeResponse, MobileSessionResponse } from "@/types/api";

WebBrowser.maybeCompleteAuthSession();

const SESSION_TOKEN_KEY = "prova.session.token";
const HAS_ENTERED_APP_KEY = "prova.app.entered";

async function getStoredValue(key: string) {
  if (Platform.OS === "web") {
    return window.localStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

async function setStoredValue(key: string, value: string) {
  if (Platform.OS === "web") {
    window.localStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function deleteStoredValue(key: string) {
  if (Platform.OS === "web") {
    window.localStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

type SessionContextValue = {
  completeAuthCode: (code: string) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  hasEnteredApp: boolean;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  token: string | null;
  user: ApiUser | null;
};

const SessionContext = createContext<SessionContextValue | null>(null);

async function persistEnteredApp() {
  await setStoredValue(HAS_ENTERED_APP_KEY, "true");
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [hasEnteredApp, setHasEnteredApp] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        const [storedToken, enteredAppValue] = await Promise.all([
          getStoredValue(SESSION_TOKEN_KEY),
          getStoredValue(HAS_ENTERED_APP_KEY),
        ]);

        if (!isMounted) return;

        setHasEnteredApp(enteredAppValue === "true");

        if (!storedToken) {
          setToken(null);
          setUser(null);
          return;
        }

        try {
          const session = await apiJson<MobileSessionResponse>("/api/mobile-auth/session", {
            token: storedToken,
          });

          if (!isMounted) return;

          setToken(storedToken);
          setUser(session.user);
        } catch {
          await deleteStoredValue(SESSION_TOKEN_KEY);

          if (!isMounted) return;

          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    }

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const completeAuthCode = async (code: string) => {
    const session = await apiJson<MobileAuthExchangeResponse>("/api/mobile-auth/exchange", {
      method: "POST",
      body: { code },
    });

    await Promise.all([
      setStoredValue(SESSION_TOKEN_KEY, session.token),
      persistEnteredApp(),
    ]);

    setHasEnteredApp(true);
    setToken(session.token);
    setUser(session.user);
  };

  const signIn = async () => {
    const redirectUri = Linking.createURL("/auth/callback");
    const authUrl = `${API_BASE_URL}/api/mobile-auth/login?redirectUri=${encodeURIComponent(
      redirectUri
    )}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type !== "success" || !result.url) {
      return;
    }

    const callbackUrl = new URL(result.url);
    const code = callbackUrl.searchParams.get("code");

    if (!code) {
      throw new Error("No auth code was returned from the sign-in flow.");
    }

    await completeAuthCode(code);
    router.replace("/feed" as Href);
  };

  const continueAsGuest = async () => {
    await persistEnteredApp();
    setHasEnteredApp(true);
    router.replace("/feed" as Href);
  };

  const signOut = async () => {
    try {
      if (token) {
        await apiJson("/api/mobile-auth/logout", {
          method: "POST",
          token,
        });
      }
    } catch {
      // best-effort logout
    } finally {
      await deleteStoredValue(SESSION_TOKEN_KEY);
      setToken(null);
      setUser(null);
      setHasEnteredApp(false);
      router.replace("/sign-in" as Href);
    }
  };

  const value = useMemo<SessionContextValue>(
    () => ({
      completeAuthCode,
      continueAsGuest,
      hasEnteredApp,
      isAuthenticated: !!user,
      isBootstrapping,
      signIn,
      signOut,
      token,
      user,
    }),
    [hasEnteredApp, isBootstrapping, token, user]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);

  if (!value) {
    throw new Error("useSession must be used inside SessionProvider.");
  }

  return value;
}
