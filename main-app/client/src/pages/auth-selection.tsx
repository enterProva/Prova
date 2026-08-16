import { useEffect } from "react";
import { useLocation } from "wouter";
import { Eye, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
// date-fns not needed here

export default function AuthSelection() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, setIsGuest, isGuest, setGuestProfile } = useAuth();

  // Redirect to /home if authenticated or guest mode
  useEffect(() => {
    if (isAuthenticated || isGuest) setLocation("/home");
  }, [isAuthenticated, isGuest, setLocation]);

  const handleGuestMode = () => {
    setIsGuest(true); // save guest mode in session storage
  };

  const handleJudgeDemo = () => {
    // Personalized demo profile for UNESCO judges
    setGuestProfile({
      name: "UNESCO MIL Judge",
      email: null,
      avatarUrl: "/judge-avatar.png",
      linksChecked: 1200,
      trustScore: 95,
      completedLessons: 5,
      role: "judge",
      fullAccess: true,
    } as any);
    setIsGuest(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="shadow-2xl w-full max-w-md mx-4">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto bg-transparent shadow-none">
              <img src="/mobile-app-logo.png" alt="Prova" className="w-10 h-10 object-contain" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Get Started</h2>
            <p className="text-gray-600">Choose how you'd like to proceed</p>
          </div>
          <div className="space-y-4">
            <Button
              onClick={handleGuestMode}
              variant="outline"
              className="w-full border-2 border-gray-200 text-gray-700 py-3 sm:py-4 px-4 sm:px-6 rounded-xl text-sm sm:text-base"
            >
              <Eye className="w-5 h-5 mr-2" /> Guest Preview
            </Button>
            <Button
              onClick={handleJudgeDemo}
              variant="ghost"
              className="w-full border-0 text-primary py-3 sm:py-4 px-4 sm:px-6 rounded-xl flex items-center justify-center text-sm sm:text-base"
            >
              <Award className="w-5 h-5 mr-2 text-primary" /> UNESCO MIL Judge — Interactive Demo
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-6">
            Guest Preview: limited features. UNESCO Judge Demo: full access with simulated data.
          </p>
          <p className="text-xs text-gray-400 text-center mt-2">
            Note: this is a demonstration environment; actions may be simulated and not persisted to production.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
