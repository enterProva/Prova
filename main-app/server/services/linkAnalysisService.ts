import "dotenv/config";
import axios from "axios";
import Groq from "groq-sdk";
import { JSDOM } from "jsdom";

import {
  LinkCheckAIResponseSchema,
  type LinkCheckAIResponse,
  type LinkCheckBiasRating,
  type LinkCheckVerdict,
} from "@shared/linkCheck";

interface ExtractedPageContent {
  url: string;
  domain: string;
  title: string | null;
  content: string;
  publicationDate: string | null;
}

export interface NormalizedLinkAnalysis {
  url: string;
  title: string;
  domain: string;
  publicationDate: string | null;
  verdict: LinkCheckVerdict;
  credibilityScore: number;
  biasRating: LinkCheckBiasRating;
  factCheckScore: number;
  summary: string;
  sourceUrls: string[];
  sourcesCount: number;
  reasoning?: string;
  searchResults?: Array<{ title?: string; url?: string; snippet?: string }>;
}

const groqApiKey = process.env.GROQ_API_KEY?.trim();
const groqClient = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

const analysisCache: Record<string, { result: NormalizedLinkAnalysis; timestamp: number }> = {};
const CACHE_TTL_MS = 1000 * 60 * 10;
const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 4000;
const MAX_SUMMARY_LENGTH = 2000;
const MAX_REASONING_LENGTH = 4000;
const MAX_SOURCE_URLS = 10;
const REQUEST_TIMEOUT_MS = 15000;
const GROQ_MODEL = process.env.GROQ_LINK_CHECK_MODEL?.trim() || "openai/gpt-oss-120b";
const SCRAPE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

function trimAndCollapseWhitespace(value: string | null | undefined, maxLength?: number) {
  const trimmed = (value ?? "").replace(/\s+/g, " ").trim();
  if (!trimmed) return "";
  return maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

function getDomainFromUrl(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function isSocialMediaDomain(domain: string) {
  const normalized = domain.toLowerCase();
  return [
    "x.com",
    "twitter.com",
    "facebook.com",
    "instagram.com",
    "tiktok.com",
    "threads.net",
    "linkedin.com",
    "youtube.com",
    "youtu.be",
    "reddit.com",
    "rumble.com",
  ].some((socialDomain) => normalized === socialDomain || normalized.endsWith(`.${socialDomain}`));
}

function normalizeDateString(value: string | null | undefined) {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function extractJsonObject(rawText: string): Record<string, any> | null {
  if (!rawText || typeof rawText !== "string") return null;

  const candidates = [
    rawText.trim(),
    rawText.replace(/```json/gi, "").replace(/```/g, "").trim(),
  ];

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object") {
        return parsed as Record<string, any>;
      }
    } catch {
      // try to recover a JSON object from text that includes a code fence or surrounding prose
    }

    const firstBrace = candidate.indexOf("{");
    const lastBrace = candidate.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const sliced = candidate.slice(firstBrace, lastBrace + 1);
      try {
        const parsed = JSON.parse(sliced);
        if (parsed && typeof parsed === "object") {
          return parsed as Record<string, any>;
        }
      } catch {
        // continue; a malformed model output is still handled below
      }
    }
  }

  return null;
}

