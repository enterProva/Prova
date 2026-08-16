// storage.firestore.ts
import { db } from "./firebase"; // your Firestore init
import { randomUUID } from "crypto";
import {
  User,
  UpsertUser,
  LinkCheck,
  InsertLinkCheck,
  FeedPost,
  InsertFeedPost,
  PauseNudge,
  InsertPauseNudge,
  LearningProgress,
  InsertLearningProgress,
  Report,
  InsertReport,
} from "@shared/schema";

// ----------------- LOCAL STORAGE INTERFACE -----------------
interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(userData: UpsertUser): Promise<User>;
  updateUserStats(userId: string, stats: Partial<User>): Promise<User>;

  createLinkCheck(data: InsertLinkCheck): Promise<LinkCheck>;
  updateLinkCheckDecision(id: string, userDecision: "real" | "not-real" | "unsure"): Promise<LinkCheck>;
  getLinkCheck(id: string): Promise<LinkCheck | undefined>;
  getUserLinkChecks(userId: string, limit?: number): Promise<LinkCheck[]>;
  getRecentLinkChecks(limit?: number): Promise<LinkCheck[]>;

  createFeedPost(data: InsertFeedPost): Promise<FeedPost>;
  getFeedPosts(limit?: number): Promise<FeedPost[]>;
  getUserFeedPosts(userId: string, limit?: number): Promise<FeedPost[]>;

  createPauseNudge(data: InsertPauseNudge): Promise<PauseNudge>;
  getUserPauseNudges(userId: string, limit?: number): Promise<PauseNudge[]>;
  updatePauseNudgeResponse(id: string, response: string): Promise<PauseNudge>;

  getUserLearningProgress(userId: string): Promise<LearningProgress[]>;
  updateLearningProgress(userId: string, lessonId: string, progress: Partial<LearningProgress>): Promise<LearningProgress>;

  createReport(data: InsertReport): Promise<Report>;
  getUserReports(userId: string): Promise<Report[]>;
}

// ----------------- REVIVE HELPERS -----------------
function reviveUser(doc: any, id?: string): User {
  return {
    id: id ?? doc.id,
    email: doc.email ?? null,
    firstName: doc.firstName ?? null,
    lastName: doc.lastName ?? null,
    profileImageUrl: doc.profileImageUrl ?? null,
    linksChecked: doc.linksChecked ?? 0,
    streakDays: doc.streakDays ?? 1,
    trustScore: doc.trustScore ?? 75,
    pauseCount: doc.pauseCount ?? 0,
    mindfulShares: doc.mindfulShares ?? 0,
    completedLessons: doc.completedLessons ?? 0,
    lastActiveDate: doc.lastActiveDate ? new Date(doc.lastActiveDate) : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : null,
  };
}

function reviveLinkCheck(doc: any, id?: string): LinkCheck {
  return {
    id: id ?? doc.id,
    userId: doc.userId ?? null,
    checkedAt: doc.checkedAt ? new Date(doc.checkedAt) : null,
    url: doc.url,
    title: doc.title ?? null,
    verdict: doc.verdict,
    finalVerdict: doc.finalVerdict ?? doc.verdict ?? null,
    userDecision: doc.userDecision ?? null,
    credibilityScore: doc.credibilityScore ?? null,
    biasRating: doc.biasRating ?? null,
    factCheckScore: doc.factCheckScore ?? null,
    sourcesCount: doc.sourcesCount ?? null,
    publicationDate: doc.publicationDate ?? null,
    factCheckSources: doc.factCheckSources ?? null,
  };
}

function reviveFeedPost(doc: any, id?: string): FeedPost {
  return {
    id: id ?? doc.id,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : null,
    authorId: doc.authorId ?? null,
    content: doc.content,
    imageUrl: doc.imageUrl ?? null,
    linkCheckId: doc.linkCheckId ?? null,
    likesCount: doc.likesCount ?? null,
    commentsCount: doc.commentsCount ?? null,
    sharesCount: doc.sharesCount ?? null,
  };
}

function revivePauseNudge(doc: any, id?: string): PauseNudge {
  return {
    id: id ?? doc.id,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : null,
    userId: doc.userId ?? null,
    respondedAt: doc.respondedAt ? new Date(doc.respondedAt) : null,
    nudgeType: doc.nudgeType,
    prompt: doc.prompt,
    response: doc.response ?? null,
  };
}

function reviveLearningProgress(doc: any, id?: string): LearningProgress {
  return {
    id: id ?? doc.id,
    userId: doc.userId ?? null,
    lessonId: doc.lessonId,
    lessonTitle: doc.lessonTitle,
    category: doc.category,
    status: doc.status,
    progressPercent: doc.progressPercent ?? 0,
    completedAt: doc.completedAt ? new Date(doc.completedAt) : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : null,
  };
}

