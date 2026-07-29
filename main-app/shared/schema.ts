import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // PPP-specific fields
  linksChecked: integer("links_checked").default(0),
  streakDays: integer("streak_days").default(0),
  trustScore: integer("trust_score").default(50),
  pauseCount: integer("pause_count").default(0),
  mindfulShares: integer("mindful_shares").default(0),
  completedLessons: integer("completed_lessons").default(0),
  lastActiveDate: timestamp("last_active_date"),
});

// Link checks table
export const linkChecks = pgTable("link_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  url: text("url").notNull(),
  title: text("title"),
  domain: text("domain"),
  verdict: varchar("verdict", { enum: ["verified", "misleading", "false", "pending"] }).notNull(),
  credibilityScore: integer("credibility_score"),
  biasRating: varchar("bias_rating", { enum: ["low", "medium", "high"] }),
  factCheckScore: integer("fact_check_score"),
  summary: text("summary"),
  sourceUrls: text("source_urls").array(),
  sourcesCount: integer("sources_count"),
  publicationDate: timestamp("publication_date"),
  checkedAt: timestamp("checked_at").defaultNow(),
  factCheckSources: text("fact_check_sources").array(),
});

// Feed posts table
export const feedPosts = pgTable("feed_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").references(() => users.id),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  linkCheckId: varchar("link_check_id").references(() => linkChecks.id),
  createdAt: timestamp("created_at").defaultNow(),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  sharesCount: integer("shares_count").default(0),
});

// Pause nudges table
export const pauseNudges = pgTable("pause_nudges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  nudgeType: varchar("nudge_type", { enum: ["reading", "emotional", "source", "context"] }).notNull(),
  prompt: text("prompt").notNull(),
  response: varchar("response", { enum: ["completed", "skipped", "dismissed"] }),
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

// Learning progress table
export const learningProgress = pgTable("learning_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  lessonId: varchar("lesson_id").notNull(),
  lessonTitle: text("lesson_title").notNull(),
  category: varchar("category", { enum: ["basics", "advanced", "expert"] }).notNull(),
  status: varchar("status", { enum: ["locked", "available", "in_progress", "completed"] }).notNull(),
  progressPercent: integer("progress_percent").default(0),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reports table
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  reportType: varchar("report_type", { enum: ["misinformation", "spam", "harassment", "other"] }).notNull(),
  targetUrl: text("target_url"),
  targetPostId: varchar("target_post_id"),
  description: text("description"),
  status: varchar("status", { enum: ["pending", "reviewed", "resolved", "dismissed"] }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertLinkCheck = typeof linkChecks.$inferInsert;
export type LinkCheck = typeof linkChecks.$inferSelect;

export type InsertFeedPost = typeof feedPosts.$inferInsert;
export type FeedPost = typeof feedPosts.$inferSelect;

export type InsertPauseNudge = typeof pauseNudges.$inferInsert;
export type PauseNudge = typeof pauseNudges.$inferSelect;

export type InsertLearningProgress = typeof learningProgress.$inferInsert;
export type LearningProgress = typeof learningProgress.$inferSelect;

export type InsertReport = typeof reports.$inferInsert;
export type Report = typeof reports.$inferSelect;

// Zod schemas for validation
export const insertLinkCheckSchema = createInsertSchema(linkChecks).omit({
  id: true,
  checkedAt: true,
});

export const insertFeedPostSchema = createInsertSchema(feedPosts).omit({
  id: true,
  createdAt: true,
  likesCount: true,
  commentsCount: true,
  sharesCount: true,
});

export const insertPauseNudgeSchema = createInsertSchema(pauseNudges).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
  status: true,
});

export const linkCheckUrlSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});
