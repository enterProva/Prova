import { Card, CardContent } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SocialCompanionTab() {
  return (
    <div className="p-4 lg:p-6" data-testid="tab-social-companion">
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Bot className="w-12 h-12 text-gray-400" data-testid="icon-bot" />
        </div>
        <h2 className="text-2xl font-bold mb-4" data-testid="text-social-companion-title">
          Social Media Companion
        </h2>
        <p className="text-gray-600 mb-8" data-testid="text-social-companion-description">
          AI-powered insights for your social media feeds
        </p>
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          Coming Soon
        </Badge>
      </div>
    </div>
  );
}