function buildFallbackAiResponse(input: ExtractedPageContent, raw?: Record<string, any> | null): LinkCheckAIResponse {
  const safeRaw = raw ?? {};

  const fallbackSummary =
    typeof safeRaw.summary === "string" && safeRaw.summary.trim()
      ? safeRaw.summary.trim()
      : `The claim in this post appears weakly supported by the available context. No strong corroborating reporting was found for ${input.domain}.`;

  const candidateVerdict: LinkCheckVerdict =
    typeof safeRaw.verdict === "string" && ["verified", "misleading", "false", "pending"].includes(safeRaw.verdict)
      ? (safeRaw.verdict as LinkCheckVerdict)
      : "false";

  const candidateBias: LinkCheckBiasRating =
    typeof safeRaw.biasRating === "string" && ["low", "medium", "high"].includes(safeRaw.biasRating)
      ? (safeRaw.biasRating as LinkCheckBiasRating)
      : "medium";

  const candidateCredibility = Number.isFinite(safeRaw.credibilityScore)
    ? clampScore(Number(safeRaw.credibilityScore))
    : 15;

  const candidateFactCheck = Number.isFinite(safeRaw.factCheckScore)
    ? clampScore(Number(safeRaw.factCheckScore))
    : 8;

  return {
    verdict: candidateVerdict,
    credibilityScore: candidateCredibility,
    biasRating: candidateBias,
    factCheckScore: candidateFactCheck,
    summary: fallbackSummary,
    sourceUrls: Array.isArray(safeRaw.sourceUrls)
      ? safeRaw.sourceUrls.filter((item: any) => typeof item === "string")
      : [],
    reasoning: typeof safeRaw.reasoning === "string" && safeRaw.reasoning.trim()
      ? safeRaw.reasoning.trim()
      : "The claim was not independently corroborated, so the app used a conservative fallback based on the single-source social evidence and the lack of reliable verification.",
    title: typeof safeRaw.title === "string" && safeRaw.title.trim() ? safeRaw.title.trim() : input.title,
    publicationDate: typeof safeRaw.publicationDate === "string" && safeRaw.publicationDate.trim() ? safeRaw.publicationDate.trim() : input.publicationDate,
  };
}

function sanitizeSourceUrls(sourceUrls: string[]) {
  const uniqueUrls = new Set<string>();

  for (const sourceUrl of sourceUrls) {
    const normalized = trimAndCollapseWhitespace(sourceUrl);
    if (!normalized) continue;

    try {
      uniqueUrls.add(new URL(normalized).toString());
    } catch {
      continue;
    }

    if (uniqueUrls.size >= MAX_SOURCE_URLS) {
      break;
    }
  }

  return Array.from(uniqueUrls);
}

function normalizeClaimSearchQuery(claimText: string) {
  const query = trimAndCollapseWhitespace(claimText, 180);
  if (!query) return "";

  const genericPatterns = [
    /^home\s*\/?\s*x$/i,
    /^home\s*\/?\s*twitter$/i,
    /^x\s*\/?\s*home$/i,
    /^twitter\s*\/?\s*home$/i,
    /^https?:\/\//i,
    /^javascript:/i,
    /^(about|signin|login|signup|search)\b/i,
  ];

  if (genericPatterns.some((pattern) => pattern.test(query))) return "";

  const stripped = query
    .replace(/^(post by|posted by)\s+/i, "")
    .replace(/\s+(on|at)\s+twitter\b.*$/i, "")
    .replace(/\s+(on|at)\s+x\b.*$/i, "")
    .replace(/\s+\/\s*(x|twitter)\b.*$/i, "")
    .trim();

  return stripped.length >= 12 ? stripped : "";
}

function hasIndependentCorroboration(
  sourceUrls: string[] = [],
  searchResults: Array<{ title?: string; url?: string; snippet?: string }> = [],
) {
  const urls = [
    ...sanitizeSourceUrls(sourceUrls),
    ...sanitizeSourceUrls(searchResults.map((item) => item.url).filter(Boolean) as string[]),
  ];

  if (urls.length === 0) return false;

  const nonSocialDomains = urls.filter((url) => {
    try {
      return !isSocialMediaDomain(new URL(url).hostname);
    } catch {
      return true;
    }
  });

  return nonSocialDomains.length > 0;
}

async function searchWebForClaim(claimText: string): Promise<Array<{ title?: string; url?: string; snippet?: string }>> {
  const query = normalizeClaimSearchQuery(claimText);
  if (!query) return [];

  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await axios.get<string>(url, {
      timeout: REQUEST_TIMEOUT_MS,
      headers: {
        ...SCRAPE_HEADERS,
        Referer: "https://duckduckgo.com/",
      },
    });

    const dom = new JSDOM(response.data);
    const doc = dom.window.document;

    return Array.from(doc.querySelectorAll('.result')).slice(0, 5).map((node) => {
      const anchor = node.querySelector('a.result__a') as HTMLAnchorElement | null;
      const title = trimAndCollapseWhitespace(anchor?.textContent ?? undefined, 150);
      const urlValue = anchor?.href ? trimAndCollapseWhitespace(anchor.href, 400) : undefined;
      const snippet = trimAndCollapseWhitespace(node.querySelector('.result__snippet')?.textContent ?? undefined, 220);

      return {
        title: title || undefined,
        url: urlValue || undefined,
        snippet: snippet || undefined,
      };
    }).filter((item) => item.url || item.title || item.snippet);
  } catch (error) {
    console.warn("DuckDuckGo search failed for claim:", error instanceof Error ? error.message : error);
    return [];
  }
}

