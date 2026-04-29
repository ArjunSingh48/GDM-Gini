import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import { useDemoAuth } from "@/hooks/useDemoAuth";

const CuteGiniSVG = () => (
  <svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="44" rx="16" ry="13" fill="hsl(40, 55%, 88%)" />
    <circle cx="32" cy="24" r="15" fill="hsl(40, 58%, 91%)" />
    <ellipse cx="19" cy="16" rx="6" ry="9" fill="hsl(30, 40%, 78%)" transform="rotate(-20 19 16)" />
    <ellipse cx="45" cy="16" rx="6" ry="9" fill="hsl(30, 40%, 78%)" transform="rotate(20 45 16)" />
    <circle cx="26" cy="22" r="3.5" fill="hsl(150, 10%, 15%)" />
    <circle cx="27" cy="20.5" r="1.2" fill="white" />
    <circle cx="25.2" cy="22.8" r="0.5" fill="white" />
    <circle cx="38" cy="22" r="3.5" fill="hsl(150, 10%, 15%)" />
    <circle cx="39" cy="20.5" r="1.2" fill="white" />
    <circle cx="37.2" cy="22.8" r="0.5" fill="white" />
    <ellipse cx="32" cy="26.5" rx="1.8" ry="1.2" fill="hsl(150, 10%, 30%)" />
    <path d="M28.5 29 Q32 32 35.5 29" stroke="hsl(150, 10%, 35%)" strokeWidth="0.9" fill="none" strokeLinecap="round" />
    <circle cx="22" cy="27" r="3" fill="hsl(350, 65%, 85%)" opacity="0.5" />
    <circle cx="42" cy="27" r="3" fill="hsl(350, 65%, 85%)" opacity="0.5" />
    <circle cx="46" cy="12" r="2.5" fill="hsl(340, 55%, 78%)" />
    <circle cx="44" cy="10" r="1.8" fill="hsl(340, 55%, 78%)" />
    <circle cx="48" cy="10" r="1.8" fill="hsl(340, 55%, 78%)" />
    <circle cx="46" cy="11" r="0.8" fill="hsl(340, 45%, 70%)" />
  </svg>
);

const Auth = () => {
  const navigate = useNavigate();
  const { enterDemoMode } = useDemoAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name },
          },
        });
        if (error) throw error;
        // Update profile name
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("profiles").update({ name }).eq("user_id", user.id);
        }
        navigate("/onboarding");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    enterDemoMode();
    toast.success("Welcome to demo mode! 🌸");
    navigate("/onboarding");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "linear-gradient(180deg, hsl(60, 20%, 95%) 0%, hsl(340, 40%, 92%) 100%)" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="animate-gini-float">
              <CuteGiniSVG />
            </div>
          </div>
          <h1 className="text-2xl font-display font-bold mb-1">
            {isLogin ? "Welcome back 🌿" : "Join us 🌿"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Continue your wellness journey" : "Start your supportive pregnancy companion"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <Label className="text-sm font-semibold">Name</Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mt-2 rounded-2xl bg-card/80 border-0 shadow-soft h-12"
                required
              />
            </div>
          )}
          <div>
            <Label className="text-sm font-semibold">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 rounded-2xl bg-card/80 border-0 shadow-soft h-12"
              required
            />
          </div>
          <div>
            <Label className="text-sm font-semibold">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 rounded-2xl bg-card/80 border-0 shadow-soft h-12 pr-12"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full rounded-2xl h-12 font-semibold" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            {!loading && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Demo Login */}
        <Button
          variant="outline"
          onClick={handleDemoLogin}
          className="w-full rounded-2xl h-12 font-semibold bg-card/60 border-border hover:bg-card shadow-soft gap-2"
        >
          <span className="text-lg">🐶</span>
          Try Demo — No Sign Up Needed
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-5">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold hover:underline">
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Educational guidance only — not a substitute for medical care.
        </p>
      </div>
    </div>
  );
};

export default Auth;
