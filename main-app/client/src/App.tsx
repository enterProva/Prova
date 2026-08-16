import { Switch, Route, Redirect } from "wouter";
import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import SplashScreen from "@/components/splash-screen";
import Landing from "@/pages/landing";
import AuthSelection from "@/pages/auth-selection";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import { Analytics } from "@vercel/analytics/next"

// App.tsx (ProtectedRoute)
function ProtectedRoute({ component: Component }: { component: any }) {
  const { isAuthenticated, isLoading, isFetching, isGuest } = useAuth();

  // If actively in guest mode, allow access immediately
  if (isGuest) return <Component />;

  // Wait while initial query is loading or still fetching
  if (isLoading || isFetching) return <SplashScreen />;

  // If not authenticated, redirect to auth page
  if (!isAuthenticated) return <Redirect to="/auth" />;

  return <Component />;
}



function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={AuthSelection} />
      <Route path="/home" component={() => <ProtectedRoute component={Home} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const [showIntroSplash, setShowIntroSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowIntroSplash(false), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {showIntroSplash ? <SplashScreen /> : <Router />}
    <Analytics/>
    </>
    </QueryClientProvider>
  );
}