function reviveReport(doc: any, id?: string): Report {
  return {
    id: id ?? doc.id,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : null,
    reviewedAt: doc.reviewedAt ? new Date(doc.reviewedAt) : null,
    userId: doc.userId ?? null,
    status: doc.status ?? "pending",
    reportType: doc.reportType,
    targetUrl: doc.targetUrl ?? null,
    targetPostId: doc.targetPostId ?? null,
    description: doc.description ?? null,
  };
}

// ----------------- FIRESTORE STORAGE CLASS -----------------
export class FirestoreStorage implements IStorage {
  // ----------------- USERS -----------------
  async getUser(id: string): Promise<User | undefined> {
    const doc = await db.collection("users").doc(id).get();
    return doc.exists ? reviveUser(doc.data(), doc.id) : undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id || randomUUID();
    const ref = db.collection("users").doc(id);
    const existing = await ref.get();
    const now = new Date();

    if (existing.exists) {
      const updated = { ...existing.data(), ...userData, updatedAt: now };
      await ref.set(updated);
      return reviveUser(updated, id);
    } else {
      const newUser: User = {
        id,
        email: userData.email ?? null,
        firstName: userData.firstName ?? null,
        lastName: userData.lastName ?? null,
        profileImageUrl: userData.profileImageUrl ?? null,
        linksChecked: 0,
        streakDays: 1,
        trustScore: 75,
        pauseCount: 0,
        mindfulShares: 0,
        completedLessons: 0,
        lastActiveDate: now,
        createdAt: now,
        updatedAt: now,
      };
      await ref.set(newUser);
      return newUser;
    }
  }

  async updateUserStats(userId: string, stats: Partial<User>): Promise<User> {
    const ref = db.collection("users").doc(userId);
    await ref.update({ ...stats, updatedAt: new Date() });
    const updated = await ref.get();
    return reviveUser(updated.data()!, userId);
  }

  // ----------------- LINK CHECKS -----------------
  async createLinkCheck(linkCheckData: InsertLinkCheck): Promise<LinkCheck> {
    const id = randomUUID();
    const data: LinkCheck = {
      id,
      userId: linkCheckData.userId ?? null,
      checkedAt: new Date(),
      url: linkCheckData.url,
      title: linkCheckData.title ?? null,
      verdict: linkCheckData.verdict,
      finalVerdict: linkCheckData.finalVerdict ?? linkCheckData.verdict ?? null,
      userDecision: linkCheckData.userDecision ?? null,
      credibilityScore: linkCheckData.credibilityScore ?? null,
      biasRating: linkCheckData.biasRating ?? null,
      factCheckScore: linkCheckData.factCheckScore ?? null,
      sourcesCount: linkCheckData.sourcesCount ?? null,
      publicationDate: linkCheckData.publicationDate ?? null,
      factCheckSources: linkCheckData.factCheckSources ?? null,
    };
    await db.collection("linkChecks").doc(id).set({ ...data, checkedAt: (data.checkedAt ?? new Date()).toISOString() });
    return data;
  }

  async updateLinkCheckDecision(id: string, userDecision: "real" | "not-real" | "unsure"): Promise<LinkCheck> {
    const ref = db.collection("linkChecks").doc(id);
    const snapshot = await ref.get();

    if (!snapshot.exists) {
      throw new Error("Link check not found");
    }

    const mappedVerdict = userDecision === "real" ? "verified" : userDecision === "not-real" ? "false" : "pending";
    const updateData = {
      userDecision,
      finalVerdict: mappedVerdict,
      verdict: mappedVerdict,
    };

    await ref.update(updateData);
    const updated = await ref.get();
    return reviveLinkCheck(updated.data()!, id);
  }

  async getLinkCheck(id: string): Promise<LinkCheck | undefined> {
    const doc = await db.collection("linkChecks").doc(id).get();
    return doc.exists ? reviveLinkCheck(doc.data()!, id) : undefined;
  }

  async getUserLinkChecks(userId: string, limit = 10): Promise<LinkCheck[]> {
    // Defensive: don't pass undefined into Firestore queries
    if (!userId) {
      console.warn("getUserLinkChecks called with empty userId");
      return [];
    }

    const safeLimit = Math.max(1, Math.floor(limit));

    const snapshot = await db
      .collection("linkChecks")
      .where("userId", "==", userId)
      .orderBy("checkedAt", "desc")
      .limit(safeLimit)
      .get();
    return snapshot.docs.map((doc) => reviveLinkCheck(doc.data(), doc.id));
  }

  async getRecentLinkChecks(limit = 10): Promise<LinkCheck[]> {
    const safeLimit = Math.max(1, Math.floor(limit));
    const snapshot = await db
      .collection("linkChecks")
      .orderBy("checkedAt", "desc")
      .limit(safeLimit)
      .get();
    return snapshot.docs.map((doc) => reviveLinkCheck(doc.data(), doc.id));
  }

