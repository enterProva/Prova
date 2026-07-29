import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Check, AlertTriangle, X, Brain, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface LinkCheckResult {
  id?: string;
  url: string;
  verdict: "verified" | "misleading" | "false" | "pending";
  credibilityScore: number;
  biasRating: "low" | "medium" | "high";
  factCheckScore: number;
  sourcesCount: number;
  sourceUrls?: string[];
  factCheckSources?: string[];
  sources?: string[];
  summary?: string;
  modelUsed?: string;
  reasoning?: string;
  searchResults?: any[];
  title?: string;
  domain?: string;
  checkedAt?: string;
  publicationDate?: string | null;
  content?: string;
}

export default function LinkCheckerTab() {
  const [url, setUrl] = useState("");
  const [lastCheckedUrl, setLastCheckedUrl] = useState("");
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recentChecks, isLoading: recentLoading } = useQuery<LinkCheckResult[]>({
    queryKey: ["/api/link-checks/user"],
  });

  const checkLinkMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/link-checks", { url });
      return response.json() as Promise<LinkCheckResult>;
    },
    onSuccess: (data) => {
      toast({
        title: "Link Analyzed",
        description: `Analysis completed using ${data.modelUsed || 'AI model'}`,
      });
      setLastCheckedUrl(url);
      setUrl("");

      queryClient.setQueryData<LinkCheckResult[]>(
        ["/api/link-checks/user"],
        (oldData = []) => [data, ...oldData]
      );
    },
    onError: () => {
      toast({
        title: "Check Failed",
        description: "Failed to analyze the link. Please try again.",
        variant: "destructive",
      });
    },
  });

  const latestCheck = recentChecks?.[0];
  const shouldShowResult = lastCheckedUrl && latestCheck && latestCheck.url === lastCheckedUrl;

  const handleCheck = () => {
    if (!url.trim()) {
      toast({ title: "URL Required", description: "Please enter a URL to check.", variant: "destructive" });
      return;
    }
    try {
      new URL(url);
      checkLinkMutation.mutate(url);
    } catch {
      toast({ title: "Invalid URL", description: "Please enter a valid URL.", variant: "destructive" });
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "verified": return <Check className="w-6 h-6 text-white" />;
      case "misleading": return <AlertTriangle className="w-6 h-6 text-white" />;
      case "false": return <X className="w-6 h-6 text-white" />;
      default: return <Search className="w-6 h-6 text-white" />;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "verified": return "bg-green-500";
      case "misleading": return "bg-yellow-500";
      case "false": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getVerdictText = (verdict: string) => {
    switch (verdict) {
      case "verified": return "Verified Content";
      case "misleading": return "Misleading Content";
      case "false": return "False Content";
      default: return "Analysis Pending";
    }
  };

  const getVerdictDescription = (verdict: string, summary?: string, credibilityScore?: number, domain?: string) => {
    if (summary && summary.trim()) {
      return summary;
    }

    switch (verdict) {
      case "verified": 
        return `This content from ${domain || 'the source'} appears to be credible based on our analysis. It contains factual information that aligns with reliable sources.`;
      case "misleading": 
        return `This content from ${domain || 'the source'} contains some misleading elements or lacks proper context. Please verify with additional sources before sharing.`;
      case "false": 
        return `Our analysis suggests this content from ${domain || 'the source'} may contain inaccurate information. Please verify with reliable sources before sharing.`;
      default: 
        return "We are currently analyzing this content. Please check back soon for results.";
    }
  };

  const getDisplayTitle = (check: LinkCheckResult) => {
    if (check.title && check.title !== check.url) {
      return check.title;
    }
    
    try {
      const urlObj = new URL(check.url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1];
        return lastPart
          .replace(/-/g, ' ')
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
      return urlObj.hostname;
    } catch {
      return check.url;
    }
  };

  const getModelDisplayName = (modelUsed?: string) => {
    if (!modelUsed) return "AI Model";
    
    switch (modelUsed) {
      case "compound-beta": return "Compound Beta";
      case "compound-beta-mini": return "Compound Beta Mini";
      case "openai/gpt-oss-120b": return "GPT-OSS 120B";
      case "openai/gpt-oss-20b": return "GPT-OSS 20B";
      default: return modelUsed;
    }
  };

  const getSourceUrls = (check: LinkCheckResult) => {
    if (Array.isArray(check.sourceUrls) && check.sourceUrls.length > 0) {
      return check.sourceUrls;
    }

    if (Array.isArray(check.sources) && check.sources.length > 0) {
      return check.sources;
    }

    return Array.isArray(check.factCheckSources) ? check.factCheckSources : [];
  };

  return (
    <div className="p-4 sm:p-6 overflow-x-hidden" data-testid="tab-link-checker">
      <div className="w-full px-4">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2" data-testid="text-link-checker-title">Link Checker</h2>
          <p className="text-gray-600" data-testid="text-link-checker-description">
            Verify the credibility of any link or article with AI-powered analysis
          </p>
        </div>

        {/* Link Input Form */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <Label htmlFor="url-input" className="text-sm font-medium text-gray-700 mb-2 block">Paste your link here</Label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Input
                  id="url-input"
                  type="url"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCheck()}
                  className="flex-1 w-full"
                  data-testid="input-url"
                />
                <Button onClick={handleCheck} disabled={checkLinkMutation.isPending} className="w-full sm:w-auto shrink" data-testid="button-check-link">
                  <Search className="w-4 h-4 mr-2" />
                  {checkLinkMutation.isPending ? "Analyzing..." : "Check"}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                We&apos;ll analyze the page on the server and return a summary, scores, and supporting source links.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Latest Check */}
        {shouldShowResult && latestCheck && (
          <Card className="mb-6" data-testid="card-check-result">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
                <div className={`w-16 h-16 ${getVerdictColor(latestCheck.verdict)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  {getVerdictIcon(latestCheck.verdict)}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-bold mb-1 break-all" data-testid="text-verdict">
  <strong className="block overflow-hidden">{latestCheck.url}</strong>
</h3>
                    <div className="flex items-center space-x-2 mb-2 flex-wrap">
                      <span className={`inline-block px-2 py-1 rounded-full text-white text-xs font-medium ${getVerdictColor(latestCheck.verdict)}`}>
                        {getVerdictText(latestCheck.verdict).toUpperCase()}
                      </span>
                      {latestCheck.modelUsed && (
                        <Badge variant="outline" className="text-xs mt-1 sm:mt-0">
                          <Brain className="w-3 h-3 mr-1" />
                          {getModelDisplayName(latestCheck.modelUsed)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-2" data-testid="text-verdict-description">
                    {getVerdictDescription(latestCheck.verdict, latestCheck.summary, latestCheck.credibilityScore, latestCheck.domain)}
                  </p>

                  {latestCheck.title && latestCheck.title !== latestCheck.url && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Article Title</h4>
                      <p className="text-sm" data-testid="text-article-title">{latestCheck.title}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                      <p className="text-sm font-medium text-gray-600">Credibility</p>
                      <p className={`font-semibold ${
                        (latestCheck.credibilityScore || 0) >= 70 ? 'text-green-600' :
                        (latestCheck.credibilityScore || 0) >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {(latestCheck.credibilityScore || 0) >= 70 ? 'High' :
                         (latestCheck.credibilityScore || 0) >= 40 ? 'Medium' : 'Low'}
                      </p>
                      <p className="text-xs text-gray-500">{latestCheck.credibilityScore || 0}/100</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                      <p className="text-sm font-medium text-gray-600">Bias Rating</p>
                      <p className={`font-semibold capitalize ${
                        latestCheck.biasRating === 'low' ? 'text-green-600' :
                        latestCheck.biasRating === 'medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>{latestCheck.biasRating || 'Unknown'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                      <p className="text-sm font-medium text-gray-600">Fact-Check Score</p>
                      <p className={`font-semibold ${
                        (latestCheck.factCheckScore || 0) >= 70 ? 'text-green-600' :
                        (latestCheck.factCheckScore || 0) >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>{latestCheck.factCheckScore || 0}/100</p>
                    </div>
                  </div>

                  {getSourceUrls(latestCheck).length > 0 && (
                    <div className="mt-3 overflow-x-auto">
                      <h4 className="font-semibold text-sm text-gray-600 mb-2">Sources Referenced</h4>
                      <div className="bg-gray-50 rounded-lg p-3 w-full break-words overflow-hidden">
                        <ul className="space-y-2">
                          {getSourceUrls(latestCheck).slice(0, 5).map((src: string, idx: number) => (
                            <li key={idx} className="text-sm flex items-start space-x-2">
                              <ExternalLink className="w-3 h-3 mt-0.5 text-gray-400 flex-shrink-0" />
                              {src.startsWith('http') ? (
                                <a href={src} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                  {src}
                                </a>
                              ) : (
                                <span className="text-gray-700">{src}</span>
                              )}
                            </li>
                          ))}
                          {getSourceUrls(latestCheck).length > 5 && (
                            <li className="text-xs text-gray-500">
                              +{getSourceUrls(latestCheck).length - 5} more sources
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Technical details and AI summary remain unchanged */}
                  {(latestCheck.reasoning || latestCheck.searchResults) && (
                    <Collapsible open={showTechnicalDetails} onOpenChange={setShowTechnicalDetails}>
                      <CollapsibleTrigger className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors mt-3">
                        {showTechnicalDetails ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                        <span>Show Technical Details</span>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3 space-y-3">
                        {latestCheck.reasoning && (
                          <div>
                            <h4 className="font-semibold text-sm text-gray-600 mb-2 flex items-center">
                              <Brain className="w-4 h-4 mr-1" /> AI Reasoning Process
                            </h4>
                            <div className="bg-blue-50 rounded-lg p-3">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{latestCheck.reasoning}</p>
                            </div>
                          </div>
                        )}
                        {latestCheck.searchResults && latestCheck.searchResults.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-gray-600 mb-2 flex items-center">
                              <Search className="w-4 h-4 mr-1" /> Web Search Results Used
                            </h4>
                            <div className="bg-green-50 rounded-lg p-3 max-h-60 sm:max-h-40 overflow-y-auto">
                              <div className="space-y-2">
                                {latestCheck.searchResults.map((result: any, idx: number) => (
                                  <div key={idx} className="text-sm">
                                    <p className="font-medium text-green-800">{result.title || `Search Result ${idx + 1}`}</p>
                                    {result.url && (
                                      <a href={result.url} target="_blank" rel="noopener noreferrer" className="block w-full text-blue-600 hover:underline text-xs break-all overflow-hidden">
                                        {result.url}
                                      </a>
                                    )}
                                    {result.snippet && (
                                      <p className="text-gray-600 text-xs mt-1">{result.snippet}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        {latestCheck.modelUsed && (
                          <div>
                            <h4 className="font-semibold text-sm text-gray-600 mb-2">Analysis Model</h4>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm text-gray-700">
                                This analysis was performed using <strong>{getModelDisplayName(latestCheck.modelUsed)}</strong>
                                {latestCheck.modelUsed.includes('compound-beta') 
                                  ? ' with built-in web search capabilities' 
                                  : ' with external web search tools'
                                }
                              </p>
                            </div>
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {latestCheck.summary && latestCheck.summary.length > 200 && (
                    <div className="mt-3">
                      <h4 className="font-semibold text-sm text-gray-600 mb-2">Detailed Analysis</h4>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{latestCheck.summary}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Checks */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4" data-testid="text-recent-checks">Recent Checks</h3>
            {recentLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-center justify-between p-3 bg-gray-50 rounded-xl space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                      <Skeleton className="w-8 h-8 rounded-lg" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : recentChecks && recentChecks.length > 0 ? (
              <div className="space-y-3">
                {recentChecks.map((check) => {
                  const displaySource = getDisplayTitle(check);
                  return (
                    <div key={check.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl gap-4 overflow-hidden" data-testid={`recent-check-${check.id}`}>
                      <div className="flex-1 min-w-0 mb-2 sm:mb-0">
  <div className="flex items-center space-x-2 flex-wrap">
    <p className="font-medium text-sm truncate">{displaySource}</p>

                          <Badge className={`${getVerdictColor(check.verdict)} text-white text-xs`}>{getVerdictText(check.verdict)}</Badge>
                          {check.modelUsed && <Badge variant="outline" className="text-xs">{getModelDisplayName(check.modelUsed)}</Badge>}
                        </div>
                        <p className="text-xs text-gray-500 mb-1">
                          {check.checkedAt && new Date(check.checkedAt).toLocaleDateString()} • {check.domain || (check.url ? new URL(check.url).hostname : '')}
                        </p>
                        {check.summary && (
                          <p className="text-sm text-gray-700 mt-1 line-clamp-2">{check.summary}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-500">Score</p>
                        <p className="text-sm font-medium">{check.credibilityScore || 0}/100</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-600" data-testid="text-no-recent-checks">
                  No recent checks. Start by analyzing a link above.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
