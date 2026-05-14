import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ClipboardList } from "lucide-react";
import { getStoredPid } from "@/lib/study/pid";
import { isSurveyDone } from "@/lib/study/surveyState";

/**
 * Floating "Take Survey" button — sits just above the Gini mascot (bottom-20).
 * Visible only for active study participants who haven't completed the survey yet.
 */
const SurveyFab = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const pid = getStoredPid();
  if (!pid || isSurveyDone()) return null;

  const label = t("surveyCTA.button", { defaultValue: "Take Survey" });

  return (
    <button
      onClick={() => navigate("/study/survey")}
      aria-label={label}
      title={label}
      className="fixed bottom-40 right-4 z-50 group flex items-center gap-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all pl-3 pr-4 py-3 hover:scale-105 active:scale-95"
    >
      <ClipboardList className="w-5 h-5" />
      <span className="text-xs font-semibold whitespace-nowrap">{label}</span>
    </button>
  );
};

export default SurveyFab;
