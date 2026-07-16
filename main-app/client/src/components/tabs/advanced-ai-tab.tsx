import { Card, CardContent } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdvancedAITab() {
  return (
    <div className="p-4 lg:p-6" data-testid="tab-advanced-ai">
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Brain className="w-12 h-12 text-gray-400" data-testid="icon-brain" />
        </div>
        <h2 className="text-2xl font-bold mb-4" data-testid="text-advanced-ai-title">
          Advanced AI Detection
        </h2>
        <p className="text-gray-600 mb-8" data-testid="text-advanced-ai-description">
          Deepfake detection and bias analysis tools
        </p>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
          Beta Feature
        </Badge>
      </div>
    </div>
  );
}
