// client/src/services/linkChecker.ts
import { apiRequest } from "@/lib/queryClient";
import axios from "axios";

export async function fetchUserLinkChecks(limit = 10) {
  try {
    const response = await axios.get("/api/link-checks/user", {
      params: { limit },
      withCredentials: true, // ✅ important for sending session cookies
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user link checks:", error);
    return [];
  }
}

export interface LinkCheckResult {
  id: string;
  url: string;
  title?: string;
  domain?: string;
  verdict: "verified" | "misleading" | "false" | "pending";
  credibilityScore?: number;
  biasRating?: "low" | "medium" | "high";
  factCheckScore?: number;
  sourcesCount?: number;
  publicationDate?: string;
  sourceUrls?: string[];
  factCheckSources?: string[];
  sources?: string[];
  summary?: string;
  reasoning?: string;
  modelUsed?: string;
  searchResults?: unknown[];
  reason?: string;
  checkedAt: string;
}

function mapLinkCheckResult(data: any, fallbackUrl?: string): LinkCheckResult {
  const sourceUrls = Array.isArray(data.sourceUrls)
    ? data.sourceUrls
    : Array.isArray(data.sources)
      ? data.sources
      : data.factCheckSources ?? [];

  return {
    id: data.id,
    url: data.url ?? fallbackUrl ?? "",
    title: data.title ?? data.summary ?? "",
    domain: data.domain ?? undefined,
    verdict: data.verdict ?? "pending",
    credibilityScore: typeof data.credibilityScore === "number" ? data.credibilityScore : undefined,
    biasRating: data.biasRating ?? undefined,
    factCheckScore: typeof data.factCheckScore === "number" ? data.factCheckScore : undefined,
    sourcesCount: typeof data.sourcesCount === "number" ? data.sourcesCount : sourceUrls.length,
    publicationDate: data.publicationDate ?? undefined,
    sourceUrls,
    factCheckSources: Array.isArray(data.factCheckSources) ? data.factCheckSources : sourceUrls,
    sources: Array.isArray(data.sources) ? data.sources : sourceUrls,
    summary: data.summary ?? "",
    reasoning: data.reasoning ?? undefined,
    modelUsed: data.modelUsed ?? undefined,
    searchResults: Array.isArray(data.searchResults) ? data.searchResults : undefined,
    reason: data.reason ?? "",
    checkedAt: data.checkedAt ?? new Date().toISOString(),
  };
}

export class LinkCheckerService {
  static async checkLink(url: string): Promise<LinkCheckResult> {
    const response = await apiRequest("POST", "/api/link-checks", { url });
    const data = await response.json();

    return mapLinkCheckResult(data, url);
  }

  static async getRecentChecks(limit = 10): Promise<LinkCheckResult[]> {
    const response = await apiRequest("GET", `/api/link-checks/recent?limit=${limit}`);
    const arr = await response.json();

    return arr.map((item: any) => mapLinkCheckResult(item));
  }

  static async getUserChecks(limit = 10): Promise<LinkCheckResult[]> {
    const response = await apiRequest("GET", `/api/link-checks/user?limit=${limit}`);
    const arr = await response.json();

    return arr.map((item: any) => mapLinkCheckResult(item));
  }
}
