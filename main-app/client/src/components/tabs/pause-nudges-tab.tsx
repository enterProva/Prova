import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PauseCircle, BookOpen, Heart, CheckCircle, Lightbulb, RefreshCcw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Nudge {
  prompt: string;
  type: "reading" | "emotional" | "critical" | "reflection" | "source" | "context";
  lesson?: string;
}

const LESSONS: Nudge[] = [
  { prompt: "Have you read beyond the headline?", type: "reading", lesson: "Headlines can be misleading. Read the full content before reacting." },
  { prompt: "Have you verified the source?", type: "source", lesson: "Check the credibility of the source before sharing." },
  { prompt: "How does this content make you feel?", type: "emotional", lesson: "Notice your emotional reaction before responding." },
  { prompt: "Would you share this in person?", type: "reflection", lesson: "If you wouldn’t say it to a friend, think twice online." },
  { prompt: "Is this helping or hurting the conversation?", type: "reflection", lesson: "Pause to reflect on the impact of your share." },
  { prompt: "Can you summarize this content in your own words?", type: "reading", lesson: "Summarizing helps verify your understanding." },
  { prompt: "Is the source biased or neutral?", type: "source", lesson: "Check multiple perspectives to avoid bias." },
  { prompt: "Are you feeling triggered?", type: "emotional", lesson: "Pause if your emotions are high to prevent reactive sharing." },
  { prompt: "Would you fact-check before sharing?", type: "critical", lesson: "Fact-checking improves digital trust." },
  { prompt: "What facts are actually included here?", type: "context", lesson: "Look for evidence, not just emotion or outrage." },
  { prompt: "Is this claim supported by trustworthy reporting?", type: "source", lesson: "Reliable reporting is stronger than a single viral post." },
  { prompt: "What context is missing?", type: "context", lesson: "Missing context can distort the meaning of a post." },
  { prompt: "Could this be a repost without evidence?", type: "critical", lesson: "A repost is not proof. Check whether the original source is credible." },
  { prompt: "Does the post give dates, names, and specifics?", type: "reading", lesson: "Vague claims are harder to verify and easier to spread." },
  { prompt: "Is there a better, more credible version of this story elsewhere?", type: "source", lesson: "Look for independent confirmation before sharing." },
  { prompt: "What would make this post more trustworthy?", type: "context", lesson: "Trust grows when details, evidence, and sources are clear." },
  { prompt: "Am I reacting because it feels important, or because it is verified?", type: "reflection", lesson: "Pause between feeling and forwarding." },
  { prompt: "Would I want this shared about me or my family?", type: "emotional", lesson: "A quick empathy check can reduce harmful sharing." },
  { prompt: "Is this an opinion, a claim, or a verified fact?", type: "critical", lesson: "Not every strong claim is a proven fact." },
  { prompt: "Have I checked whether the post is satire, rumor, or a real report?", type: "context", lesson: "The framing matters as much as the content." },
];

