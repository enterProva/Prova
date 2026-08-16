import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white text-[#25344f] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center py-12 sm:py-20 px-4">
        <img src="/mobile%20app-logo.png" alt="Prova" className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4" />
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2">Welcome to Prova</h1>
        <p className="text-sm sm:text-md text-[#617891] mb-6">A demo of the Prova experience — Pause. Prove. Protect.</p>

        <div className="mt-8">
          <Button
            onClick={() => setLocation('/auth')}
            className="w-full sm:w-56 mx-auto bg-[#25344f] text-white font-semibold py-3 rounded-2xl shadow-lg transform hover:-translate-y-1 transition"
            size="lg"
            data-testid="button-continue"
          >
            Continue
          </Button>
        </div>

        <p className="text-xs text-[#9fb0c8] mt-6">This is a demo of the app — nothing is saved to your account.</p>
      </div>
    </div>
  );
}
