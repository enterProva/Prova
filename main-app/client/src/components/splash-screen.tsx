import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-[#25344f] flex items-center justify-center z-50 transition-opacity duration-1000"
      data-testid="splash-screen"
    >
      <div className="text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse bg-transparent shadow-none">
          <img src="/mobile%20app-logo.png" alt="Prova" className="w-16 h-16 object-contain bg-transparent" data-testid="img-logo-splash" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-[-0.06em]" data-testid="text-app-name">
          PROVA
        </h1>
        <p className="text-[#dfe7f0]" data-testid="text-app-tagline">
          Pause. Prove. Protect.
        </p>
      </div>
    </div>
  );
}
