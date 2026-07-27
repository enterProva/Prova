import type { Application, NextFunction, Request, RequestHandler, Response } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy, VerifyCallback } from "passport-google-oauth20";
import session from "express-session";
import MemoryStore from "memorystore";

import { FirestoreStorage } from "./storage.firestore";

export const storage = new FirestoreStorage();

export function getSession() {
  const MemorySessionStore = MemoryStore(session);

  return session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 86400000,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
    store: new MemorySessionStore({
      checkPeriod: 86400000,
    }),
  });
}

export function setupAuth(app: Application) {
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `${process.env.BASE_URL || "http://localhost:5000"}/api/callback`,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: any,
        done: VerifyCallback
      ) => {
        try {
          const user = await storage.upsertUser({
            id: profile.id,
            email: profile.emails?.[0]?.value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            profileImageUrl: profile.photos?.[0]?.value,
          });

          done(null, user);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );

  passport.serializeUser((user: Express.User, callback) => callback(null, user));
  passport.deserializeUser((user: Express.User, callback) => callback(null, user));

  app.get("/api/login", passport.authenticate("google", { scope: ["openid", "email", "profile"] }));

  app.get(
    "/api/callback",
    passport.authenticate("google", { failureRedirect: "/api/login" }),
    (_req: Request, res: Response) => {
      const frontendHome = process.env.FRONTEND_URL || "http://localhost:3000/home";
      res.redirect(frontendHome);
    }
  );

  app.get("/api/logout", (req: Request, res: Response, next: NextFunction) => {
    req.logout((error) => {
      if (error) {
        next(error);
        return;
      }

      res.redirect(process.env.FRONTEND_URL || "http://localhost:3000");
    });
  });
}

export const isAuthenticated: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const hasWebSession = req.isAuthenticated() && req.user;
  const hasMobileSession = !!(req as any).mobileUser;

  if (!hasWebSession && !hasMobileSession) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
};
