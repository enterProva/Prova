import Groq from "groq-sdk";

// Initialize Groq client
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Simple in-memory cache
const groqCache: Record<string, { result: string; timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

export interface LinkCheckResult {
  verdict: "verified" | "misleading" | "false" | "pending";
  credibilityScore: number;
  biasRating: "low" | "medium" | "high";
  factCheckScore: number;
  sourcesCount: number;
  sources: string[];
  summary?: string;
}

export class EnhancedLinkCheckerService {
  static async checkLink(
    url: string,
    useCompoundBeta = true
  ): Promise<LinkCheckResult & { title: string; publicationDate: null; content: string; domain: string }> {
    try {
      let aiResult = "";

      // Check cache
      const cached = groqCache[url];
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        aiResult = cached.result;
      } else {
        const model = useCompoundBeta ? "compound-beta" : "openai/gpt-oss-120b";

        const response = await groqClient.chat.completions.create({
          model,
          messages: [
            {
              role: "user",
              content: `Analyze this URL for credibility and fact-checking: ${url}

Provide:
1. Content credibility assessment (verified/misleading/false)
2. Credibility score (0-100)
3. Bias rating (low/medium/high)
4. Fact-check score (0-100)
5. List of sources
6. Summary
Use web search if necessary.`,
            },
          ],
          temperature: 0.3,
          max_completion_tokens: 1024,
          tool_choice: useCompoundBeta ? undefined : "required",
          tools: useCompoundBeta ? [] : [{ type: "browser_search" }],
        });

        const choice = response.choices?.[0]?.message;
        if (!choice) throw new Error("No AI response from model");

        if (choice.content) {
          aiResult = choice.content;
        } else if (choice.reasoning && typeof choice.reasoning !== "string" && "summary" in choice.reasoning) {
          aiResult = (choice.reasoning as any).summary;
        }

        if (aiResult) {
          groqCache[url] = { result: aiResult, timestamp: Date.now() };
        }
      }

      const parsed = this.parseAIOutput(aiResult);

      // Explicitly cast verdict and biasRating
      return {
        ...parsed,
        title: url,
        publicationDate: null,
        content: "",
        domain: this.extractDomain(url),
        verdict: parsed.verdict as "pending" | "verified" | "misleading" | "false",
        biasRating: parsed.biasRating as "low" | "medium" | "high",
      };
    } catch (err: any) {
      return this.getErrorResult(url, err);
    }
  }

  static async checkMultipleLinks(urls: string[]): Promise<Array<LinkCheckResult & { url: string }>> {
    const results = await Promise.allSettled(
      urls.map(async (url) => this.checkLink(url))
    );

    return results.map((result, index) => {
      if (result.status === "fulfilled") {
        const value = result.value;
        return {
          url: value.title || urls[index],
          verdict: value.verdict as "pending" | "verified" | "misleading" | "false",
          credibilityScore: value.credibilityScore,
          biasRating: value.biasRating as "low" | "medium" | "high",
          factCheckScore: value.factCheckScore,
          sourcesCount: value.sourcesCount,
          sources: value.sources,
          summary: value.summary,
        };
      } else {
        const errorResult = this.getErrorResult(urls[index], result.reason);
        return {
          url: urls[index],
          verdict: errorResult.verdict as "pending" | "verified" | "misleading" | "false",
          credibilityScore: errorResult.credibilityScore,
          biasRating: errorResult.biasRating as "low" | "medium" | "high",
          factCheckScore: errorResult.factCheckScore,
          sourcesCount: errorResult.sourcesCount,
          sources: errorResult.sources,
          summary: errorResult.summary,
        };
      }
    });
  }

  private static parseAIOutput(aiText: string | null): LinkCheckResult {
    if (!aiText) return this.getDefaultResult();

    const verdict = this.extractVerdict(aiText) as "pending" | "verified" | "misleading" | "false";
    const biasRating = this.extractBias(aiText) as "low" | "medium" | "high";
    const sources = this.extractSources(aiText);

    return {
      verdict,
      credibilityScore: this.extractScore(aiText, /credibility score[:\s]*(\d{1,3})/i) || 50,
      factCheckScore: this.extractScore(aiText, /fact[- ]?check score[:\s]*(\d{1,3})/i) || 50,
      biasRating,
      sourcesCount: sources.length,
      sources,
      summary: aiText.trim(),
    };
  }

  private static extractVerdict(text: string): "verified" | "misleading" | "false" | "pending" {
    const lower = text.toLowerCase();
    if (lower.includes("false") || lower.includes("debunked")) return "false";
    if (lower.includes("misleading") || lower.includes("partially false")) return "misleading";
    if (lower.includes("verified") || lower.includes("credible") || lower.includes("accurate")) return "verified";
    return "pending";
  }

  private static extractScore(text: string, pattern: RegExp): number | null {
    const match = text.match(pattern);
    return match ? parseInt(match[1], 10) : null;
  }

  private static extractBias(text: string): "low" | "medium" | "high" {
    const match = text.match(/bias rating[:\s]+(low|medium|high)/i);
    return match ? (match[1].toLowerCase() as "low" | "medium" | "high") : "medium";
  }

  private static extractSources(text: string): string[] {
    const patterns = [/sources?[:\s]+(.+)/i, /references?[:\s]+(.+)/i, /citations?[:\s]+(.+)/i];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].split(/[,;]/).map(s => s.trim()).filter(Boolean).slice(0, 10);
    }
    return [];
  }

  private static extractDomain(url: string): string {
    try { return new URL(url).hostname; } catch { return url; }
  }

  private static getDefaultResult(): LinkCheckResult {
    return { verdict: "pending", credibilityScore: 50, biasRating: "medium", factCheckScore: 50, sourcesCount: 0, sources: [], summary: "Unable to analyze content" };
  }

  private static getErrorResult(url: string, error: any): LinkCheckResult & { title: string; publicationDate: null; content: string; domain: string } {
    return {
      verdict: "pending",
      credibilityScore: 0,
      biasRating: "medium",
      factCheckScore: 0,
      sourcesCount: 0,
      sources: [],
      summary: `Analysis failed: ${error?.message || "Unknown error"}`,
      title: url,
      publicationDate: null,
      content: "",
      domain: this.extractDomain(url),
    };
  }
}
