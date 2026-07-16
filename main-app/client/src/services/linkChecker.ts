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
  verdict: "verified" | "misleading" | "false" | "pending";
  credibilityScore?: number;
  biasRating?: "low" | "medium" | "high";
  factCheckScore?: number;
  sourcesCount?: number;
  publicationDate?: string;
  factCheckSources?: string[];
  sources?: string[];
  summary?: string;
  reason?: string;
  checkedAt: string;
}

export class LinkCheckerService {
  static async checkLink(url: string): Promise<LinkCheckResult> {
    const response = await apiRequest("POST", "/api/link-checks", { url });
    const data = await response.json();

    return {
      id: data.id,
      url: data.url ?? url,
      title: data.title ?? data.summary ?? "",
      verdict: data.verdict ?? "pending",
      credibilityScore: typeof data.credibilityScore === "number" ? data.credibilityScore : undefined,
      biasRating: data.biasRating ?? undefined,
      factCheckScore: typeof data.factCheckScore === "number" ? data.factCheckScore : undefined,
      sourcesCount: typeof data.sourcesCount === "number" ? data.sourcesCount : undefined,
      publicationDate: data.publicationDate ?? undefined,
      factCheckSources: Array.isArray(data.factCheckSources) ? data.factCheckSources : undefined,

      // Added fields
      sources: Array.isArray(data.sources) ? data.sources : data.factCheckSources ?? [],
      summary: data.summary ?? "",
      reason: data.reason ?? "",

      checkedAt: data.checkedAt ?? new Date().toISOString(),
    };
  }

  static async getRecentChecks(limit = 10): Promise<LinkCheckResult[]> {
    const response = await apiRequest("GET", `/api/link-checks/recent?limit=${limit}`);
    const arr = await response.json();

    return arr.map((item: any) => ({
      id: item.id,
      url: item.url,
      title: item.title ?? "",
      verdict: item.verdict ?? "pending",
      credibilityScore: item.credibilityScore ?? undefined,
      biasRating: item.biasRating ?? undefined,
      factCheckScore: item.factCheckScore ?? undefined,
      sourcesCount: item.sourcesCount ?? undefined,
      publicationDate: item.publicationDate ?? undefined,
      factCheckSources: item.factCheckSources ?? undefined,

      // Added fields
      sources: Array.isArray(item.sources) ? item.sources : item.factCheckSources ?? [],
      summary: item.summary ?? "",
      reason: item.reason ?? "",

      checkedAt: item.checkedAt ?? new Date().toISOString(),
    }));
  }

  static async getUserChecks(limit = 10): Promise<LinkCheckResult[]> {
    const response = await apiRequest("GET", `/api/link-checks/user?limit=${limit}`);
    const arr = await response.json();

    return arr.map((item: any) => ({
      id: item.id,
      url: item.url,
      title: item.title ?? "",
      verdict: item.verdict ?? "pending",
      credibilityScore: item.credibilityScore ?? undefined,
      biasRating: item.biasRating ?? undefined,
      factCheckScore: item.factCheckScore ?? undefined,
      sourcesCount: item.sourcesCount ?? undefined,
      publicationDate: item.publicationDate ?? undefined,
      factCheckSources: item.factCheckSources ?? undefined,

      // Added fields
      sources: Array.isArray(item.sources) ? item.sources : item.factCheckSources ?? [],
      summary: item.summary ?? "",
      reason: item.reason ?? "",

      checkedAt: item.checkedAt ?? new Date().toISOString(),
    }));
  }
}
