import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const CuteGiniSVG = () => (
  <svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="44" rx="16" ry="13" fill="hsl(40, 55%, 88%)" />
    <circle cx="32" cy="24" r="15" fill="hsl(40, 58%, 91%)" />
    <ellipse cx="19" cy="16" rx="6" ry="9" fill="hsl(30, 40%, 78%)" transform="rotate(-20 19 16)" />
    <ellipse cx="45" cy="16" rx="6" ry="9" fill="hsl(30, 40%, 78%)" transform="rotate(20 45 16)" />
    <circle cx="26" cy="22" r="3.5" fill="hsl(150, 10%, 15%)" />
    <circle cx="27" cy="20.5" r="1.2" fill="white" />
    <circle cx="25.2" cy="22.8" r="0.5" fill="white" />
    <circle cx="38" cy="22" r="3.5" fill="hsl(150, 10%, 15%)" />
    <circle cx="39" cy="20.5" r="1.2" fill="white" />
    <circle cx="37.2" cy="22.8" r="0.5" fill="white" />
    <ellipse cx="32" cy="26.5" rx="1.8" ry="1.2" fill="hsl(150, 10%, 30%)" />
    <path d="M28.5 29 Q32 32 35.5 29" stroke="hsl(150, 10%, 35%)" strokeWidth="0.9" fill="none" strokeLinecap="round" />
    <circle cx="22" cy="27" r="3" fill="hsl(350, 65%, 85%)" opacity="0.5" />
    <circle cx="42" cy="27" r="3" fill="hsl(350, 65%, 85%)" opacity="0.5" />
    <circle cx="46" cy="12" r="2.5" fill="hsl(340, 55%, 78%)" />
    <circle cx="44" cy="10" r="1.8" fill="hsl(340, 55%, 78%)" />
    <circle cx="48" cy="10" r="1.8" fill="hsl(340, 55%, 78%)" />
    <circle cx="46" cy="11" r="0.8" fill="hsl(340, 45%, 70%)" />
  </svg>
);

