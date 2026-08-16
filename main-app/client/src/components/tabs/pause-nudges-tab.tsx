import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PauseCircle, BookOpen, Heart, CheckCircle, Lightbulb, RefreshCcw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Nudge {
  prompt: string;
  type: "reading" | "emotional" | "critical" | "reflection" | "source" | "context";
  lesson?: string;
  correctAnswer?: "positive" | "negative";
}

const LESSONS: Nudge[] = [
  { prompt: "Have you read beyond the headline?", type: "reading", lesson: "Headlines can be misleading. Read the full content before reacting.", correctAnswer: "positive" },
  { prompt: "Have you verified the source?", type: "source", lesson: "Check the credibility of the source before sharing.", correctAnswer: "positive" },
  { prompt: "How does this content make you feel?", type: "emotional", lesson: "Notice your emotional reaction before responding.", correctAnswer: "positive" },
  { prompt: "Would you share this in person?", type: "reflection", lesson: "If you wouldn’t say it to a friend, think twice online.", correctAnswer: "positive" },
  { prompt: "Is this helping or hurting the conversation?", type: "reflection", lesson: "Pause to reflect on the impact of your share.", correctAnswer: "positive" },
  { prompt: "Can you summarize this content in your own words?", type: "reading", lesson: "Summarizing helps verify your understanding.", correctAnswer: "positive" },
  { prompt: "Is the source biased or neutral?", type: "source", lesson: "Check multiple perspectives to avoid bias.", correctAnswer: "positive" },
  { prompt: "Are you feeling triggered?", type: "emotional", lesson: "Pause if your emotions are high to prevent reactive sharing.", correctAnswer: "negative" },
  { prompt: "Would you fact-check before sharing?", type: "critical", lesson: "Fact-checking improves digital trust.", correctAnswer: "positive" },
  { prompt: "What facts are actually included here?", type: "context", lesson: "Look for evidence, not just emotion or outrage.", correctAnswer: "positive" },
  { prompt: "Is this claim supported by trustworthy reporting?", type: "source", lesson: "Reliable reporting is stronger than a single viral post.", correctAnswer: "positive" },
  { prompt: "What context is missing?", type: "context", lesson: "Missing context can distort the meaning of a post.", correctAnswer: "positive" },
  { prompt: "Could this be a repost without evidence?", type: "critical", lesson: "A repost is not proof. Check whether the original source is credible.", correctAnswer: "positive" },
  { prompt: "Does the post give dates, names, and specifics?", type: "reading", lesson: "Vague claims are harder to verify and easier to spread.", correctAnswer: "positive" },
  { prompt: "Is there a better, more credible version of this story elsewhere?", type: "source", lesson: "Look for independent confirmation before sharing.", correctAnswer: "positive" },
  { prompt: "What would make this post more trustworthy?", type: "context", lesson: "Trust grows when details, evidence, and sources are clear.", correctAnswer: "positive" },
  { prompt: "Am I reacting because it feels important, or because it is verified?", type: "reflection", lesson: "Pause between feeling and forwarding.", correctAnswer: "positive" },
  { prompt: "Would I want this shared about me or my family?", type: "emotional", lesson: "A quick empathy check can reduce harmful sharing.", correctAnswer: "positive" },
  { prompt: "Is this an opinion, a claim, or a verified fact?", type: "critical", lesson: "Not every strong claim is a proven fact.", correctAnswer: "positive" },
  { prompt: "Have I checked whether the post is satire, rumor, or a real report?", type: "context", lesson: "The framing matters as much as the content.", correctAnswer: "positive" },
];

