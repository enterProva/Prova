import type { Express } from "express";
import { createServer, type Server } from "http";
import cors from "cors";
import { setupAuth, isAuthenticated } from "./googleAuth";
import {
  insertLinkCheckSchema,
  insertFeedPostSchema,
  insertPauseNudgeSchema,
  insertReportSchema,
  linkCheckUrlSchema,
} from "@shared/schema";
import axios from "axios";
import * as cheerio from "cheerio";
import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { EnhancedLinkCheckerService } from "../client/src/services/EnhancedLinkCheckerService";
import { FirestoreStorage } from "./storage.firestore";

export const storage = new FirestoreStorage();

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    })
  );

  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", (req: any, res) => {
    const guest = req.query.guest === "true"; // optional
    if (req.isAuthenticated() && req.user) {
      return res.json(req.user);
    } else if (guest) {
      return res.json({ id: "guest", name: "Guest User", guest: true });
    }
    return res.status(401).json({ message: "Unauthorized" });
  });

  // POST new link-check
app.post("/api/link-checks", async (req, res) => {
  try {
    const validatedData = linkCheckUrlSchema.parse(req.body);
    const userId = (req.user as any)?.claims?.sub || null;

    // Step 1-3: Scrape + AI-based fact check
    const factCheckResult = await EnhancedLinkCheckerService.checkLink(
      validatedData.url
    );

    // Step 4: Save the result
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

    // Return saved record to frontend immediately
    res.json({
      ...linkCheck,
      publicationDate: linkCheck.publicationDate
        ? linkCheck.publicationDate instanceof Date
          ? linkCheck.publicationDate.toISOString()
          : String(linkCheck.publicationDate)
        : undefined,
      checkedAt: linkCheck.checkedAt
        ? linkCheck.checkedAt instanceof Date
          ? linkCheck.checkedAt.toISOString()
          : String(linkCheck.checkedAt)
        : new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error checking link:", error);
    res.status(500).json({ message: "Failed to check link" });
  }
});

// GET recent link-checks
app.get("/api/link-checks/recent", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const linkChecks = await storage.getRecentLinkChecks(limit);
    res.json(linkChecks);
  } catch (error) {
    console.error("Error fetching recent link checks:", error);
    res.status(500).json({ message: "Failed to fetch recent link checks" });
  }
});

// GET user link-checks (fallback to recent if no login)
app.get("/api/link-checks/user", async (req: any, res) => {
  try {
    const userId = (req.user as any)?.claims?.sub ?? null;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      // not logged in → fallback to recent checks
      const recent = await storage.getRecentLinkChecks(limit);
      return res.json(recent);
    }

    const linkChecks = await storage.getUserLinkChecks(userId, limit);
    res.json(linkChecks);
  } catch (error) {
    console.error("Error fetching user link checks:", error);
    res.status(500).json({ message: "Failed to fetch user link checks" });
  }
});

  // Feed routes
  app.get("/api/feed", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const posts = await storage.getFeedPosts(limit);

      const enhancedPosts = await Promise.all(
        posts.map(async (post) => {
          const author = post.authorId ? await storage.getUser(post.authorId) : null;
          const linkCheck = post.linkCheckId
            ? await storage.getLinkCheck(post.linkCheckId)
            : null;
          return {
            ...post,
            author,
            linkCheck,
          };
        })
      );

      res.json(enhancedPosts);
    } catch (error) {
      console.error("Error fetching feed:", error);
      res.status(500).json({ message: "Failed to fetch feed" });
    }
  });

  app.post("/api/feed", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
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

  // Pause nudges routes
  app.get("/api/pause-nudges", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const nudges = await storage.getUserPauseNudges(userId);
      res.json(nudges);
    } catch (error) {
      console.error("Error fetching pause nudges:", error);
      res.status(500).json({ message: "Failed to fetch pause nudges" });
    }
  });

  app.post("/api/pause-nudges", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
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

  // Learning routes
  app.get("/api/learning/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const progress = await storage.getUserLearningProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching learning progress:", error);
      res.status(500).json({ message: "Failed to fetch learning progress" });
    }
  });

  app.patch("/api/learning/progress/:lessonId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const { lessonId } = req.params;
      const progressData = req.body;

      const updatedProgress = await storage.updateLearningProgress(
        userId,
        lessonId,
        progressData
      );
      res.json(updatedProgress);
    } catch (error) {
      console.error("Error updating learning progress:", error);
      res.status(500).json({ message: "Failed to update learning progress" });
    }
  });

  // Reports routes
  app.post("/api/reports", async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || null;
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

  app.get("/api/reports", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const reports = await storage.getUserReports(userId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // Global error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error", error: err.message });
    } else {
      next(err);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
