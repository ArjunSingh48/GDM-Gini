import { useEffect, useState, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getStoredPid } from "@/lib/study/pid";
import { hasConsent } from "@/lib/study/consent";

const StudyGuard = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<"loading" | "ok" | "no-pid" | "no-consent" | "no-auth">("loading");

  useEffect(() => {
    const pid = getStoredPid();
    if (!pid) { setState("no-pid"); return; }
    if (!hasConsent()) { setState("no-consent"); return; }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(session ? "ok" : "no-auth");
    });
  }, []);

  if (state === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-background"><span className="text-2xl animate-pulse">🌸</span></div>;
  }
  if (state === "no-pid") return <Navigate to="/study" replace />;
  if (state === "no-consent") return <Navigate to="/study/consent" replace />;
  if (state === "no-auth") return <Navigate to="/study/auth" replace />;
  return <>{children}</>;
};

export default StudyGuard;