  // ----------------- FEED POSTS -----------------
  async createFeedPost(postData: InsertFeedPost): Promise<FeedPost> {
    const id = randomUUID();
    const post: FeedPost = {
      id,
      createdAt: new Date(),
      authorId: postData.authorId ?? null,
      content: postData.content,
      imageUrl: postData.imageUrl ?? null,
      linkCheckId: postData.linkCheckId ?? null,
      likesCount: postData.likesCount ?? null,
      commentsCount: postData.commentsCount ?? null,
      sharesCount: postData.sharesCount ?? null,
    };
    await db.collection("feedPosts").doc(id).set({ ...post, createdAt: (post.createdAt ?? new Date()).toISOString() });
    return post;
  }

  async getFeedPosts(limit = 20): Promise<FeedPost[]> {
    const safeLimit = Math.max(1, Math.floor(limit));
    const snapshot = await db.collection("feedPosts").orderBy("createdAt", "desc").limit(safeLimit).get();
    return snapshot.docs.map((doc) => reviveFeedPost(doc.data(), doc.id));
  }

  async getUserFeedPosts(userId: string, limit = 20): Promise<FeedPost[]> {
    if (!userId) {
      console.warn("getUserFeedPosts called with empty userId");
      return [];
    }

    const safeLimit = Math.max(1, Math.floor(limit));
    const snapshot = await db
      .collection("feedPosts")
      .where("authorId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(safeLimit)
      .get();
    return snapshot.docs.map((doc) => reviveFeedPost(doc.data(), doc.id));
  }

  // ----------------- PAUSE NUDGES -----------------
  async createPauseNudge(nudgeData: InsertPauseNudge): Promise<PauseNudge> {
    const id = randomUUID();
    const nudge: PauseNudge = {
      id,
      createdAt: new Date(),
      userId: nudgeData.userId ?? null,
      respondedAt: null,
      nudgeType: nudgeData.nudgeType,
      prompt: nudgeData.prompt,
      response: nudgeData.response ?? null,
    };
    await db.collection("pauseNudges").doc(id).set({ ...nudge, createdAt: (nudge.createdAt ?? new Date()).toISOString() });
    return nudge;
  }

  async getUserPauseNudges(userId: string, limit = 10): Promise<PauseNudge[]> {
    if (!userId) {
      console.warn("getUserPauseNudges called with empty userId");
      return [];
    }

    const safeLimit = Math.max(1, Math.floor(limit));
    const snapshot = await db
      .collection("pauseNudges")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(safeLimit)
      .get();
    return snapshot.docs.map((doc) => revivePauseNudge(doc.data(), doc.id));
  }

  async updatePauseNudgeResponse(id: string, response: string): Promise<PauseNudge> {
    const ref = db.collection("pauseNudges").doc(id);
    await ref.update({ response, respondedAt: new Date().toISOString() });
    const doc = await ref.get();
    return revivePauseNudge(doc.data()!, doc.id);
  }

  // ----------------- LEARNING PROGRESS -----------------
  async getUserLearningProgress(userId: string): Promise<LearningProgress[]> {
    if (!userId) {
      console.warn("getUserLearningProgress called with empty userId");
      return [];
    }

    const snapshot = await db.collection("learningProgress").where("userId", "==", userId).get();
    return snapshot.docs.map((doc) => reviveLearningProgress(doc.data(), doc.id));
  }

  async updateLearningProgress(userId: string, lessonId: string, progress: Partial<LearningProgress>): Promise<LearningProgress> {
    if (!userId || !lessonId) throw new Error("Missing userId or lessonId");

    const snapshot = await db
      .collection("learningProgress")
      .where("userId", "==", userId)
      .where("lessonId", "==", lessonId)
      .limit(1)
      .get();

    if (snapshot.empty) throw new Error("Learning progress not found");

    const doc = snapshot.docs[0];
    const updated = { ...doc.data(), ...progress };
    await doc.ref.set(updated);
    return reviveLearningProgress(updated, doc.id);
  }

  // ----------------- REPORTS -----------------
  async createReport(reportData: InsertReport): Promise<Report> {
    const id = randomUUID();
    const report: Report = {
      id,
      createdAt: new Date(),
      reviewedAt: null,
      userId: reportData.userId ?? null,
      status: reportData.status ?? "pending",
      reportType: reportData.reportType,
      targetUrl: reportData.targetUrl ?? null,
      targetPostId: reportData.targetPostId ?? null,
      description: reportData.description ?? null,
    };
    await db.collection("reports").doc(id).set({ ...report, createdAt: (report.createdAt ?? new Date()).toISOString() });
    return report;
  }

  async getUserReports(userId: string): Promise<Report[]> {
    if (!userId) {
      console.warn("getUserReports called with empty userId");
      return [];
    }

    const snapshot = await db.collection("reports").where("userId", "==", userId).get();
    return snapshot.docs.map((doc) => reviveReport(doc.data(), doc.id));
  }
}
