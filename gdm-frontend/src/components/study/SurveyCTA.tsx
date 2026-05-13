import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ClipboardList, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStoredPid } from "@/lib/study/pid";
import { isSurveyDone } from "@/lib/study/surveyState";

/**
 * Highly visible, persistent Prolific Take-Survey banner.
 * Renders only for active study participants who haven't completed the survey.
 */
const SurveyCTA = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const pid = getStoredPid();
  if (!pid || isSurveyDone()) return null;

  return (
    <div className="sticky top-0 z-30 -mx-4 px-4 pt-3 pb-2 bg-gradient-to-b from-background via-background to-background/0">
      <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/15 via-primary/8 to-card p-4 shadow-md">
        <div className="flex items-start gap-3">
          <div className="shrink-0 bg-primary text-primary-foreground rounded-xl p-2.5">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-primary">
                {t("surveyCTA.eyebrow")}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">
                Prolific
              </span>
            </div>
            <p className="text-sm font-semibold leading-snug">
              {t("surveyCTA.title")}
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-snug">
              {t("surveyCTA.body")}
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate("/study/survey")}
          className="w-full mt-3 h-11 rounded-xl font-semibold gap-2"
        >
          {t("surveyCTA.button")} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default SurveyCTA;
