import type { Express } from "express";
import { createServer, type Server } from "http";
import cors from "cors";
// Google OAuth removed for demo builds. Do not register Google auth here.
// Mobile auth removed for demo builds — run without server-side auth

// Helper: returns authenticated user id if available. With auth removed, always null.
function getAuthenticatedUserId(_req: any): string | null {
  return null;
}
import {
  insertFeedPostSchema,
  insertPauseNudgeSchema,
  insertReportSchema,
  linkCheckUrlSchema,
} from "@shared/schema";
import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { LinkAnalysisService } from "./services/linkAnalysisService";
import { FirestoreStorage } from "./storage.firestore";

export const storage = new FirestoreStorage();

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getHostname(value: string | null | undefined) {
  if (!value) return "";
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function getWordSet(value: string | null | undefined) {
  const text = normalizeText(value);
  return new Set(text ? text.split(" ").filter((word) => word.length > 2) : []);
}

function overlapScore(left: Set<string>, right: Set<string>) {
  if (left.size === 0 || right.size === 0) return 0;
  let matches = 0;
  left.forEach((word) => {
    if (right.has(word)) matches += 1;
  });
  return matches / Math.max(left.size, right.size);
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function applyLearningFeedback(analysis: any, recentChecks: any[] = []) {
  const currentDomain = getHostname(analysis?.url ?? "");
  const currentTitle = normalizeText(analysis?.title ?? analysis?.url ?? "");
  const currentWords = getWordSet(currentTitle);

  let totalBias = 0;
  let totalWeight = 0;

  for (const check of recentChecks) {
    if (!check) continue;

    const checkDomain = getHostname(check?.url ?? "");
    const sameDomain = !!currentDomain && !!checkDomain && currentDomain === checkDomain;
    const titleOverlap = overlapScore(currentWords, getWordSet(check?.title ?? check?.url ?? ""));
    const similarityWeight = sameDomain ? 0.7 : 0.2;
    const titleWeight = titleOverlap > 0 ? titleOverlap * 0.8 : 0;
    const combinedWeight = Math.max(0.15, similarityWeight + titleWeight);

    if (combinedWeight <= 0.15 && !sameDomain) continue;

    const verdict = check?.finalVerdict ?? check?.verdict ?? "pending";
    const userDecision = check?.userDecision ?? null;

    let drift = 0;
    if (userDecision === "real") drift += 9;
    if (userDecision === "not-real") drift -= 12;
    if (userDecision === "unsure") drift -= 2;
    if (verdict === "verified") drift += 8;
    if (verdict === "false") drift -= 10;
    if (verdict === "misleading") drift -= 6;
    if (verdict === "pending") drift -= 1;

    totalBias += drift * combinedWeight;
    totalWeight += combinedWeight;
  }

  if (totalWeight === 0) return analysis;

  const biasDelta = totalBias / totalWeight;
  const adjustedCredibility = clampNumber(analysis.credibilityScore + biasDelta, 0, 100);
  const adjustedFactCheck = clampNumber(analysis.factCheckScore + biasDelta * 0.8, 0, 100);

  let adjustedVerdict = analysis.verdict;
  if (biasDelta <= -12 && analysis.verdict === "pending") adjustedVerdict = "misleading";
  if (biasDelta >= 10 && analysis.verdict === "pending") adjustedVerdict = "verified";
  if (biasDelta <= -8 && analysis.verdict === "verified") adjustedVerdict = "misleading";

  return {
    ...analysis,
    credibilityScore: adjustedCredibility,
    factCheckScore: adjustedFactCheck,
    verdict: adjustedVerdict,
    summary:
      analysis.summary +
      (Math.abs(biasDelta) > 2
        ? " This result was adjusted by recent user feedback patterns for similar checks."
        : ""),
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS: allow the web client and Expo (web/native) in development.
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:8081",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8081",
  ].filter(Boolean) as string[];

  app.use(
    cors({
      origin(origin, callback) {
        // Native mobile apps don't send an Origin header.
        if (!origin || process.env.NODE_ENV !== "production" || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );

  // Auth removed for demo builds — do not register mobile auth or session middleware.

  // Auth routes
  app.get("/api/auth/user", (req: any, res) => {
    const guest = req.query.guest === "true"; // optional
    const mobileUser = (req as any).mobileUser ?? (req as any).user ?? null;
    if (mobileUser) return res.json(mobileUser);
    if (guest) return res.json({ id: "guest", name: "Guest User", guest: true });
    return res.status(401).json({ message: "Unauthorized" });
  });

  // POST new link-check
  app.post("/api/link-checks", async (req, res) => {
    try {
      const validatedData = linkCheckUrlSchema.parse(req.body);
      const userId = getAuthenticatedUserId(req);

      // Step 1-3: Scrape + AI-based fact check
      const analysis = await LinkAnalysisService.analyzeUrl(validatedData.url);
      const recentChecks = await storage.getRecentLinkChecks(50);
      const learningAdjusted = applyLearningFeedback(analysis, recentChecks);

      // Step 4: Save the result
      const linkCheck = await storage.createLinkCheck({
        url: learningAdjusted.url,
        userId,
        title: learningAdjusted.title || null,
        verdict: learningAdjusted.verdict,
        credibilityScore: learningAdjusted.credibilityScore,
        biasRating: learningAdjusted.biasRating,
        factCheckScore: learningAdjusted.factCheckScore,
        sourcesCount: learningAdjusted.sourcesCount,
        publicationDate: learningAdjusted.publicationDate ? new Date(learningAdjusted.publicationDate) : null,
        factCheckSources: learningAdjusted.sourceUrls,
      });

      // Return saved record + rich analysis to the frontend
      const configuredModel = process.env.GROQ_LINK_CHECK_MODEL?.trim() || "openai/gpt-oss-120b";
      const finalVerdict = linkCheck.finalVerdict ?? linkCheck.verdict;

      res.json({
        ...linkCheck,
        finalVerdict,
        verdict: finalVerdict,
        domain: learningAdjusted.domain,
        summary: learningAdjusted.summary,
        reasoning: learningAdjusted.reasoning ?? null,
        modelUsed: configuredModel,
        publicationDate: learningAdjusted.publicationDate,
        sources: learningAdjusted.sourceUrls,
        searchResults: learningAdjusted.searchResults ?? [],
        checkedAt: linkCheck.checkedAt
          ? linkCheck.checkedAt instanceof Date
            ? linkCheck.checkedAt.toISOString()
            : String(linkCheck.checkedAt)
          : new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error checking link:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid URL provided" });
      }
      res.status(500).json({ message: "Failed to check link" });
    }
  });

  app.patch("/api/link-checks/:id/decision", async (req, res) => {
    try {
      const { id } = req.params;
      const decisionSchema = z.enum(["real", "not-real", "unsure"]);
      const validated = decisionSchema.parse(req.body?.userDecision);

      const updated = await storage.updateLinkCheckDecision(id, validated);
      const configuredModel = process.env.GROQ_LINK_CHECK_MODEL?.trim() || "openai/gpt-oss-120b";

      res.json({
        ...updated,
        finalVerdict: updated.finalVerdict ?? updated.verdict,
        verdict: updated.finalVerdict ?? updated.verdict,
        modelUsed: configuredModel,
        checkedAt: updated.checkedAt ? updated.checkedAt.toISOString() : new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating link check decision:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user decision" });
      }
      res.status(500).json({ message: "Failed to update link check decision" });
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
  app.get("/api/link-checks/user", async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
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

  app.post("/api/feed", async (req: any, res) => {
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

  // Pause nudges routes
  app.get("/api/pause-nudges", async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.json([]);
      }
      const nudges = await storage.getUserPauseNudges(userId);
      res.json(nudges);
    } catch (error) {
      console.error("Error fetching pause nudges:", error);
      res.status(500).json({ message: "Failed to fetch pause nudges" });
    }
  });

  app.post("/api/pause-nudges", async (req, res) => {
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

  app.patch("/api/pause-nudges/:id/response", async (req, res) => {
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
  app.get("/api/learning/progress", async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.json([]);
      }
      const progress = await storage.getUserLearningProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching learning progress:", error);
      res.status(500).json({ message: "Failed to fetch learning progress" });
    }
  });

  app.patch("/api/learning/progress/:lessonId", async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
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
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
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

  app.get("/api/reports", async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.json([]);
      }
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
