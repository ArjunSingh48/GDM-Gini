import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isValidPid, getStoredPid, setStoredPid } from "@/lib/study/pid";
import { hasConsent, hasScreeningPassed } from "@/lib/study/consent";
import { setStudyId, setSessionId } from "@/lib/study/prolific";

// Allowed destinations once a PID is in flight (avoids redirect loops)
const STUDY_PATHS = [
  "/consent", "/screening",
  "/study", "/study/auth", "/study/survey", "/study/chat", "/study/done",
  "/auth",
];

const PidInterceptor = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pidKeys = ["PROLIFIC_PID", "prolific_pid", "pid", "PID"];
    let fromUrl = "";
    let foundKey: string | null = null;
    for (const k of pidKeys) {
      const v = params.get(k)?.trim();
      if (v) { fromUrl = v; foundKey = k; break; }
    }
    const studyIdParam = params.get("STUDY_ID")?.trim() || params.get("study_id")?.trim() || "";
    const sessionIdParam = params.get("SESSION_ID")?.trim() || params.get("session_id")?.trim() || "";
    const stored = getStoredPid();

    if (isValidPid(fromUrl) && !stored) setStoredPid(fromUrl);
    if (studyIdParam) setStudyId(studyIdParam);
    if (sessionIdParam) setSessionId(sessionIdParam);

    if (foundKey || studyIdParam || sessionIdParam) {
      ["PROLIFIC_PID", "prolific_pid", "pid", "PID", "STUDY_ID", "study_id", "SESSION_ID", "session_id"]
        .forEach((k) => params.delete(k));
      const clean = location.pathname + (params.toString() ? `?${params}` : "") + location.hash;
      window.history.replaceState({}, "", clean);
    }

    const pid = stored || (isValidPid(fromUrl) ? fromUrl : null);
    if (!pid) return;

    // Force ordered flow: consent → screening → auth/app
    if (!hasConsent() && !STUDY_PATHS.includes(location.pathname)) {
      navigate("/consent", { replace: true });
      return;
    }
    if (hasConsent() && !hasScreeningPassed() &&
        !["/screening", "/consent", "/auth"].includes(location.pathname) &&
        !location.pathname.startsWith("/study")) {
      navigate("/screening", { replace: true });
    }
  }, [location, navigate]);

  return null;
};

export default PidInterceptor;
