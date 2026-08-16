import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, MessageCircle, Share, Flag, Shield, Search, Flame, Medal } from "lucide-react";

interface FeedPost {
  id: string;
  author?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImageUrl?: string;
  };
  content: string;
  createdAt: string;
  imageUrl?: string;
  likesCount?: number;
  commentsCount?: number;
  signalLabel?: string;
  signalDetail?: string;
  linkCheck?: {
    verdict: "verified" | "misleading" | "false" | "pending";
  };
}

export default function FeedTab() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [linksChecked, setLinksChecked] = useState<number>((user as any)?.linksChecked || 0);

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "verified": return "bg-success text-white";
      case "misleading": return "bg-warning text-white";
      case "false": return "bg-destructive text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "verified": return "✅";
      case "misleading": return "⚠️";
      case "false": return "❌";
      default: return "⏳";
    }
  };

  const getVerdictText = (verdict: string) => {
    switch (verdict) {
      case "verified": return "Verified";
      case "misleading": return "Misleading";
      case "false": return "False";
      default: return "Checking";
    }
  };

  const getSignalCopy = (verdict: string) => {
    switch (verdict) {
      case "verified":
        return {
          label: "Live signal: trusted source",
          detail: "AI source insight: multiple credible signals and stronger source support.",
        };
      case "misleading":
        return {
          label: "Live signal: misleading",
          detail: "AI source insight: weak support, missing context, or framing shifts the meaning.",
        };
      case "false":
        return {
          label: "Live signal: likely false",
          detail: "AI source insight: little corroboration and weak source quality. Consider not sharing.",
        };
      default:
        return {
          label: "Live signal: checking",
          detail: "AI source insight: cross-checking the claim and available evidence.",
        };
    }
  };

  useEffect(() => {
    const dummyPosts: FeedPost[] = [
      {
        id: "1",
        author: { firstName: "Abike", lastName: "Adeniyi", profileImageUrl: "" },
        content: "Check out this amazing article on AI advancements!",
        createdAt: new Date().toISOString(),
        likesCount: 12,
        commentsCount: 3,
        linkCheck: { verdict: "verified" },
        signalLabel: "Live signal: trusted source",
        signalDetail: "AI source insight: multiple credible signals and stronger source support.",
        imageUrl: "https://picsum.photos/500/300?random=1",
      },
      {
        id: "2",
        author: { firstName: "Pawana", lastName: "Singh", profileImageUrl: "" },
        content: "This claim seems suspicious to me.",
        createdAt: new Date().toISOString(),
        likesCount: 5,
        commentsCount: 1,
        linkCheck: { verdict: "misleading" },
        signalLabel: "Live signal: misleading",
        signalDetail: "AI source insight: weak support, missing context, or framing shifts the meaning.",
      },
      {
        id: "3",
        author: { firstName: "Destiny", lastName: "Sha", profileImageUrl: "" },
        content: "This claim doesn't seem right.",
        createdAt: new Date().toISOString(),
        likesCount: 5,
        commentsCount: 1,
        linkCheck: { verdict: "misleading" },
        signalLabel: "Live signal: misleading",
        signalDetail: "AI source insight: weak support, missing context, or framing shifts the meaning.",
      },
      {
        id: "4",
        author: { firstName: "Nitesh", lastName: "Sing", profileImageUrl: "" },
        content: "This claim seems suspicious to me.",
        createdAt: new Date().toISOString(),
        likesCount: 5,
        commentsCount: 1,
        linkCheck: { verdict: "verified" },
        signalLabel: "Live signal: verified",
        signalDetail: "AI source insight: strong support and credible sources.",
      },
      {
        id: "5",
        author: { firstName: "Anupriya", lastName: "Sharma", email: "anupriya@example.com" },
        content: "Totally false news about the latest tech!",
        createdAt: new Date().toISOString(),
        likesCount: 2,
        commentsCount: 0,
        linkCheck: { verdict: "false" },
        signalLabel: "Live signal: likely false",
        signalDetail: "AI source insight: little corroboration and weak source quality. Consider not sharing.",
      },
      {
        id: "6",
        author: { firstName: "Yara", lastName: "Muhammaned", profileImageUrl: "" },
        content: "Check out this amazing article on AI advancements!",
        createdAt: new Date().toISOString(),
        likesCount: 12,
        commentsCount: 3,
        linkCheck: { verdict: "verified" },
        signalLabel: "Live signal: trusted source",
        signalDetail: "AI source insight: multiple credible signals and stronger source support.",
        imageUrl: "https://picsum.photos/500/300?random=1",
      },
      {
        id: "7",
        author: { firstName: "Enoch", lastName: "Oluwafemi", profileImageUrl: "" },
        content: "Check out this amazing article on AI advancements!",
        createdAt: new Date().toISOString(),
        likesCount: 12,
        commentsCount: 3,
        linkCheck: { verdict: "verified" },
        signalLabel: "Live signal: trusted source",
        signalDetail: "AI source insight: multiple credible signals and stronger source support.",
        imageUrl: "https://picsum.photos/500/300?random=1",
      },
      {
        id: "8",
        author: { firstName: "Bhavya", lastName: "K", profileImageUrl: "" },
        content: "This claim seems suspicious to me.",
        createdAt: new Date().toISOString(),
        likesCount: 5,
        commentsCount: 1,
        linkCheck: { verdict: "misleading" },
        signalLabel: "Live signal: misleading",
        signalDetail: "AI source insight: low support and credible sources.",
      },
    ];

    setPosts(dummyPosts);

    const interval = setInterval(() => {
      const verdictOptions = ["verified", "misleading", "false", "pending"] as const;
      const verdict = verdictOptions[Math.floor(Math.random() * verdictOptions.length)];
      const signal = getSignalCopy(verdict);
      const newPost: FeedPost = {
        id: Math.random().toString(),
        author: { firstName: "Demo", lastName: "User" },
        content: "This is a new post appearing in real time!",
        createdAt: new Date().toISOString(),
        likesCount: Math.floor(Math.random() * 10),
        commentsCount: Math.floor(Math.random() * 5),
        linkCheck: { verdict },
        signalLabel: signal.label,
        signalDetail: signal.detail,
        imageUrl: Math.random() > 0.5 ? `https://picsum.photos/500/300?random=${Math.floor(Math.random() * 100)}` : undefined,
      };

      setPosts((prev) => [newPost, ...prev]);
      setLinksChecked((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 rounded-[28px] social-surface p-4 shadow-[0_10px_30px_rgba(37,52,79,0.06)] border border-white/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">For you</p>
              <h2 className="text-2xl font-extrabold mt-1">Prova Feed</h2>
            </div>
            <div className="rounded-full bg-[#edf3ff] px-3 py-1.5 text-xs font-semibold text-[#25344f] flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live signal view
            </div>
          </div>
        </div>

        {user && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-0 shadow-[0_12px_28px_rgba(37,52,79,0.06)] bg-gradient-to-br from-white to-[#f7fbff] rounded-[22px]">
              <CardContent className="p-5 flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-[0.14em]">Signals</p>
                  <p className="text-2xl font-bold text-primary mt-1">{linksChecked}</p>
                </div>
                <div className="w-12 h-12 bg-[#edf3ff] rounded-2xl flex items-center justify-center">
                  <Search className="w-5 h-5 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-[0_12px_28px_rgba(37,52,79,0.06)] bg-gradient-to-br from-white to-[#f5fff9] rounded-[22px]">
              <CardContent className="p-5 flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-[0.14em]">Streak</p>
                  <p className="text-2xl font-bold text-success mt-1">{(user as any)?.streakDays || 0}</p>
                </div>
                <div className="w-12 h-12 bg-[#edfdf5] rounded-2xl flex items-center justify-center">
                  <Flame className="w-5 h-5 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-[0_12px_28px_rgba(37,52,79,0.06)] bg-gradient-to-br from-white to-[#fffaf3] rounded-[22px]">
              <CardContent className="p-5 flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-[0.14em]">Trust</p>
                  <p className="text-2xl font-bold text-warning mt-1">{(user as any)?.trustScore || 50}%</p>
                </div>
                <div className="w-12 h-12 bg-[#fff4e8] rounded-2xl flex items-center justify-center">
                  <Medal className="w-5 h-5 text-warning" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="space-y-5">
          {posts.map((post) => {
            const verdict = post.linkCheck?.verdict || "pending";
            const signal = getSignalCopy(verdict);
            const signalLabel = post.signalLabel || signal.label;
            const signalDetail = post.signalDetail || signal.detail;

            return (
              <Card key={post.id} className="border-0 shadow-[0_12px_28px_rgba(37,52,79,0.06)] bg-white/90 rounded-[28px] overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <Avatar className="w-11 h-11 ring-2 ring-slate-100">
                      <AvatarImage src={post.author?.profileImageUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-[#25344f] to-[#7aa3d6] text-white font-semibold">
                        {post.author?.firstName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-semibold text-[#25344f]">
                          {post.author?.firstName && post.author?.lastName
                            ? `${post.author.firstName} ${post.author.lastName}`
                            : post.author?.email || "Anonymous"}
                        </h4>
                        {post.linkCheck && (
                          <Badge className={`${getVerdictColor(post.linkCheck.verdict)} rounded-full`}>
                            {getVerdictIcon(post.linkCheck.verdict)} {getVerdictText(post.linkCheck.verdict)}
                          </Badge>
                        )}
                        <span className="text-gray-500 text-xs">{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">Live signal</p>
                        <p className="text-sm font-semibold text-slate-700">{signalLabel}</p>
                        <p className="text-xs text-slate-600 mt-1">{signalDetail}</p>
                      </div>

                      <p className="text-[15px] text-gray-700 leading-6 mb-3">{post.content}</p>
                      {post.imageUrl && <img src={post.imageUrl} alt="Post content" className="w-full h-52 sm:h-60 object-cover rounded-[20px] mb-3" />}
                      <div className="flex items-center gap-4 text-sm text-gray-500 pt-1">
                        <button className="inline-flex items-center gap-1 hover:text-[#25344f] transition-colors">
                          <ThumbsUp className="w-4 h-4" /> {post.likesCount ?? 0}
                        </button>
                        <button className="inline-flex items-center gap-1 hover:text-[#25344f] transition-colors">
                          <MessageCircle className="w-4 h-4" /> {post.commentsCount ?? 0}
                        </button>
                        <button className="inline-flex items-center gap-1 hover:text-[#25344f] transition-colors ml-auto">
                          <Share className="w-4 h-4" /> Share
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
