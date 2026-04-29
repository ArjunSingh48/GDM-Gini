import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { DemoAuthProvider, useDemoAuth } from "@/hooks/useDemoAuth";
import AppLayout from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Nutrition from "./pages/Nutrition";
import Health from "./pages/Health";
import Activities from "./pages/Activities";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import Intro from "./pages/Intro";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isDemoMode } = useDemoAuth();

  if (loading && !isDemoMode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-2xl animate-pulse">🌸</span>
      </div>
    );
  }

  if (!user && !isDemoMode) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DemoAuthProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/intro" element={<Intro />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/" element={<Index />} />
                <Route path="/nutrition" element={<Nutrition />} />
                <Route path="/health" element={<Health />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/community" element={<Community />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </DemoAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