const Onboarding = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: "", age: "", preBMI: "", pregnancyWeek: "", fastingGlucose: "" });

  const calculateRisk = () => {
    let score = 0;
    if (parseInt(data.age) >= 35) score++;
    if (parseFloat(data.preBMI) >= 30) score += 2;
    else if (parseFloat(data.preBMI) >= 25) score++;
    if (parseFloat(data.fastingGlucose) > 95) score++;
    if (score >= 3) return "Elevated";
    if (score >= 1) return "Moderate";
    return "Low";
  };

  const risk = step === 2 ? calculateRisk() : "";

  const riskLabels: Record<string, string> = {
    Low: t("onboarding.riskLow"),
    Moderate: t("onboarding.riskModerate"),
    Elevated: t("onboarding.riskElevated"),
  };

  const focusAreas: Record<string, string[]> = {
    Low: [t("onboarding.lowFocus1"), t("onboarding.lowFocus2"), t("onboarding.lowFocus3")],
    Moderate: [t("onboarding.moderateFocus1"), t("onboarding.moderateFocus2"), t("onboarding.moderateFocus3")],
    Elevated: [t("onboarding.elevatedFocus1"), t("onboarding.elevatedFocus2"), t("onboarding.elevatedFocus3")],
  };

  const canProceed = () => {
    if (step === 0) return data.name.length > 0 && data.age.length > 0;
    if (step === 1) return data.pregnancyWeek.length > 0;
    return true;
  };

  const handleFinish = async () => {
    if (user) {
      try {
        await supabase.from("profiles").upsert({
          user_id: user.id,
          name: data.name,
          age: parseInt(data.age) || null,
          pre_pregnancy_bmi: parseFloat(data.preBMI) || null,
          pregnancy_week: parseInt(data.pregnancyWeek) || null,
          risk_level: risk.toLowerCase(),
          onboarding_completed: true,
        });
      } catch {}
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ background: "linear-gradient(180deg, hsl(60, 20%, 95%) 0%, hsl(0, 50%, 92%) 100%)" }}>
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <div className="animate-gini-float"><CuteGiniSVG /></div>
        </div>

        <div className="flex gap-2 justify-center mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i <= step + 1 ? "bg-primary w-8" : "bg-primary/20 w-4"}`} />
          ))}
        </div>

        <div className="animate-fade-in" key={step}>
          {step === 0 && (
            <form onSubmit={(e) => { e.preventDefault(); if (canProceed()) setStep(step + 1); }}>
              <h1 className="text-2xl font-display font-bold mb-1">{t("onboarding.step1Title")}</h1>
              <p className="text-sm text-muted-foreground mb-6">{t("onboarding.step1Subtitle")}</p>
              <div className="space-y-5">
                <div>
                  <Label className="text-sm font-semibold">{t("onboarding.nameQuestion")}</Label>
                  <Input autoFocus value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} placeholder={t("onboarding.namePlaceholder")} className="mt-2 rounded-2xl bg-card/80 border-0 shadow-soft h-12" />
                </div>
                <div>
                  <Label className="text-sm font-semibold">{t("onboarding.ageQuestion")}</Label>
                  <Input data-field="age" type="number" value={data.age} onChange={(e) => setData({ ...data, age: e.target.value })} placeholder="32" className="mt-2 rounded-2xl bg-card/80 border-0 shadow-soft h-12" />
                </div>
                <div>
                  <Label className="text-sm font-semibold">{t("onboarding.bmiQuestion")}</Label>
                  <Input data-field="bmi" type="number" step="0.1" value={data.preBMI} onChange={(e) => setData({ ...data, preBMI: e.target.value })} placeholder="24" className="mt-2 rounded-2xl bg-card/80 border-0 shadow-soft h-12" />
                </div>
              </div>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); if (canProceed()) setStep(step + 1); }}>
              <h1 className="text-2xl font-display font-bold mb-1">{t("onboarding.step2Title")}</h1>
              <p className="text-sm text-muted-foreground mb-6">{t("onboarding.step2Subtitle")}</p>
              <div className="space-y-5">
                <div>
                  <Label className="text-sm font-semibold">{t("onboarding.weekQuestion")}</Label>
                  <Input autoFocus type="number" value={data.pregnancyWeek} onChange={(e) => setData({ ...data, pregnancyWeek: e.target.value })} placeholder="36" className="mt-2 rounded-2xl bg-card/80 border-0 shadow-soft h-12" />
                </div>
                <div>
                  <Label className="text-sm font-semibold">{t("onboarding.glucoseQuestion")}</Label>
                  <Input type="number" value={data.fastingGlucose} onChange={(e) => setData({ ...data, fastingGlucose: e.target.value })} placeholder="90" className="mt-2 rounded-2xl bg-card/80 border-0 shadow-soft h-12" />
                  <p className="text-xs text-muted-foreground mt-1.5">{t("onboarding.glucoseHint")}</p>
                </div>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="text-center animate-scale-in">
              <h1 className="text-2xl font-display font-bold mb-1">{t("onboarding.step3Title")}</h1>
              <p className="text-sm text-muted-foreground mb-6">{t("onboarding.personalizedFor", { name: data.name || t("onboarding.you") })}</p>

              <div className={`rounded-2xl p-5 mb-6 ${risk === "Low" ? "bg-green-range/10" : risk === "Moderate" ? "bg-amber-watch/10" : "bg-coral/10"}`}>
                <div className="flex items-center gap-2 justify-center mb-1">
                  <span>🌸</span>
                  <span className={`font-bold text-sm ${risk === "Low" ? "text-green-range" : risk === "Moderate" ? "text-amber-watch" : "text-coral"}`}>
                    {riskLabels[risk]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{t("onboarding.riskBased")}</p>
              </div>

              <div className="text-left mb-6">
                <h3 className="font-bold text-sm mb-3">{t("onboarding.focusAreas")}</h3>
                <div className="space-y-3">
                  {focusAreas[risk]?.map((area, i) => (
                    <div key={i} className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-2xl px-4 py-4 shadow-soft">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-green-range/20 text-green-range" : i === 1 ? "bg-amber-watch/20 text-amber-watch" : "bg-coral/20 text-coral"}`}>{i + 1}</span>
                      <span className="text-sm text-foreground">{area}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-4">{t("onboarding.progressNote")}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          {step > 0 && step < 2 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="rounded-2xl bg-card/80 border-0 shadow-soft h-12 px-5">
              <ChevronLeft className="w-4 h-4 mr-1" /> {t("common.back")}
            </Button>
          )}
          {step < 2 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="flex-1 rounded-2xl h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-soft">
              {t("common.continue")} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleFinish} className="flex-1 rounded-2xl h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-soft">
              {t("onboarding.openDashboard")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
