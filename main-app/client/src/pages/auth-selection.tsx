import { useEffect } from "react";
import { useLocation } from "wouter";
import { Shield, User, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { set } from "date-fns";

export default function AuthSelection() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, setIsGuest, isGuest } = useAuth();

  // Redirect to /home if authenticated or guest mode
useEffect(() => {
  if (isAuthenticated && isGuest) setLocation("/home");
}, [isAuthenticated, isGuest, setLocation]);

  const handleLogin = () => {
    // Redirect browser to backend login route
    window.location.href = "/api/login";
  };

  const handleGuestMode = () => {
    setIsGuest(true); // save guest mode in session storage
    setLocation("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Get Started</h2>
            <p className="text-gray-600">Choose how you'd like to proceed</p>
          </div>
          <div className="space-y-4">
            <Button
              onClick={handleLogin}
              className="w-full bg-primary text-white py-4 px-6 rounded-xl"
            >
              <User className="w-5 h-5 mr-2" /> Login / Sign Up
            </Button>
            <Button
              onClick={handleGuestMode}
              variant="outline"
              className="w-full border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl"
            >
              <Eye className="w-5 h-5 mr-2" /> Continue as Guest
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-6">
            Guest mode has limited features
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
