import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredPid, clearStoredPid } from "@/lib/study/pid";
import { callFn } from "@/lib/study/network";

const Done = () => {
  const navigate = useNavigate();
  const pid = getStoredPid();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pid) { navigate("/study", { replace: true }); return; }
    (async () => {
      try {
        const data = await callFn<{ redirectUrl: string }>("study-complete", { pid });
        setRedirectUrl(data.redirectUrl);
        setTimeout(() => {
          clearStoredPid();
          window.location.href = data.redirectUrl;
        }, 4000);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to complete");
      }
    })();
  }, [pid, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="max-w-md text-center space-y-4">
        <div className="text-5xl">🎉</div>
        <h1 className="text-2xl font-display font-bold">Thank you!</h1>
        <p className="text-muted-foreground">Your responses have been recorded. You're being redirected back to Prolific to confirm your submission…</p>
        {error && <p className="text-sm text-coral">{error}</p>}
        {redirectUrl && (
          <p className="text-xs text-muted-foreground">
            Not redirected? <a href={redirectUrl} className="underline text-primary">Click here</a>.
          </p>
        )}
      </div>
    </div>
  );
};

export default Done;
