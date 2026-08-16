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