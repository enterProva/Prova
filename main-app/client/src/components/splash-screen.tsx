import { useEffect, useState } from "react";
import { Shield } from "lucide-react";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-primary flex items-center justify-center z-50 transition-opacity duration-1000"
      data-testid="splash-screen"
    >
      <div className="text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse">
          <Shield className="w-12 h-12 text-primary" data-testid="icon-shield-splash" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2" data-testid="text-app-name">
          PPP
        </h1>
        <p className="text-blue-100" data-testid="text-app-tagline">
          Pause, Prove & Protect
        </p>
      </div>
    </div>
  );
}