function buildFailureResult(
  url: string,
  domain: string,
  title: string | null,
  publicationDate: string | null,
  summary: string,
): NormalizedLinkAnalysis {
  return {
    url,
    title: trimAndCollapseWhitespace(title, MAX_TITLE_LENGTH) || url,
    domain,
    publicationDate,
    verdict: "pending",
    credibilityScore: 0,
    biasRating: "medium",
    factCheckScore: 0,
    summary: trimAndCollapseWhitespace(summary, MAX_SUMMARY_LENGTH) || "Analysis failed.",
    sourceUrls: [],
    sourcesCount: 0,
  };
}

export class LinkAnalysisService {
  static async analyzeUrl(url: string): Promise<NormalizedLinkAnalysis> {
    const cached = analysisCache[url];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.result;
    }

    const extracted = await this.extractPageContent(url);
    const claimText = isSocialMediaDomain(extracted.domain)
      ? extracted.content || extracted.title || extracted.url
      : extracted.title || extracted.content || extracted.url;
    const searchResults = await searchWebForClaim(claimText);

    let normalized: NormalizedLinkAnalysis;
    try {
      const aiResult = await this.analyzeWithAI(extracted, searchResults);
      normalized = this.normalizeAnalysis(extracted, aiResult, searchResults);
    } catch (error: any) {
      const message = String(error?.message ?? error ?? "");
      const isInvalidKeyError = /invalid api key|expired|unauthorized|authentication/i.test(message);

      console.error("Link analysis failed:", message, error);
      normalized = buildFailureResult(
        extracted.url,
        extracted.domain,
        extracted.title,
        extracted.publicationDate,
        isInvalidKeyError
          ? "Live AI analysis is unavailable because the configured Groq API key is invalid or expired. Add a valid GROQ_API_KEY to .env to enable results."
          : "Analysis failed because the AI response could not be validated.",
      );
    }

    analysisCache[url] = {
      result: normalized,
      timestamp: Date.now(),
    };

