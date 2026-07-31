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
}

const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

const analysisCache: Record<string, { result: NormalizedLinkAnalysis; timestamp: number }> = {};
const CACHE_TTL_MS = 1000 * 60 * 10;
const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 4000;
const MAX_SUMMARY_LENGTH = 2000;
const MAX_REASONING_LENGTH = 4000;
const MAX_SOURCE_URLS = 10;
const REQUEST_TIMEOUT_MS = 15000;
const GROQ_MODEL = process.env.GROQ_LINK_CHECK_MODEL || "compound-beta";
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

    let normalized: NormalizedLinkAnalysis;
    try {
      const aiResult = await this.analyzeWithAI(extracted);
      normalized = this.normalizeAnalysis(extracted, aiResult);
    } catch (error: any) {
      console.error("Link analysis failed:", error?.message ?? error, error);
      normalized = buildFailureResult(
        extracted.url,
        extracted.domain,
        extracted.title,
        extracted.publicationDate,
        "Analysis failed because the AI response could not be validated.",
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

      const contentSelectors = ["article", "main", '[role="main"]', ".content", ".post-content"];
      let content = "";

      for (const selector of contentSelectors) {
        const element = doc.querySelector(selector);
        const textContent = trimAndCollapseWhitespace(element?.textContent, MAX_CONTENT_LENGTH);
        if (textContent) {
          content = textContent;
          break;
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

  static async analyzeWithAI(input: ExtractedPageContent): Promise<LinkCheckAIResponse> {
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
            instructions: [
              "Assess the credibility of the page using the extracted content.",
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

    const parsed = JSON.parse(message.content);
    return LinkCheckAIResponseSchema.parse(parsed);
  }

  static normalizeAnalysis(
    extracted: ExtractedPageContent,
    aiResult: LinkCheckAIResponse,
  ): NormalizedLinkAnalysis {
    const sourceUrls = sanitizeSourceUrls(aiResult.sourceUrls);

    return {
      url: extracted.url,
      title: trimAndCollapseWhitespace(extracted.title, MAX_TITLE_LENGTH) || extracted.url,
      domain: extracted.domain,
      publicationDate: extracted.publicationDate,
      verdict: aiResult.verdict,
      credibilityScore: clampScore(aiResult.credibilityScore),
      biasRating: aiResult.biasRating,
      factCheckScore: clampScore(aiResult.factCheckScore),
      summary:
        trimAndCollapseWhitespace(aiResult.summary, MAX_SUMMARY_LENGTH) ||
        "Analysis failed because the AI response was empty.",
      sourceUrls,
      sourcesCount: sourceUrls.length,
      reasoning: aiResult.reasoning
        ? trimAndCollapseWhitespace(aiResult.reasoning, MAX_REASONING_LENGTH) || undefined
        : undefined,
    };
  }
}
