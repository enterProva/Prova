import type { Express } from "express";
import { createServer, type Server } from "http";
import cors from "cors";
import { Request, Response, NextFunction } from "express";

import { setupAuth, isAuthenticated } from "./googleAuth";
import {
  getAuthenticatedUser,
  getAuthenticatedUserId,
  mobileAuthSessionMiddleware,
  normalizeUser,
  setupMobileAuth,
} from "./mobileAuth";
import {
  insertFeedPostSchema,
  insertPauseNudgeSchema,
  insertReportSchema,
  linkCheckUrlSchema,
} from "@shared/schema";
import { EnhancedLinkCheckerService } from "../client/src/services/EnhancedLinkCheckerService";
import { FirestoreStorage } from "./storage.firestore";

export const storage = new FirestoreStorage();

function getAllowedOrigins() {
  const configuredOrigins = [
    process.env.FRONTEND_URL,
    process.env.MOBILE_WEB_URL,
    process.env.EXPO_WEB_URL,
    process.env.API_ALLOWED_ORIGINS,
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  return new Set([
    "http://localhost:5173",
    "http://localhost:8081",
    "http://localhost:19006",
    ...configuredOrigins,
  ]);
}

function formatDateValue(value: Date | string | null | undefined) {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : String(value);
}

function getDomainFromUrl(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

function serializeLinkCheck(linkCheck: any, extra: Record<string, unknown> = {}) {
  return {
    ...linkCheck,
    checkedAt: formatDateValue(linkCheck.checkedAt) || new Date().toISOString(),
    domain: getDomainFromUrl(linkCheck.url),
    publicationDate: formatDateValue(linkCheck.publicationDate),
    sources: linkCheck.factCheckSources ?? [],
    ...extra,
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  const allowedOrigins = getAllowedOrigins();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} is not allowed by CORS.`));
      },
      credentials: true,
    })
  );

  await setupAuth(app);
  setupMobileAuth(app);
  app.use(mobileAuthSessionMiddleware);

  app.get("/api/auth/user", (req, res) => {
    const guest = req.query.guest === "true";
    const user = getAuthenticatedUser(req);

    if (user) {
      return res.json(normalizeUser(user));
    }

    if (guest) {
      return res.json({
        avatarUrl: null,
        email: null,
        guest: true,
        id: "guest",
        name: "Guest User",
        profileImageUrl: null,
      });
    }

    return res.status(401).json({ message: "Unauthorized" });
  });

  app.post("/api/link-checks", async (req, res) => {
    try {
      const validatedData = linkCheckUrlSchema.parse(req.body);
      const userId = getAuthenticatedUserId(req);

      const factCheckResult = await EnhancedLinkCheckerService.checkLink(validatedData.url);

      const linkCheck = await storage.createLinkCheck({
        url: validatedData.url,
        userId,
        title: factCheckResult.title || null,
        verdict: factCheckResult.verdict,
        credibilityScore: factCheckResult.credibilityScore,
        biasRating: factCheckResult.biasRating,
        factCheckScore: factCheckResult.factCheckScore,
        sourcesCount: factCheckResult.sourcesCount,
        publicationDate: factCheckResult.publicationDate || null,
        factCheckSources: factCheckResult.sources,
      });

      res.json(
        serializeLinkCheck(linkCheck, {
          summary: factCheckResult.summary,
        })
      );
    } catch (error) {
      console.error("Error checking link:", error);
      res.status(500).json({ message: "Failed to check link" });
    }
  });

  app.get("/api/link-checks/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const linkChecks = await storage.getRecentLinkChecks(limit);
      res.json(linkChecks.map((check) => serializeLinkCheck(check)));
    } catch (error) {
      console.error("Error fetching recent link checks:", error);
      res.status(500).json({ message: "Failed to fetch recent link checks" });
    }
  });

  app.get("/api/link-checks/user", async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        const recent = await storage.getRecentLinkChecks(limit);
        return res.json(recent.map((check) => serializeLinkCheck(check)));
      }

      const linkChecks = await storage.getUserLinkChecks(userId, limit);
      res.json(linkChecks.map((check) => serializeLinkCheck(check)));
    } catch (error) {
      console.error("Error fetching user link checks:", error);
      res.status(500).json({ message: "Failed to fetch user link checks" });
    }
  });

  app.get("/api/link-checks/:id", async (req, res) => {
    try {
      const linkCheck = await storage.getLinkCheck(req.params.id);
      if (!linkCheck) {
        res.status(404).json({ message: "Link check not found" });
        return;
      }

      res.json(serializeLinkCheck(linkCheck));
    } catch (error) {
      console.error("Error fetching link check:", error);
      res.status(500).json({ message: "Failed to fetch link check" });
    }
  });

  app.get("/api/feed", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const posts = await storage.getFeedPosts(limit);

      const enhancedPosts = await Promise.all(
        posts.map(async (post) => {
          const author = post.authorId ? await storage.getUser(post.authorId) : null;
          const linkCheck = post.linkCheckId ? await storage.getLinkCheck(post.linkCheckId) : null;

          return {
            ...post,
            author: author ? normalizeUser(author) : null,
            linkCheck: linkCheck ? serializeLinkCheck(linkCheck) : null,
          };
        })
      );

      res.json(enhancedPosts);
    } catch (error) {
      console.error("Error fetching feed:", error);
      res.status(500).json({ message: "Failed to fetch feed" });
    }
  });

  app.post("/api/feed", isAuthenticated, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const validatedData = insertFeedPostSchema.parse(req.body);

      const post = await storage.createFeedPost({
        ...validatedData,
        authorId: userId,
      });

      res.json(post);
    } catch (error) {
      console.error("Error creating feed post:", error);
      res.status(500).json({ message: "Failed to create feed post" });
    }
  });

  app.get("/api/pause-nudges", isAuthenticated, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const nudges = await storage.getUserPauseNudges(userId);
      res.json(nudges);
    } catch (error) {
      console.error("Error fetching pause nudges:", error);
      res.status(500).json({ message: "Failed to fetch pause nudges" });
    }
  });

  app.post("/api/pause-nudges", isAuthenticated, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const validatedData = insertPauseNudgeSchema.parse(req.body);

      const nudge = await storage.createPauseNudge({
        ...validatedData,
        userId,
      });

      res.json(nudge);
    } catch (error) {
      console.error("Error creating pause nudge:", error);
      res.status(500).json({ message: "Failed to create pause nudge" });
    }
  });

  app.patch("/api/pause-nudges/:id/response", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { response } = req.body;

      const updatedNudge = await storage.updatePauseNudgeResponse(id, response);
      res.json(updatedNudge);
    } catch (error) {
      console.error("Error updating pause nudge response:", error);
      res.status(500).json({ message: "Failed to update pause nudge response" });
    }
  });

  app.get("/api/learning/progress", isAuthenticated, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const progress = await storage.getUserLearningProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching learning progress:", error);
      res.status(500).json({ message: "Failed to fetch learning progress" });
    }
  });

  app.patch("/api/learning/progress/:lessonId", isAuthenticated, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const { lessonId } = req.params;
      const progressData = req.body;

      const updatedProgress = await storage.updateLearningProgress(userId, lessonId, progressData);
      res.json(updatedProgress);
    } catch (error) {
      console.error("Error updating learning progress:", error);
      res.status(500).json({ message: "Failed to update learning progress" });
    }
  });

  app.post("/api/reports", async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const validatedData = insertReportSchema.parse(req.body);

      const report = await storage.createReport({
        ...validatedData,
        userId,
      });

      res.json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  app.get("/api/reports", isAuthenticated, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const reports = await storage.getUserReports(userId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    const message = err?.message || "Internal server error";
    const status = err?.status || err?.statusCode || 500;
    res.status(status).json({ message });
  });

  const httpServer = createServer(app);
  return httpServer;
}
