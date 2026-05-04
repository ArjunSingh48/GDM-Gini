import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isValidPid, getStoredPid, setStoredPid } from "@/lib/study/pid";
import { callFn } from "@/lib/study/network";

const Entry = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const stored = getStoredPid();
      const fromUrl = params.get("pid")?.trim() || "";
      const pid = stored || fromUrl;

      if (!isValidPid(pid)) {
        setError("missing");
        return;
      }
      // Lock first PID seen
      if (!stored) setStoredPid(pid);

      try {
        await callFn("study-init", {
          pid,
          metadata: {
            ua: navigator.userAgent,
            lang: navigator.language,
            screen: `${window.screen.width}x${window.screen.height}`,
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        });
        navigate("/study/survey", { replace: true });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to start study");
      }
    };
    run();
  }, [params, navigate]);

  if (error === "missing") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-display font-bold">Access link required</h1>
          <p className="text-muted-foreground">
            This study can only be accessed through your unique Prolific link.
            Please return to Prolific and click the study link again.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-xl font-display font-bold">Something went wrong</h1>
          <p className="text-muted-foreground text-sm">{error}</p>
          <button onClick={() => location.reload()} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <span className="text-2xl animate-pulse">🌸 Preparing your study…</span>
    </div>
  );
};

export default Entry;