    return normalized;
  }

  static async extractPageContent(url: string): Promise<ExtractedPageContent> {
    const domain = getDomainFromUrl(url);

    try {
      const response = await axios.get<string>(url, {
        responseType: "text",
        timeout: REQUEST_TIMEOUT_MS,
        headers: SCRAPE_HEADERS,
      });

      const dom = new JSDOM(response.data);
      const doc = dom.window.document;

      const title = trimAndCollapseWhitespace(
        doc.querySelector("title")?.textContent?.trim() ||
          doc.querySelector('meta[property="og:title"]')?.getAttribute("content")?.trim() ||
          doc.querySelector("h1")?.textContent?.trim() ||
          null,
        MAX_TITLE_LENGTH,
      );

      const contentSelectors = [
        "article",
        "main",
        '[role="main"]',
        '.content',
        '.post-content',
        '[data-testid="tweetText"]',
        '[data-testid="post-text"]',
        '[data-testid="tweet"]',
        'meta[property="og:description"]',
        'meta[name="twitter:description"]',
      ];

      let content = "";

      if (isSocialMediaDomain(domain)) {
        const socialText = [
          doc.querySelector('[data-testid="tweetText"]')?.textContent,
          doc.querySelector('[data-testid="post-text"]')?.textContent,
          doc.querySelector('meta[property="og:description"]')?.getAttribute("content"),
          doc.querySelector('meta[name="twitter:description"]')?.getAttribute("content"),
          doc.querySelector('meta[name="description"]')?.getAttribute("content"),
        ]
          .map((value) => trimAndCollapseWhitespace(value, MAX_CONTENT_LENGTH))
          .find((value) => Boolean(value));

        if (socialText) {
          content = socialText;
        }
      }

      if (!content) {
        for (const selector of contentSelectors) {
          const element = doc.querySelector(selector);
          const textContent = trimAndCollapseWhitespace(
            element?.textContent || element?.getAttribute("content"),
            MAX_CONTENT_LENGTH,
          );
          if (textContent) {
            content = textContent;
            break;
          }
        }
      }

      if (!content) {
        content = trimAndCollapseWhitespace(doc.body?.textContent, MAX_CONTENT_LENGTH);
      }

      const dateSelectors = [
        'meta[property="article:published_time"]',
        'meta[name="publishdate"]',
        'meta[name="date"]',
        'meta[itemprop="datePublished"]',
        "time[datetime]",
        ".published",
        ".date",
      ];

      let publicationDate: string | null = null;

      for (const selector of dateSelectors) {
        const element = doc.querySelector(selector);
        const rawDate =
          element?.getAttribute("content") ||
          element?.getAttribute("datetime") ||
          element?.textContent ||
          null;

        publicationDate = normalizeDateString(trimAndCollapseWhitespace(rawDate));
        if (publicationDate) {
          break;
        }
      }

      return {
        url,
        domain,
        title: title || null,
        content,
        publicationDate,
      };
    } catch (error: any) {
      console.error("Page extraction failed:", error?.message ?? error, error);
      return {
        url,
        domain,
        title: null,
        content: "",
        publicationDate: null,
      };
    }
  }

  static async analyzeWithAI(
    input: ExtractedPageContent,
    searchResults: Array<{ title?: string; url?: string; snippet?: string }> = [],
  ): Promise<LinkCheckAIResponse> {
    if (!groqClient) {
      // Fallback mock response for demo builds when GROQ_API_KEY is missing
      const safeTitle = input.title && input.title.trim() ? input.title.trim() : null;
      const isSocial = isSocialMediaDomain(input.domain);
      const summary = isSocial
        ? "Social post detected. This single-source post lacks independent corroboration and should be treated as weak evidence until verified by reliable reporting or official statements."
        : (safeTitle || `Preview analysis for ${input.domain}`);
      const approxScore = Math.min(90, Math.max(10, Math.round((input.content?.length || 0) / 50)));
      const mock: any = {
        verdict: isSocial ? "misleading" : "pending",
        credibilityScore: isSocial ? 18 : approxScore,
        biasRating: "medium",
        factCheckScore: isSocial ? 10 : Math.round(approxScore * 0.7),
        summary,
        sourceUrls: searchResults.map((item) => item.url).filter(Boolean),
        reasoning: isSocial
          ? "Demo analysis: social posts are often single-source and low-corroboration content; the system treats them conservatively unless there are reliable supporting sources."
          : "Demo analysis: GROQ_API_KEY is not configured, returning simulated result.",
        title: safeTitle,
        publicationDate: input.publicationDate || null,
        searchResults,
      };

      return LinkCheckAIResponseSchema.parse(mock as any);
    }

    try {
      const response = await groqClient.chat.completions.create({
        model: GROQ_MODEL,
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_completion_tokens: 1024,
        messages: [
          {
            role: "system",
            content:
              "You analyze online content credibility. Return exactly one JSON object and no prose. " +
              "Use this shape only: {\"verdict\":\"verified|misleading|false|pending\",\"credibilityScore\":0-100," +
              "\"biasRating\":\"low|medium|high\",\"factCheckScore\":0-100,\"summary\":\"string\",\"sourceUrls\":[\"https://...\"]," +
              "\"reasoning\":\"optional string\",\"title\":\"optional string\",\"publicationDate\":\"optional string or null\"}. " +
              "Treat social media posts like X/Twitter as lower-authority than mainstream reporting unless there is independent corroboration. " +
              "For single-source social posts, lower credibility sharply and prefer 'misleading' or 'false' when no reliable sources are present. " +
              "If you are uncertain, lower the scores and explain the uncertainty in summary.",
          },
          {
            role: "user",
            content: JSON.stringify({
              url: input.url,
              domain: input.domain,
              extractedTitle: input.title,
              extractedPublicationDate: input.publicationDate,
              extractedContent: input.content,
              sourceType: isSocialMediaDomain(input.domain) ? "social-media-post" : "webpage",
              searchResults: searchResults.slice(0, 5),
              instructions: [
                "Assess the credibility of the page using the extracted content.",
                "Use the provided searchResults as independent web evidence. If the claim is only supported by a single social post and not corroborated elsewhere, lower the credibility sharply.",
                "If this is a social media post, treat it as a lower-trust source unless it is corroborated by reliable reporting or official statements.",
                "Return sourceUrls as an array of URLs only. If you cannot support any sources, return an empty array.",
                "Do not include markdown, code fences, or explanatory prose outside the JSON object.",
              ],
            }),
          },
        ],
      });

      const message = response.choices?.[0]?.message;
      if (!message || typeof message.content !== "string" || !message.content.trim()) {
        throw new Error("AI did not return JSON content.");
      }

      const parsed = extractJsonObject(message.content);
      if (!parsed) {
        throw new Error("AI response was not valid JSON.");
      }

      const normalizedParsed = {
        ...parsed,
        title: typeof parsed?.title === "string" && parsed.title.trim() ? parsed.title.trim() : null,
        reasoning: typeof parsed?.reasoning === "string" && parsed.reasoning.trim() ? parsed.reasoning.trim() : null,
        publicationDate:
          typeof parsed?.publicationDate === "string" && parsed.publicationDate.trim()
            ? parsed.publicationDate.trim()
            : null,
        summary: typeof parsed?.summary === "string" && parsed.summary.trim() ? parsed.summary.trim() : "Analysis result is unavailable.",
        sourceUrls: Array.isArray(parsed?.sourceUrls) ? parsed.sourceUrls.filter((item: any) => typeof item === "string") : [],
        searchResults: Array.isArray(parsed?.searchResults) ? parsed.searchResults.filter((item: any) => item && typeof item === "object") : searchResults,
      };

      try {
        return LinkCheckAIResponseSchema.parse(normalizedParsed);
      } catch {
        return buildFallbackAiResponse(input, normalizedParsed);
      }
    } catch (error: any) {
      const isAuthIssue = error?.status === 401 || error?.code === "invalid_api_key" || /invalid api key/i.test(String(error?.message ?? ""));

      if (isAuthIssue) {
        console.error("Groq authentication failed: check GROQ_API_KEY in .env. The provided key is invalid or expired.");
      } else {
        console.error("Groq analysis failed:", error?.message ?? error);
      }

      return buildFallbackAiResponse(input, null);
    }
  }

  static normalizeAnalysis(
    extracted: ExtractedPageContent,
    aiResult: LinkCheckAIResponse,
    searchResults: Array<{ title?: string; url?: string; snippet?: string }> = [],
  ): NormalizedLinkAnalysis {
    const sourceUrls = sanitizeSourceUrls(aiResult.sourceUrls);
    const isSocial = isSocialMediaDomain(extracted.domain);
    const singleSourceSocial = isSocial && sourceUrls.length === 0;
    const adjustedVerdict = singleSourceSocial ? "misleading" : aiResult.verdict;
    const adjustedCredibility = singleSourceSocial
      ? Math.min(clampScore(aiResult.credibilityScore), 25)
      : clampScore(aiResult.credibilityScore);
    const adjustedFactCheck = singleSourceSocial
      ? Math.min(clampScore(aiResult.factCheckScore), 18)
      : clampScore(aiResult.factCheckScore);

    return {
      url: extracted.url,
      title: trimAndCollapseWhitespace(extracted.title, MAX_TITLE_LENGTH) || extracted.url,
      domain: extracted.domain,
      publicationDate: extracted.publicationDate,
      verdict: adjustedVerdict,
      credibilityScore: adjustedCredibility,
      biasRating: aiResult.biasRating,
      factCheckScore: adjustedFactCheck,
      summary: singleSourceSocial
        ? "This is a social media post and appears to be a single-source claim without independent corroboration. Treat it as weak evidence unless other reliable reporting or official statements confirm it."
        : trimAndCollapseWhitespace(aiResult.summary, MAX_SUMMARY_LENGTH) ||
          "Analysis failed because the AI response was empty.",
      sourceUrls,
      sourcesCount: sourceUrls.length,
      reasoning: aiResult.reasoning
        ? trimAndCollapseWhitespace(aiResult.reasoning, MAX_REASONING_LENGTH) || undefined
        : undefined,
      searchResults: searchResults.length > 0 ? searchResults : aiResult.searchResults,
    };
  }
}
