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
  linkCheck?: {
    verdict: "verified" | "misleading" | "false" | "pending";
  };
}

export default function FeedTab() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [linksChecked, setLinksChecked] = useState<number>((user as any)?.linksChecked || 0);

  // Generate dummy posts for showcase
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
      },
      {
        id: "3",
        author: { firstName: "Anupriya", lastName: "Sharma", email: "anupriya@example.com" },
        content: "Totally false news about the latest tech!",
        createdAt: new Date().toISOString(),
        likesCount: 2,
        commentsCount: 0,
        linkCheck: { verdict: "false" },
      },
    ];

    setPosts(dummyPosts);

    // Simulate new posts appearing and links checked incrementing
    const interval = setInterval(() => {
      const newPost: FeedPost = {
        id: Math.random().toString(),
        author: { firstName: "Demo", lastName: "User" },
        content: "This is a new post appearing in real time!",
        createdAt: new Date().toISOString(),
        likesCount: Math.floor(Math.random() * 10),
        commentsCount: Math.floor(Math.random() * 5),
        linkCheck: { verdict: ["verified", "misleading", "false", "pending"][Math.floor(Math.random() * 4)] as any },
        imageUrl: Math.random() > 0.5 ? `https://picsum.photos/500/300?random=${Math.floor(Math.random() * 100)}` : undefined,
      };

      setPosts((prev) => [newPost, ...prev]);
      setLinksChecked((prev) => prev + 1); // increment links checked whenever a new post appears
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Your Feed</h2>
          <p className="text-gray-600">Stay informed with verified content and community insights</p>
        </div>

        {/* Stats Cards */}
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-gray-600 text-sm">Links Checked</p>
                  <p className="text-2xl font-bold text-primary">{linksChecked}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Search className="w-6 h-6 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-gray-600 text-sm">Streak</p>
                  <p className="text-2xl font-bold text-success">{(user as any)?.streakDays || 0} days</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Flame className="w-6 h-6 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-gray-600 text-sm">Trust Score</p>
                  <p className="text-2xl font-bold text-warning">{(user as any)?.trustScore || 50}%</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Medal className="w-6 h-6 text-warning" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feed Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="shadow-sm border">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={post.author?.profileImageUrl} />
                    <AvatarFallback>{post.author?.firstName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold">
                        {post.author?.firstName && post.author?.lastName
                          ? `${post.author.firstName} ${post.author.lastName}`
                          : post.author?.email || "Anonymous"}
                      </h4>
                      {post.linkCheck && (
                        <Badge className={getVerdictColor(post.linkCheck.verdict)}>
                          {getVerdictIcon(post.linkCheck.verdict)} {getVerdictText(post.linkCheck.verdict)}
                        </Badge>
                      )}
                      <span className="text-gray-500 text-sm">{new Date(post.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-gray-800 mb-4">{post.content}</p>
                    {post.imageUrl && <img src={post.imageUrl} alt="Post content" className="w-full h-48 object-cover rounded-xl mb-4" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
