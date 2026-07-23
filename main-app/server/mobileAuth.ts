import type { Application, Request, RequestHandler } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy, VerifyCallback } from "passport-google-oauth20";
import { randomUUID } from "crypto";

import { FirestoreStorage } from "./storage.firestore";

const storage = new FirestoreStorage();

const MOBILE_AUTH_CODE_TTL_MS = 5 * 60 * 1000;
const MOBILE_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type AuthenticatedUser = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  profileImageUrl?: string | null;
  avatarUrl?: string | null;
  linksChecked?: number | null;
  streakDays?: number | null;
  trustScore?: number | null;
  completedLessons?: number | null;
};

type MobileAuthCodeRecord = {
  expiresAt: number;
  user: AuthenticatedUser;
};

type MobileSessionRecord = {
  expiresAt: number;
  user: AuthenticatedUser;
};

const mobileAuthCodes = new Map<string, MobileAuthCodeRecord>();
const mobileSessions = new Map<string, MobileSessionRecord>();

function getBaseUrl() {
  return process.env.BASE_URL || "http://localhost:5000";
}

function cleanExpiredSessions() {
  const now = Date.now();

  for (const [code, record] of Array.from(mobileAuthCodes.entries())) {
    if (record.expiresAt <= now) {
      mobileAuthCodes.delete(code);
    }
  }

  for (const [token, record] of Array.from(mobileSessions.entries())) {
    if (record.expiresAt <= now) {
      mobileSessions.delete(token);
    }
  }
}

function encodeState(value: Record<string, string>) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeState(state?: string) {
  if (!state) return null;

  try {
    const raw = Buffer.from(state, "base64url").toString("utf8");
    const parsed = JSON.parse(raw);

    if (typeof parsed?.redirectUri === "string") {
      return parsed as { redirectUri: string };
    }
  } catch (error) {
    console.error("Failed to decode mobile auth state:", error);
  }

  return null;
}

function normalizeGoogleUser(profile: any): AuthenticatedUser {
  return {
    id: profile.id,
    email: profile.emails?.[0]?.value ?? null,
    firstName: profile.name?.givenName ?? null,
    lastName: profile.name?.familyName ?? null,
    name: profile.displayName ?? null,
    profileImageUrl: profile.photos?.[0]?.value ?? null,
    avatarUrl: profile.photos?.[0]?.value ?? null,
  };
}

function isSafeRedirectUri(redirectUri: string) {
  try {
    const parsed = new URL(redirectUri);
    return parsed.protocol !== "javascript:";
  } catch {
    return false;
  }
}

function appendCodeToRedirectUri(redirectUri: string, code: string) {
  const parsed = new URL(redirectUri);
  parsed.searchParams.set("code", code);
  return parsed.toString();
}

function createMobileAuthCode(user: AuthenticatedUser) {
  cleanExpiredSessions();

  const code = randomUUID();
  mobileAuthCodes.set(code, {
    expiresAt: Date.now() + MOBILE_AUTH_CODE_TTL_MS,
    user,
  });

  return code;
}

function createMobileSession(user: AuthenticatedUser) {
  cleanExpiredSessions();

  const token = randomUUID();
  const expiresAt = Date.now() + MOBILE_SESSION_TTL_MS;

  mobileSessions.set(token, {
    expiresAt,
    user,
  });

  return { expiresAt, token };
}

function getBearerToken(req: Request) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

export function normalizeUser(user: any) {
  const derivedName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  const name = (user?.name ?? derivedName) || null;

  return {
    id: user?.id ?? user?.claims?.sub ?? "unknown",
    email: user?.email ?? null,
    firstName: user?.firstName ?? null,
    lastName: user?.lastName ?? null,
    name,
    profileImageUrl: user?.profileImageUrl ?? user?.avatarUrl ?? null,
    avatarUrl: user?.avatarUrl ?? user?.profileImageUrl ?? null,
    linksChecked: user?.linksChecked ?? null,
    streakDays: user?.streakDays ?? null,
    trustScore: user?.trustScore ?? null,
    completedLessons: user?.completedLessons ?? null,
    pauseCount: user?.pauseCount ?? null,
    mindfulShares: user?.mindfulShares ?? null,
  };
}

export const mobileAuthSessionMiddleware: RequestHandler = (req, _res, next) => {
  cleanExpiredSessions();

  const token = getBearerToken(req);
  if (!token) {
    next();
    return;
  }

  const session = mobileSessions.get(token);
  if (!session) {
    next();
    return;
  }

  (req as any).mobileSessionToken = token;
  (req as any).mobileUser = session.user;
  next();
};

export function getAuthenticatedUser(req: Request) {
  return (req as any).mobileUser ?? (req as any).user ?? null;
}

export function getAuthenticatedUserId(req: Request) {
  const user = getAuthenticatedUser(req);
  return user?.id ?? user?.claims?.sub ?? null;
}

export function setupMobileAuth(app: Application) {
  const callbackURL = `${getBaseUrl()}/api/mobile-auth/callback`;

  passport.use(
    "google-mobile",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: any,
        done: VerifyCallback
      ) => {
        try {
          const mobileUser = normalizeGoogleUser(profile);
          const user = await storage.upsertUser(mobileUser);

          done(null, {
            ...normalizeUser(user),
            name: mobileUser.name,
          });
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );

  app.get("/api/mobile-auth/login", (req, res, next) => {
    const redirectUri = String(req.query.redirectUri || "");

    if (!redirectUri || !isSafeRedirectUri(redirectUri)) {
      res.status(400).json({ message: "A valid redirectUri is required." });
      return;
    }

    const state = encodeState({ redirectUri });

    passport.authenticate("google-mobile", {
      scope: ["openid", "email", "profile"],
      session: false,
      state,
    })(req, res, next);
  });

  app.get("/api/mobile-auth/callback", (req, res, next) => {
    passport.authenticate(
      "google-mobile",
      { session: false },
      (error: Error | null, user: AuthenticatedUser | undefined) => {
        if (error || !user) {
          next(error || new Error("Mobile authentication failed."));
          return;
        }

        const state = decodeState(typeof req.query.state === "string" ? req.query.state : undefined);
        if (!state?.redirectUri || !isSafeRedirectUri(state.redirectUri)) {
          res.status(400).send("Missing valid redirect URI.");
          return;
        }

        const code = createMobileAuthCode(user);
        res.redirect(appendCodeToRedirectUri(state.redirectUri, code));
      }
    )(req, res, next);
  });

  app.post("/api/mobile-auth/exchange", (req, res) => {
    cleanExpiredSessions();

    const code = typeof req.body?.code === "string" ? req.body.code : "";
    if (!code) {
      res.status(400).json({ message: "Auth code is required." });
      return;
    }

    const record = mobileAuthCodes.get(code);
    if (!record) {
      res.status(400).json({ message: "Auth code is invalid or expired." });
      return;
    }

    mobileAuthCodes.delete(code);

    const session = createMobileSession(record.user);
    res.json({
      expiresAt: new Date(session.expiresAt).toISOString(),
      token: session.token,
      user: normalizeUser(record.user),
    });
  });

  app.get("/api/mobile-auth/session", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    res.json({
      user: normalizeUser(user),
    });
  });

  app.post("/api/mobile-auth/logout", (req, res, next) => {
    const token = (req as any).mobileSessionToken as string | undefined;
    if (token) {
      mobileSessions.delete(token);
    }

    if (req.isAuthenticated?.()) {
      req.logout((error) => {
        if (error) {
          next(error);
          return;
        }

        res.json({ ok: true });
      });

      return;
    }

    res.json({ ok: true });
  });
}
