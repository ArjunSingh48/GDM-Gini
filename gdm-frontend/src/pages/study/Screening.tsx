import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { getStoredPid } from "@/lib/study/pid";
import { getStudyId, getSessionId } from "@/lib/study/prolific";
import {
  hasConsent,
  setScreeningPassed,
  PROLIFIC_SCREENOUT_URL,
} from "@/lib/study/consent";
import { callFn } from "@/lib/study/network";
import LanguageSwitcher from "@/components/study/LanguageSwitcher";

type YN = "yes" | "no" | null;

const Screening = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const pid = getStoredPid();

  const [q1, setQ1] = useState<YN>(null);
  const [q2, setQ2] = useState<YN>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!pid) { navigate("/", { replace: true }); return; }
    if (!hasConsent()) { navigate("/consent", { replace: true }); return; }
  }, [pid, navigate]);

  const submit = async () => {
    if (!q1 || !q2 || busy) return;
    setBusy(true);
    const passed = q1 === "yes" && q2 === "yes";
    await callFn("screening-save", {
      pid,
      study_id: getStudyId(),
      session_id: getSessionId(),
      q1, q2, passed,
    }).catch(() => {});
    if (!passed) {
      setScreeningPassed(false);
      window.location.href = PROLIFIC_SCREENOUT_URL;
      return;
    }
    setScreeningPassed(true);
    navigate("/auth", { replace: true });
  };

  const QBlock = ({
    title, value, onChange,
  }: { title: string; value: YN; onChange: (v: YN) => void }) => (
    <div className="space-y-3">
      <p className="text-base font-medium leading-snug">{title}</p>
      <div className="grid grid-cols-2 gap-3">
        {(["yes", "no"] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
              value === opt
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card hover:bg-muted"
            }`}
          >
            {t(`screening.${opt}`)}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6 relative">
      <LanguageSwitcher className="absolute top-4 right-4 z-10" />
      <div className="flex items-center justify-center min-h-[calc(100vh-3rem)]">
        <div className="max-w-lg w-full bg-card border border-border rounded-2xl shadow-sm p-8 space-y-6">
          <header className="space-y-2">
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">
              {t("screening.eyebrow")}
            </p>
            <h1 className="text-2xl font-display font-bold">{t("screening.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("screening.subtitle")}</p>
          </header>

          <QBlock title={t("screening.q1")} value={q1} onChange={setQ1} />
          <QBlock title={t("screening.q2")} value={q2} onChange={setQ2} />

          <Button
            onClick={submit}
            disabled={!q1 || !q2 || busy}
            className="w-full rounded-xl h-11"
          >
            {busy ? t("screening.submitting") : t("screening.continue")}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {t("screening.disclaimer")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Screening;
