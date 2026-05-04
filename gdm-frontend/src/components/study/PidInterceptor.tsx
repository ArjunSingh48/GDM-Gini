import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isValidPid, getStoredPid, setStoredPid } from "@/lib/study/pid";
import { hasConsent } from "@/lib/study/consent";

// Allowed destinations once a PID is in flight (avoids redirect loops)
const STUDY_PATHS = ["/consent", "/study", "/study/auth", "/study/survey", "/study/chat", "/study/done"];

const PidInterceptor = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromUrl = params.get("pid")?.trim() || "";
    const stored = getStoredPid();

    // Lock the first PID we see and strip it from the URL
    if (isValidPid(fromUrl) && !stored) {
      setStoredPid(fromUrl);
      params.delete("pid");
      const clean = location.pathname + (params.toString() ? `?${params}` : "") + location.hash;
      window.history.replaceState({}, "", clean);
    }

    const pid = stored || (isValidPid(fromUrl) ? fromUrl : null);
    if (!pid) return;

    // If we have a PID but no consent yet, force the consent page first
    if (!hasConsent() && !STUDY_PATHS.includes(location.pathname)) {
      navigate("/consent", { replace: true });
    }
  }, [location, navigate]);

  return null;
};

export default PidInterceptor;
