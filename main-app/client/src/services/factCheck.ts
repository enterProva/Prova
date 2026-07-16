import axios from "axios";
import type { AxiosResponse } from "axios";

export interface FactCheckSource {
  name: string;
  url?: string;
  rating?: string;
  confidence?: number;
}

export interface FactCheckResult {
  verdict: 'verified' | 'misleading' | 'false' | 'pending';
  credibilityScore: number;
  biasRating: 'low' | 'medium' | 'high';
  factCheckScore: number;
  sourcesCount: number;
  sources: string[];
  summary?: string;
  details?: string;
}

export interface ScrapedContent {
  title: string;
  content: string;
  publishedDate: Date | null;
  author?: string;
  domain: string;
}

export class FactCheckService {
  /**
   * Scrape content from a URL
   */
  static async scrapeUrl(url: string): Promise<ScrapedContent> {
    try {
      const response: AxiosResponse<string> = await axios.get(url, {
        responseType: 'text',
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      const html = response.data;
      let doc: Document | null = null;

      if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        doc = parser.parseFromString(html, 'text/html');
      } else {
        const { JSDOM } = await import('jsdom');
        const dom = new JSDOM(html);
        doc = dom.window.document;
      }

      if (!doc) throw new Error('Failed to create document parser');

      const title =
        (doc.querySelector('title')?.textContent?.trim()) ||
        doc.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim() ||
        doc.querySelector('h1')?.textContent?.trim() ||
        'Untitled';

      const contentSelectors = ['article', 'main', '[role="main"]', '.content', '.post-content'];
      let content = '';
      for (const selector of contentSelectors) {
        const element = doc.querySelector(selector);
        if (element && element.textContent && element.textContent.trim().length > 0) {
          content = element.textContent.trim();
          break;
        }
      }
      if (!content) content = (doc.body?.textContent || '').trim();

      const dateSelectors = [
        'meta[property="article:published_time"]',
        'meta[name="publishdate"]',
        'time[datetime]',
        '.published',
        '.date'
      ];

      let publishedDate: Date | null = null;
      for (const selector of dateSelectors) {
        const element = doc.querySelector(selector);
        const dateString =
          element?.getAttribute('content') ||
          element?.getAttribute('datetime') ||
          element?.textContent;
        if (dateString) {
          const parsed = new Date(dateString.trim());
          if (!isNaN(parsed.getTime())) {
            publishedDate = parsed;
            break;
          }
        }
      }

      const authorSelectors = [
        'meta[name="author"]',
        '.author',
        '.byline',
        '[rel="author"]'
      ];

      let author: string | undefined;
      for (const selector of authorSelectors) {
        const element = doc.querySelector(selector);
        const authorText = element?.getAttribute('content') || element?.textContent;
        if (authorText && authorText.trim().length > 0) {
          author = authorText.trim();
          break;
        }
      }

      const domain = new URL(url).hostname;

      return {
        title: title.toString().substring(0, 200),
        content: content.toString().substring(0, 2000),
        publishedDate,
        author,
        domain,
      };
    } catch (error: any) {
      console.error('Error scraping URL:', error?.message ?? error, error);
      try {
        const domain = new URL(url).hostname;
        return {
          title: 'Unable to fetch content',
          content: '',
          publishedDate: null,
          domain,
        };
      } catch {
        return {
          title: 'Unable to fetch content',
          content: '',
          publishedDate: null,
          domain: 'unknown',
        };
      }
    }
  }

  static analyzeDomainCredibility(domain: string): number {
    const credibleDomains = [
      'bbc.com', 'bbc.co.uk', 'reuters.com', 'apnews.com', 'npr.org',
      'nature.com', 'science.org', 'sciencemag.org', 'who.int', 'cdc.gov',
      'nasa.gov', 'nytimes.com', 'washingtonpost.com', 'theguardian.com',
      'economist.com', 'wsj.com', 'ft.com', 'atlantic.com', 'newyorker.com',
      'nationalgeographic.com', 'smithsonianmag.com', 'pnas.org', 'nejm.org'
    ];

    const suspiciousDomains = [
      'naturalnews.com', 'infowars.com', 'breitbart.com', 'dailymail.co.uk',
      'rt.com', 'sputniknews.com', 'beforeitsnews.com', 'worldnewsdailyreport.com'
    ];

    if (credibleDomains.some(trusted => domain.includes(trusted))) return 85;
    if (suspiciousDomains.some(suspicious => domain.includes(suspicious))) return 25;

    let score = 50;
    if (domain.endsWith('.gov') || domain.endsWith('.edu')) score += 25;
    if (domain.endsWith('.com') || domain.endsWith('.org') || domain.endsWith('.net')) score += 5;
    if (domain.endsWith('.tk') || domain.endsWith('.ml') || domain.endsWith('.ga')) score -= 20;

    return Math.max(0, Math.min(100, score));
  }

  static analyzeContentPatterns(content: string, title: string): number {
    let score = 50;

    const misleadingPatterns = [
      /breaking.*!/i, /you won't believe/i, /shocking.*revealed/i,
      /doctors hate this/i, /one weird trick/i, /click here/i,
      /must see/i, /unbelievable/i, /secret.*revealed/i, /they don't want you to know/i,
    ];

    const credibilityIndicators = [
      /according to/i, /study shows/i, /research indicates/i, /expert says/i,
      /published in/i, /peer.reviewed/i, /source:/i, /references:/i, /methodology/i,
    ];

    const misleadingCount = misleadingPatterns.filter(pattern =>
      pattern.test(title) || pattern.test(content)
    ).length;
    score -= misleadingCount * 10;

    const credibilityCount = credibilityIndicators.filter(pattern =>
      pattern.test(content)
    ).length;
    score += credibilityCount * 5;

    if (content.length < 100) score -= 15;
    else if (content.length > 500) score += 10;

    const capsRatio = (content.match(/[A-Z]/g) || []).length / Math.max(1, content.length);
    if (capsRatio > 0.3) score -= 20;

    const exclamationCount = (content.match(/!/g) || []).length;
    if (exclamationCount > content.length / 100) score -= 15;

    return Math.max(0, Math.min(100, score));
  }

  static determineBiasRating(domainScore: number, contentScore: number): 'low' | 'medium' | 'high' {
    const averageScore = (domainScore + contentScore) / 2;
    if (averageScore >= 70) return 'low';
    if (averageScore >= 40) return 'medium';
    return 'high';
  }

  static async performFactCheck(url: string, scrapedContent: ScrapedContent): Promise<FactCheckResult> {
    try {
      const domainScore = this.analyzeDomainCredibility(scrapedContent.domain);
      const contentScore = this.analyzeContentPatterns(scrapedContent.content, scrapedContent.title);

      const credibilityScore = Math.round((domainScore + contentScore) / 2);
      const biasRating = this.determineBiasRating(domainScore, contentScore);

      let verdict: 'verified' | 'misleading' | 'false' | 'pending';
      if (credibilityScore >= 75) verdict = 'verified';
      else if (credibilityScore >= 45) verdict = 'misleading';
      else verdict = 'false';

      return {
        verdict,
        credibilityScore,
        biasRating,
        factCheckScore: credibilityScore,
        sourcesCount: 0,
        sources: [],
        summary: `Content analyzed based on domain credibility and content patterns.`,
        details: `Domain score: ${domainScore}/100, Content analysis: ${contentScore}/100`,
      };
    } catch (error) {
      console.error('Error performing fact check:', error);
      return {
        verdict: 'pending',
        credibilityScore: 50,
        biasRating: 'medium',
        factCheckScore: 50,
        sourcesCount: 0,
        sources: [],
        summary: 'Unable to complete fact-check analysis due to technical issues.',
      };
    }
  }
}
