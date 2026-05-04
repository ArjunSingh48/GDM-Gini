import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getStoredPid } from "@/lib/study/pid";
import { hasConsent } from "@/lib/study/consent";
import { studySignIn, studySignUp, linkPid } from "@/lib/study/auth";
import { callFn } from "@/lib/study/network";
import { supabase } from "@/integrations/supabase/client";

const StudyAuth = () => {
  const navigate = useNavigate();
  const pid = getStoredPid();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!pid) { navigate("/study", { replace: true }); return; }
    if (!hasConsent()) { navigate("/study/consent", { replace: true }); return; }
    // If already authenticated, link & continue
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        try {
          await linkPid(pid);
          await callFn("study-init", { pid, metadata: { ua: navigator.userAgent } }).catch(() => {});
          navigate("/study/survey", { replace: true });
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Could not link PID");
        }
      }
    });
  }, [pid, navigate]);

  const handle = async (mode: "signin" | "signup") => {
    if (!pid) return;
    if (!email || password.length < 6) {
      toast.error("Enter email and a password (6+ chars)");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") await studySignUp(email, password);
      else await studySignIn(email, password);
      // session may take a tick
      await new Promise((r) => setTimeout(r, 200));
      await linkPid(pid);
      await callFn("study-init", { pid, metadata: { ua: navigator.userAgent } }).catch(() => {});
      navigate("/study/survey", { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Auth failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-sm p-8 space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-display font-bold">Create your study account</h1>
          <p className="text-sm text-muted-foreground">
            Linked to Prolific ID: <span className="font-mono">{pid}</span>
          </p>
        </header>

        <Tabs defaultValue="signup" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signup">Sign up</TabsTrigger>
            <TabsTrigger value="signin">Sign in</TabsTrigger>
          </TabsList>

          {(["signup", "signin"] as const).map((mode) => (
            <TabsContent key={mode} value={mode} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor={`email-${mode}`}>Email</Label>
                <Input id={`email-${mode}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`pw-${mode}`}>Password</Label>
                <Input id={`pw-${mode}`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
              </div>
              <Button className="w-full rounded-xl" onClick={() => handle(mode)} disabled={busy}>
                {mode === "signup" ? "Create account & continue" : "Sign in & continue"}
              </Button>
            </TabsContent>
          ))}
        </Tabs>

        <p className="text-xs text-muted-foreground text-center">
          We only store your email for account access. Your study responses are linked to your Prolific ID.
        </p>
      </div>
    </div>
  );
};

export default StudyAuth;