export default function PauseNudgesTab() {
  const { user } = useAuth();

  const [currentNudge, setCurrentNudge] = useState<Nudge>(LESSONS[0]);
  const [showResponse, setShowResponse] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [stats, setStats] = useState({
    pauseCount: (user as any)?.pauseCount || 0,
    mindfulShares: (user as any)?.mindfulShares || 0,
    streakDays: (user as any)?.streakDays || 0,
    correctResponses: (user as any)?.correctResponses || 0,
  });

  // Random nudge rotation every 10 seconds, but never repeat the same question immediately.
  useEffect(() => {
    const nudgeInterval = setInterval(() => {
      setCurrentNudge((prev) => {
        let next = LESSONS[Math.floor(Math.random() * LESSONS.length)];
        if (LESSONS.length > 1) {
          while (next.prompt === prev.prompt && next.type === prev.type) {
            next = LESSONS[Math.floor(Math.random() * LESSONS.length)];
          }
        }
        return next;
      });
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
        correctResponses: prev.correctResponses + Math.floor(Math.random() * 2),
      }));
    }, 15000);
    return () => clearInterval(statsInterval);
  }, []);

  const handleResponse = (response: "yes" | "no") => {
    // map response to positive/negative
    const responded = response === "yes" ? "positive" : "negative";
    const isCorrect = (currentNudge.correctAnswer ?? "positive") === responded;
    setLastCorrect(isCorrect);
    setShowResponse(true);

    setStats((prev) => ({
      ...prev,
      pauseCount: prev.pauseCount + 1,
      mindfulShares: isCorrect ? prev.mindfulShares + 1 : prev.mindfulShares,
      correctResponses: prev.correctResponses + (isCorrect ? 1 : 0),
    }));

    setTimeout(() => {
      setShowResponse(false);
      setLastCorrect(null);
      setCurrentNudge((prev) => {
        let next = LESSONS[Math.floor(Math.random() * LESSONS.length)];
        if (LESSONS.length > 1) {
          while (next.prompt === prev.prompt && next.type === prev.type) {
            next = LESSONS[Math.floor(Math.random() * LESSONS.length)];
          }
        }
        return next;
      });
    }, 2000);
  };

  const getResponseOptions = (type: Nudge["type"]) => {
    switch (type) {
      case "reading":
        return {
          positive: "I read the full context",
          negative: "I’ll read more first",
        };
      case "emotional":
        return {
          positive: "I slowed down",
          negative: "I’ll calm down first",
        };
      case "critical":
        return {
          positive: "I checked the facts",
          negative: "I’ll verify first",
        };
      case "source":
        return {
          positive: "I checked the source",
          negative: "I’ll verify the source first",
        };
      case "context":
        return {
          positive: "I looked for context",
          negative: "I’ll check the context first",
        };
      case "reflection":
      default:
        return {
          positive: "I paused and reflected",
          negative: "I’ll reflect before sharing",
        };
    }
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
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg mb-6 transition-all duration-500 overflow-hidden">
            <CardContent className="p-5 sm:p-8 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                {getIcon(currentNudge.type)}
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3">Before you act...</h3>
              <p className="text-base sm:text-lg mb-6 break-words">{currentNudge.prompt}</p>
              {currentNudge.lesson && (
                <p className="text-sm text-white/80 mb-6 italic break-words">{currentNudge.lesson}</p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-center">
                {(() => {
                  const options = getResponseOptions(currentNudge.type);
                  return (
                    <>
                      <Button
                        onClick={() => handleResponse("yes")}
                        className="w-full sm:w-auto bg-white text-primary px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors duration-200 whitespace-normal h-auto"
                      >
                        {options.positive}
                      </Button>
                      <Button
                        onClick={() => handleResponse("no")}
                        variant="outline"
                        className="w-full sm:w-auto bg-white text-primary px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors duration-200 whitespace-normal h-auto"
                      >
                        {options.negative}
                      </Button>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg mb-6 transition-all duration-500 overflow-hidden">
            <CardContent className="p-5 sm:p-8 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3">{lastCorrect ? "Nice pause." : "Good choice — consider the recommended action"}</h3>
              <p className="text-base sm:text-lg mb-4 break-words">{lastCorrect ? "Taking a moment to slow down helps build a more careful digital habit." : "That was thoughtful — next time, try the recommended action to strengthen the habit."}</p>
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

