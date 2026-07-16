import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleContinue = () => {
    setLocation("/auth");
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center px-4 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-8 mx-auto shadow-lg">
          <Shield className="w-12 h-12 text-primary" data-testid="icon-shield" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4" data-testid="text-welcome-title">
          Welcome to PPP
        </h1>
        <p className="text-blue-100 text-lg mb-8 leading-relaxed" data-testid="text-app-description">
          An interactive tool that helps you pause, prove, and protect yourself from misinformation.
        </p>
        <Button 
          onClick={handleContinue}
          className="w-full bg-white text-primary font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          size="lg"
          data-testid="button-continue"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
