import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sprout, Brain, Check, Play, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface Lesson {
  id: string;
  lessonId: string;
  lessonTitle: string;
  category: "basics" | "advanced";
  status: "locked" | "in_progress" | "completed";
  progressPercent?: number;
}

interface LessonTip {
  text: string;
  category: "reading" | "critical" | "reflection";
}

const LESSON_TIPS: LessonTip[] = [
  { text: "Cross-check multiple sources for accuracy.", category: "reading" },
  { text: "Check publication dates for relevance.", category: "critical" },
  { text: "Pause before sharing emotionally charged content.", category: "reflection" },
  { text: "Verify claims with trusted fact-checkers.", category: "critical" },
  { text: "Summarize the article in your own words.", category: "reading" },
  { text: "Ask yourself: Would I share this in person?", category: "reflection" },
];

export default function LearnTab() {
  const { user } = useAuth();

  // Lessons state
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentTip, setCurrentTip] = useState<LessonTip>(LESSON_TIPS[0]);

  // Initialize lessons (dummy or API)
  useEffect(() => {
    const initialLessons: Lesson[] = [
      { id: "1", lessonId: "l1", lessonTitle: "Cross-Reference Sources", category: "basics", status: "in_progress", progressPercent: 20 },
      { id: "2", lessonId: "l2", lessonTitle: "Check Publication Date", category: "basics", status: "locked" },
      { id: "3", lessonId: "l3", lessonTitle: "Verify with Fact-Checkers", category: "advanced", status: "locked" },
      { id: "4", lessonId: "l4", lessonTitle: "Summarize in Your Own Words", category: "advanced", status: "locked" },
    ];
    setLessons(initialLessons);
  }, []);

  // Real-time simulation: new lessons or progress updates
  useEffect(() => {
  const interval = setInterval(() => {
    setLessons((prev) => {
      // Randomly unlock or progress lessons
      const updated: Lesson[] = prev.map((l) => {
        if (l.status === "in_progress") {
          const nextProgress = Math.min((l.progressPercent || 20) + Math.floor(Math.random() * 20), 100);
          if (nextProgress === 100) return { ...l, status: "completed", progressPercent: 100 };
          return { ...l, progressPercent: nextProgress };
        } else if (l.status === "locked" && Math.random() > 0.7) {
          return { ...l, status: "in_progress", progressPercent: 0 };
        }
        return l;
      });

      // Occasionally add a new random lesson
      if (Math.random() > 0.8 && updated.length < 12) {
        const id = Math.random().toString();
        const newLesson: Lesson = {
          id,
          lessonId: `l${updated.length + 1}`,
          lessonTitle: `New Tip Lesson ${updated.length + 1}`,
          category: Math.random() > 0.5 ? "basics" : "advanced",
          status: "locked", // must be one of "locked" | "in_progress" | "completed"
        };
        updated.push(newLesson);
      }

      return updated;
    });
  }, 8000);
  return () => clearInterval(interval);
}, []);


  // Tip rotation
  useEffect(() => {
    const tipInterval = setInterval(() => {
      const randomTip = LESSON_TIPS[Math.floor(Math.random() * LESSON_TIPS.length)];
      setCurrentTip(randomTip);
    }, 6000);
    return () => clearInterval(tipInterval);
  }, []);

  // Calculate progress
  const completedLessons = lessons.filter((l) => l.status === "completed").length;
  const totalLessons = lessons.length;
  const progressPercent = (completedLessons / totalLessons) * 100;

  const currentLesson = lessons.find((l) => l.status === "in_progress");

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Learn</h2>
          <p className="text-gray-600">Master the art of identifying and avoiding misinformation</p>
        </div>

        {/* Learning Progress */}
        <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg mb-6 transition-all duration-500">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold mb-2">Your Learning Progress</h3>
              <p className="text-green-100 mb-4">{completedLessons} of {totalLessons} lessons completed</p>
              <div className="w-48 bg-white bg-opacity-20 rounded-full h-3">
                <Progress value={progressPercent} className="h-3 bg-white rounded-full transition-all duration-500" />
              </div>
              <p className="text-white/80 mt-2 italic text-sm">Tip: {currentTip.text}</p>
            </div>
            <div className="w-20 h-20 rounded-xl bg-white bg-opacity-20 flex items-center justify-center">
              <Brain className="w-10 h-10" />
            </div>
          </CardContent>
        </Card>

        {/* Lessons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {["basics", "advanced"].map((category) => {
            const catLessons = lessons.filter((l) => l.category === category);
            return (
              <Card key={category}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-12 h-12 ${category === "basics" ? "bg-blue-100" : "bg-purple-100"} rounded-xl flex items-center justify-center`}>
                      {category === "basics" ? <Sprout className="w-6 h-6 text-primary" /> : <Brain className="w-6 h-6 text-purple-600" />}
                    </div>
                    <div>
                      <h3 className="font-semibold">{category === "basics" ? "The Basics" : "Advanced Skills"}</h3>
                      <p className="text-sm text-gray-500">{category === "basics" ? "Essential knowledge" : "Expert techniques"}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {catLessons.map((lesson) => {
                      const isLocked = lesson.status === "locked";
                      return (
                        <div key={lesson.id} className={`flex items-center justify-between p-3 rounded-xl transition-all duration-500
                          ${isLocked ? "opacity-50 bg-gray-50" : lesson.status === "completed" ? "bg-success/20" : "bg-primary/10"}`}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              lesson.status === "completed" ? "bg-success" :
                              lesson.status === "in_progress" ? "bg-primary" :
                              "bg-gray-300"
                            }`}>
                              {lesson.status === "completed" ? <Check className="w-4 h-4 text-white" /> :
                               lesson.status === "in_progress" ? <Play className="w-4 h-4 text-white" /> :
                               <Lock className="w-4 h-4 text-gray-500" />}
                            </div>
                            <span className={`font-medium text-sm ${isLocked ? "text-gray-500" : ""}`}>{lesson.lessonTitle}</span>
                          </div>
                          <Badge className={`${lesson.status === "completed" ? "bg-success text-white" : lesson.status === "in_progress" ? "bg-primary text-white" : ""}`}>
                            {lesson.status === "completed" ? "Completed" : lesson.status === "in_progress" ? "In Progress" : "Locked"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Current Lesson */}
        {currentLesson && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{currentLesson.lessonTitle}</h3>
                  <p className="text-gray-600">Follow these steps to master this lesson</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {["Cross-Reference Sources", "Check Publication Date", "Verify with Fact-Checkers"].map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">{idx + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{step}</h4>
                      <p className="text-gray-600 text-sm">
                        {step === "Cross-Reference Sources" && "Always check if the same information is reported by multiple credible sources."}
                        {step === "Check Publication Date" && "Ensure the information is current and hasn't been taken out of temporal context."}
                        {step === "Verify with Fact-Checkers" && "Use established fact-checking organizations like Snopes, PolitiFact, or FactCheck.org."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