export default function PauseNudgesTab() {
  const { user } = useAuth();

  const [currentNudge, setCurrentNudge] = useState<Nudge>(LESSONS[0]);
  const [showResponse, setShowResponse] = useState(false);
  const [stats, setStats] = useState({
    pauseCount: (user as any)?.pauseCount || 0,
    mindfulShares: (user as any)?.mindfulShares || 0,
    streakDays: (user as any)?.streakDays || 0,
  });

  // Nudge rotation every 10 seconds
  useEffect(() => {
    const nudgeInterval = setInterval(() => {
      const randomNudge = LESSONS[Math.floor(Math.random() * LESSONS.length)];
      setCurrentNudge(randomNudge);
    }, 10000);
    return () => clearInterval(nudgeInterval);
  }, []);

  // Real-time stats increment for demo
  useEffect(() => {
    const statsInterval = setInterval(() => {
      setStats((prev) => ({
        pauseCount: prev.pauseCount + Math.floor(Math.random() * 2),
        mindfulShares: prev.mindfulShares + Math.floor(Math.random() * 2),
        streakDays: prev.streakDays + 1,
      }));
    }, 15000);
    return () => clearInterval(statsInterval);
  }, []);

  const handleResponse = (response: "yes" | "no") => {
    setShowResponse(true);

    if (response === "yes") {
      setStats((prev) => ({
        ...prev,
        pauseCount: prev.pauseCount + 1,
        mindfulShares: currentNudge.type === "reading" ? prev.mindfulShares + 1 : prev.mindfulShares,
      }));
    }

    setTimeout(() => {
      setShowResponse(false);
      const randomNudge = LESSONS[Math.floor(Math.random() * LESSONS.length)];
      setCurrentNudge(randomNudge);
    }, 2000);
  };

  const getIcon = (type: Nudge["type"]) => {
    switch (type) {
      case "reading": return <BookOpen className="w-6 h-6 text-primary" />;
      case "emotional": return <Heart className="w-6 h-6 text-success" />;
      case "critical": return <Lightbulb className="w-6 h-6 text-yellow-500" />;
      case "reflection": return <PauseCircle className="w-6 h-6 text-purple-500" />;
      case "source": return <CheckCircle className="w-6 h-6 text-blue-500" />;
      case "context": return <RefreshCcw className="w-6 h-6 text-cyan-500" />;
      default: return <PauseCircle className="w-6 h-6" />;
    }
  };

  return (
    <div className="p-4 lg:p-6" data-testid="tab-pause-nudges">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Pause Nudges</h2>
          <p className="text-gray-600">Take a mindful pause before reacting online.</p>
        </div>

        {/* Active Nudge */}
        {!showResponse ? (
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg mb-6 transition-all duration-500">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                {getIcon(currentNudge.type)}
              </div>
              <h3 className="text-xl font-bold mb-3">Before you act...</h3>
              <p className="text-lg mb-6">{currentNudge.prompt}</p>
              {currentNudge.lesson && (
                <p className="text-sm text-white/80 mb-6 italic">{currentNudge.lesson}</p>
              )}
              <div className="flex space-x-4 justify-center">
                <Button
                  onClick={() => handleResponse("yes")}
                  className="bg-white text-primary px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors duration-200"
                >
                  I paused
                </Button>
                <Button
                  onClick={() => handleResponse("no")}
                  variant="outline"
                  className="bg-white text-primary px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors duration-200"
                >
                  I’ll verify
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg mb-6 transition-all duration-500">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Nice pause.</h3>
              <p className="text-lg mb-4">Taking a moment to slow down helps build a more careful digital habit.</p>
              <p className="text-white/80 italic">Next mindful moment coming up...</p>
            </CardContent>
          </Card>
        )}

        {/* Nudge Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {["reading", "emotional", "critical", "reflection", "source", "context"].map((type) => (
            <Card key={type}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    {getIcon(type as any)}
                  </div>
                  <h3 className="font-semibold capitalize">{type} Prompts</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  {LESSONS.filter((n) => n.type === type).map((n, idx) => (
                    <li key={idx}>• {n.prompt}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Real-time Progress Tracking */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Your Mindful Journey</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center transition-all duration-500">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-xl">{stats.pauseCount}</span>
                </div>
                <p className="font-medium">Pauses Taken</p>
                <p className="text-sm text-gray-500">This week</p>
              </div>
              <div className="text-center transition-all duration-500">
                <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-xl">{stats.mindfulShares}</span>
                </div>
                <p className="font-medium">Mindful Shares</p>
                <p className="text-sm text-gray-500">This week</p>
              </div>
              <div className="text-center transition-all duration-500">
                <div className="w-16 h-16 bg-warning rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-xl">{stats.streakDays}</span>
                </div>
                <p className="font-medium">Day Streak</p>
                <p className="text-sm text-gray-500">Keep it up!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
