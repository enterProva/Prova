import type { Application, Request, Response, NextFunction, RequestHandler } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy, VerifyCallback } from "passport-google-oauth20";
import session from "express-session";
import MemoryStore from "memorystore";
import { FirestoreStorage } from "./storage.firestore";
export const storage = new FirestoreStorage();

// ----------------------
// Session middleware
// ----------------------
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

// ----------------------
// Passport setup
// ----------------------
export function setupAuth(app: Application) {
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `${process.env.BASE_URL || "http://localhost:3000"}/api/callback`,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback
      ) => {
        try {
          const user = await storage.upsertUser({
            id: profile.id,
            email: profile.emails?.[0]?.value,
            profileImageUrl: profile.photos?.[0]?.value,
          });
          done(null, user);
        } catch (err) {
          done(err as Error, undefined);
        }
      }
    )
  );

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // ----------------------
  // Auth routes
  // ----------------------
  app.get("/api/login", passport.authenticate("google", { scope: ["openid", "email", "profile"] }));

  app.get(
    "/api/callback",
    passport.authenticate("google", { failureRedirect: "/api/login" }),
    (req: Request, res: Response) => {
      // Redirect to frontend home after successful login
      const frontendHome = process.env.FRONTEND_URL || "http://localhost:3000/home";
      res.redirect(frontendHome);
    }
  );

  app.get("/api/logout", (req: Request, res: Response, next: NextFunction) => {
    req.logout(err => {
      if (err) return next(err);
      res.redirect(process.env.FRONTEND_URL || "http://localhost:3000");
    });
  });
}

// ----------------------
// Auth middleware
// ----------------------
export const isAuthenticated: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
