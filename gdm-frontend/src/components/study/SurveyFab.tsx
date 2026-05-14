import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { getStoredPid } from "@/lib/study/pid";

/**
 * Floating "Take Survey" button — sits above the Gini mascot and notification bubble.
 * Visible only for active study participants who haven't completed the survey yet.
 */
const SurveyFab = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [hasPid, setHasPid] = useState(() => Boolean(getStoredPid()));

  useEffect(() => {
    const syncStudyState = () => {
      setHasPid(Boolean(getStoredPid()));
    };
    syncStudyState();
    window.addEventListener("study-pid-changed", syncStudyState);
    window.addEventListener("storage", syncStudyState);
    return () => {
      window.removeEventListener("study-pid-changed", syncStudyState);
      window.removeEventListener("storage", syncStudyState);
    };
  }, []);

  if (!hasPid) return null;

  const label = t("surveyCTA.button", { defaultValue: "Take Survey" });

  return (
    <button
      onClick={() => navigate("/study/survey")}
      aria-label={label}
      title={label}
      className="fixed bottom-60 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background/90 transition-all hover:scale-105 hover:shadow-xl active:scale-95"
    >
      <ClipboardCheck className="w-6 h-6" />
      <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-card px-1 text-[10px] font-bold text-primary shadow-soft ring-1 ring-border">
        P
      </span>
    </button>
  );
};

export default SurveyFab;
