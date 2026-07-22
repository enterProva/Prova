export type Verdict = "verified" | "misleading" | "false" | "pending";
export type BiasRating = "low" | "medium" | "high";
export type PauseNudgeType = "reading" | "emotional" | "source" | "context";
export type PauseNudgeResponse = "completed" | "skipped" | "dismissed";
export type LessonCategory = "basics" | "advanced" | "expert";
export type LessonStatus = "locked" | "available" | "in_progress" | "completed";

export type ApiUser = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  profileImageUrl?: string | null;
  avatarUrl?: string | null;
  guest?: boolean;
  linksChecked?: number | null;
  streakDays?: number | null;
  trustScore?: number | null;
  completedLessons?: number | null;
  pauseCount?: number | null;
  mindfulShares?: number | null;
};

export type LinkCheckResult = {
  id: string;
  url: string;
  title?: string | null;
  verdict: Verdict;
  credibilityScore?: number | null;
  biasRating?: BiasRating | null;
  factCheckScore?: number | null;
  sourcesCount?: number | null;
  publicationDate?: string;
  factCheckSources?: string[] | null;
  sources?: string[] | null;
  summary?: string;
  checkedAt: string;
  domain?: string;
};

export type FeedPost = {
  id: string;
  content: string;
  createdAt: string;
  imageUrl?: string | null;
  likesCount?: number | null;
  commentsCount?: number | null;
  sharesCount?: number | null;
  author?: ApiUser | null;
  linkCheck?: LinkCheckResult | null;
};

export type PauseNudge = {
  id: string;
  createdAt: string;
  respondedAt?: string | null;
  userId?: string | null;
  nudgeType: PauseNudgeType;
  prompt: string;
  response?: PauseNudgeResponse | null;
};

export type LearningProgress = {
  id: string;
  userId?: string | null;
  lessonId: string;
  lessonTitle: string;
  category: LessonCategory;
  status: LessonStatus;
  progressPercent?: number | null;
  completedAt?: string | null;
  createdAt?: string | null;
};

export type MobileAuthExchangeResponse = {
  expiresAt: string;
  token: string;
  user: ApiUser;
};

export type MobileSessionResponse = {
  user: ApiUser;
};
