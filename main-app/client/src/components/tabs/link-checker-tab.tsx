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
  finalVerdict?: "verified" | "misleading" | "false" | "pending";
  userDecision?: "real" | "not-real" | "unsure";
  credibilityScore?: number;
  biasRating?: "low" | "medium" | "high";
  factCheckScore?: number;
  sourcesCount?: number;
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

interface LinkCheckerTabProps {
  initialResult?: LinkCheckResult | null;
}

export default function LinkCheckerTab({ initialResult }: LinkCheckerTabProps) {
  const [url, setUrl] = useState("");
  const [lastCheckedUrl, setLastCheckedUrl] = useState("");
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showDecisionOptions, setShowDecisionOptions] = useState(false);
  const [userDecision, setUserDecision] = useState<"real" | "not-real" | "unsure" | null>(null);
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
      setUserDecision(data.userDecision ?? null);

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

  const updateDecisionMutation = useMutation({
    mutationFn: async ({ id, decision }: { id?: string; decision: "real" | "not-real" | "unsure" }) => {
      if (!id) {
        throw new Error("Missing link check ID");
      }

      const response = await apiRequest("PATCH", `/api/link-checks/${id}/decision`, { userDecision: decision });
      return response.json() as Promise<LinkCheckResult>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<LinkCheckResult[]>(["/api/link-checks/user"], (oldData = []) => {
        if (!oldData.length) return [data];
        return oldData.map((item) => item.id === data.id ? { ...item, ...data, verdict: data.finalVerdict ?? data.verdict } : item);
      });
      setUserDecision(data.userDecision ?? null);
      setShowDecisionOptions(false);
      toast({
        title: "Decision saved",
        description: "Your judgment has been saved and now affects the final result for this link.",
      });
    },
    onError: () => {
      toast({
        title: "Decision not saved",
        description: "We could not save your decision for this check.",
        variant: "destructive",
      });
    },
  });

  const latestCheck = initialResult ?? recentChecks?.[0];
  const effectiveVerdict = (latestCheck?.finalVerdict ?? latestCheck?.verdict ?? "pending") as LinkCheckResult["finalVerdict"] extends string ? LinkCheckResult["finalVerdict"] : "verified" | "misleading" | "false" | "pending";
  const effectiveUserDecision = latestCheck?.userDecision ?? userDecision;
  const shouldShowResult = Boolean(initialResult)
    ? Boolean(latestCheck)
    : Boolean(lastCheckedUrl && latestCheck && latestCheck.url === lastCheckedUrl);

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
      case "verified": return "Context signal: likely credible";
      case "misleading": return "Context signal: likely misleading";
      case "false": return "Context signal: likely unreliable";
      default: return "Context still being reviewed";
    }
  };

  const getVerdictDescription = (verdict: string, summary?: string, credibilityScore?: number, domain?: string) => {
    if (summary && summary.trim()) {
      return `${summary} Based on this context, ask: do you think this is real or not?`;
    }

    switch (verdict) {
      case "verified": 
        return `This context from ${domain || 'the source'} looks stronger than average, but the final call is yours. Ask: does this match what you already know, and does it hold up against other reliable sources?`;
      case "misleading": 
        return `This context from ${domain || 'the source'} raises some caution flags. It may be missing context or framing things too strongly. Use this as a cue to check more sources before you share it.`;
      case "false": 
        return `This context from ${domain || 'the source'} looks unreliable or weakly supported. Prova is highlighting the risk, but you still decide what you believe and share.`;
      default: 
        return "We’re gathering the available context to help you assess the story. The final decision still rests with you.";
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

  const buildSourceInsight = (result: LinkCheckResult) => {
    const score = result.credibilityScore ?? 0;
    const bias = result.biasRating ?? 'medium';

    if (result.verdict === 'verified') {
      return {
        label: 'AI source insight: stronger support',
        detail: `This looks relatively credible with a ${score}/100 credibility score and ${bias} bias signal. It still helps to check whether the source matches what you already know.`,
      };
    }

    if (result.verdict === 'misleading') {
      return {
        label: 'AI source insight: check the context',
        detail: `This appears to be missing context or framing the claim more strongly than the evidence supports, with a ${score}/100 credibility score and ${bias} bias signal.`,
      };
    }

    if (result.verdict === 'false') {
      return {
        label: 'AI source insight: weak support',
        detail: `This has weak corroboration and a poor support pattern, with a ${score}/100 credibility score and ${bias} bias signal. Treat it as a caution sign before sharing.`,
      };
    }

    return {
      label: 'AI source insight: still checking',
      detail: `Prova is still reviewing source quality, bias, and corroboration for this link before making a call.`,
    };
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

  return (
    <div className="p-3 sm:p-6 overflow-x-hidden" data-testid="tab-link-checker">
      <div className="w-full max-w-6xl mx-auto px-0 sm:px-2">
        {/* Header */}
        <div className="mb-5 rounded-[24px] bg-white/80 border border-slate-100 shadow-[0_12px_28px_rgba(37,52,79,0.06)] p-4 sm:p-5">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 break-words" data-testid="text-link-checker-title">Link Checker</h2>
          <p className="text-sm sm:text-base text-gray-600 leading-6" data-testid="text-link-checker-description">
            Use this as context and cues to help you decide what feels credible, what needs checking, and what to question.
          </p>
        </div>

        {/* Link Input Form */}
        <Card className="mb-5 border-0 shadow-[0_12px_28px_rgba(37,52,79,0.06)] rounded-[26px] bg-white/90">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <Label htmlFor="url-input" className="text-sm font-medium text-gray-700 mb-2 block">Paste your link here</Label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
                <Input
                  id="url-input"
                  type="url"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCheck()}
                  className="flex-1 w-full h-11 text-sm sm:text-base rounded-xl border-slate-200 bg-slate-50/80 min-w-0"
                  data-testid="input-url"
                />
                <Button onClick={handleCheck} disabled={checkLinkMutation.isPending} className="w-full sm:w-auto min-w-[120px] h-11 rounded-xl shrink-0" data-testid="button-check-link">
                  <Search className="w-4 h-4 mr-2" />
                  {checkLinkMutation.isPending ? "Analyzing..." : "Check"}
                </Button>
              </div>
              <p className="text-sm text-gray-500 leading-6 break-words">
                Paste a link and review the context, signals, and sources. Prova helps you assess it — you decide what is real.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Latest Check */}
        {shouldShowResult && latestCheck && (
          <Card className="mb-6 border-0 shadow-[0_12px_28px_rgba(37,52,79,0.06)] rounded-[26px] bg-white/90" data-testid="card-check-result">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className={`w-16 h-16 ${getVerdictColor(effectiveVerdict)} rounded-2xl flex items-center justify-center flex-shrink-0 mx-auto md:mx-0`}>
                  {getVerdictIcon(effectiveVerdict)}
                </div>
                <div className="flex-1 min-w-0 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold break-all leading-7" data-testid="text-verdict">
                      {latestCheck.url}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-white text-[10px] font-semibold tracking-[0.12em] ${getVerdictColor(effectiveVerdict)}`}>
                        {getVerdictText(effectiveVerdict).toUpperCase()}
                      </span>
                      {latestCheck.modelUsed && (
                        <Badge variant="outline" className="text-xs rounded-full">
                          <Brain className="w-3 h-3 mr-1" />
                          {getModelDisplayName(latestCheck.modelUsed)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm sm:text-base text-gray-700 leading-6" data-testid="text-verdict-description">
                      {getVerdictDescription(effectiveVerdict, latestCheck.summary, latestCheck.credibilityScore, latestCheck.domain)}
                    </p>

                    <div className="flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700"
                        onClick={() => setShowDecisionOptions((value) => !value)}
                      >
                        Your decision
                      </Button>
                    </div>
                  </div>

                  {showDecisionOptions && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        variant="default"
                        className="bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm"
                        onClick={() => updateDecisionMutation.mutate({ id: latestCheck.id, decision: "real" })}
                        disabled={updateDecisionMutation.isPending}
                      >
                        Real
                      </Button>
                      <Button
                        variant="default"
                        className="bg-rose-600 hover:bg-rose-700 text-xs sm:text-sm"
                        onClick={() => updateDecisionMutation.mutate({ id: latestCheck.id, decision: "not-real" })}
                        disabled={updateDecisionMutation.isPending}
                      >
                        Not real
                      </Button>
                      <Button
                        variant="outline"
                        className="text-xs sm:text-sm"
                        onClick={() => updateDecisionMutation.mutate({ id: latestCheck.id, decision: "unsure" })}
                        disabled={updateDecisionMutation.isPending}
                      >
                        Unsure
                      </Button>
                    </div>
                  )}

                  {effectiveUserDecision && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <span className="font-medium">Your take:</span>{" "}
                      {effectiveUserDecision === "real" && "Real"}
                      {effectiveUserDecision === "not-real" && "Not real"}
                      {effectiveUserDecision === "unsure" && "Unsure"}
                    </div>
                  )}

                  {latestCheck.title && latestCheck.title !== latestCheck.url && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Article Title</h4>
                      <p className="text-sm text-gray-700" data-testid="text-article-title">{latestCheck.title}</p>
                    </div>
                  )}

                  <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">AI source insight</p>
                    <p className="text-sm font-semibold text-slate-800">{buildSourceInsight({ ...latestCheck, verdict: effectiveVerdict }).label}</p>
                    <p className="text-sm text-slate-600 mt-2 leading-6">{buildSourceInsight({ ...latestCheck, verdict: effectiveVerdict }).detail}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-slate-50 rounded-2xl p-3.5 space-y-1">
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500">Credibility</p>
                      <p className={`font-semibold ${
                        (latestCheck.credibilityScore || 0) >= 70 ? 'text-green-600' :
                        (latestCheck.credibilityScore || 0) >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {(latestCheck.credibilityScore || 0) >= 70 ? 'High' :
                         (latestCheck.credibilityScore || 0) >= 40 ? 'Medium' : 'Low'}
                      </p>
                      <p className="text-xs text-gray-500">{latestCheck.credibilityScore || 0}/100</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3.5 space-y-1">
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500">Bias Rating</p>
                      <p className={`font-semibold capitalize ${
                        latestCheck.biasRating === 'low' ? 'text-green-600' :
                        latestCheck.biasRating === 'medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>{latestCheck.biasRating || 'Unknown'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3.5 space-y-1">
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500">Fact-Check Score</p>
                      <p className={`font-semibold ${
                        (latestCheck.factCheckScore || 0) >= 70 ? 'text-green-600' :
                        (latestCheck.factCheckScore || 0) >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>{latestCheck.factCheckScore || 0}/100</p>
                    </div>
                  </div>

                  {(latestCheck.sources ?? []).length > 0 && (
                    <div className="mt-3 overflow-x-auto">
                      <h4 className="font-semibold text-sm text-gray-600 mb-2">Sources Referenced</h4>
                      <div className="bg-gray-50 rounded-lg p-3 w-full break-words overflow-hidden">
                        <ul className="space-y-2">
                          {(latestCheck.sources ?? []).slice(0, 5).map((src: string, idx: number) => (
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
                          {(latestCheck.sources ?? []).length > 5 && (
                            <li className="text-xs text-gray-500">
                              +{(latestCheck.sources ?? []).length - 5} more sources
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
                                This is one AI signal from <strong>{getModelDisplayName(latestCheck.modelUsed)}</strong>
                                {latestCheck.modelUsed.includes('compound-beta') 
                                  ? ' with built-in web search capabilities' 
                                  : ' with external web search tools'
                                }.
                                It is meant to support your judgment, not replace it.
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
        <Card className="border-0 shadow-[0_12px_28px_rgba(37,52,79,0.06)] rounded-[26px] bg-white/90">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4" data-testid="text-recent-checks">Recent Checks</h3>
            {recentLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-center justify-between p-3 bg-gray-50 rounded-xl gap-3 sm:gap-0">
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
                    <div key={check.id} className="flex flex-col gap-3 p-3.5 sm:p-4 bg-slate-50 rounded-2xl overflow-hidden" data-testid={`recent-check-${check.id}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <p className="font-medium text-sm sm:text-[15px] break-all text-gray-900 min-w-0 max-w-full">{displaySource}</p>

                          <Badge className={`${getVerdictColor(check.finalVerdict ?? check.verdict)} text-white text-[10px] rounded-full whitespace-nowrap`}>
                            {getVerdictText(check.finalVerdict ?? check.verdict)}
                          </Badge>
                          {check.modelUsed && <Badge variant="outline" className="text-[10px] rounded-full whitespace-nowrap">{getModelDisplayName(check.modelUsed)}</Badge>}
                        </div>
                        <p className="text-[11px] sm:text-xs text-gray-500 mt-1 break-all">
                          {check.checkedAt && new Date(check.checkedAt).toLocaleDateString()} • {check.domain || (check.url ? new URL(check.url).hostname : '')}
                        </p>
                        {check.summary && (
                          <p className="text-sm text-gray-700 mt-2 line-clamp-2 break-words">{check.summary}</p>
                        )}
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-gray-500">Score</p>
                        <p className="text-sm font-medium break-all">{check.credibilityScore || 0}/100</p>
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
