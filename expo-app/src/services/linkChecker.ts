import { FactCheckService, ScrapedContent } from './factCheck';

export interface LinkCheckResult {
  id?: string;
  url: string;
  title?: string;
  verdict: 'verified' | 'misleading' | 'false' | 'pending';
  credibilityScore?: number;
  biasRating?: 'low' | 'medium' | 'high';
  factCheckScore?: number;
  sourcesCount?: number;
  publicationDate?: string;
  factCheckSources?: string[];
  sources?: string[];
  summary?: string;
  reason?: string;
  checkedAt: string;
  modelUsed?: string;
  domain?: string;
}

export class LinkCheckerService {
  static async checkLink(url: string): Promise<LinkCheckResult> {
    try {
      // For mobile, we'll do a simplified check using the local fact check service
      // In production, this would call your backend API
      
      const domain = new URL(url).hostname;
      
      // Create mock scraped content (in production, you'd use a web scraping API)
      const scrapedContent: ScrapedContent = {
        title: 'Content from ' + domain,
        content: 'Sample content for analysis',
        publishedDate: null,
        domain: domain,
      };

      const factCheckResult = await FactCheckService.performFactCheck(url, scrapedContent);

      return {
        id: Math.random().toString(),
        url: url,
        title: scrapedContent.title,
        verdict: factCheckResult.verdict,
        credibilityScore: factCheckResult.credibilityScore,
        biasRating: factCheckResult.biasRating,
        factCheckScore: factCheckResult.factCheckScore,
        sourcesCount: factCheckResult.sourcesCount,
        sources: factCheckResult.sources,
        summary: factCheckResult.summary,
        reason: factCheckResult.details,
        checkedAt: new Date().toISOString(),
        modelUsed: 'local-analysis',
        domain: domain,
      };
    } catch (error) {
      console.error('Error checking link:', error);
      return {
        id: Math.random().toString(),
        url: url,
        verdict: 'pending',
        credibilityScore: 50,
        biasRating: 'medium',
        factCheckScore: 50,
        sourcesCount: 0,
        sources: [],
        summary: 'Unable to analyze the link at this time.',
        checkedAt: new Date().toISOString(),
        domain: new URL(url).hostname,
      };
    }
  }

  static async getRecentChecks(limit = 10): Promise<LinkCheckResult[]> {
    // In production, this would fetch from your backend API
    // For now, return empty array
    return [];
  }

  static async getUserChecks(limit = 10): Promise<LinkCheckResult[]> {
    // In production, this would fetch from your backend API
    // For now, return empty array
    return [];
  }
}