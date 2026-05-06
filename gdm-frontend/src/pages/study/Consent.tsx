import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { getStoredPid } from "@/lib/study/pid";
import { setConsent, PROLIFIC_DECLINE_URL } from "@/lib/study/consent";
import { callFn } from "@/lib/study/network";
import LanguageSwitcher from "@/components/study/LanguageSwitcher";

const Consent = () => {
  const navigate = useNavigate();
  const pid = getStoredPid();
  const [busy, setBusy] = useState(false);
  const { t } = useTranslation();

  useEffect(() => { if (!pid) navigate("/", { replace: true }); }, [pid, navigate]);

  const log = (consent_given: boolean) =>
    callFn("consent-log", { pid, consent_given }).catch(() => {});

  const accept = async () => {
    setBusy(true);
    await log(true);
    setConsent(true);
    navigate("/auth", { replace: true });
  };

  const decline = async () => {
    setBusy(true);
    await log(false);
    setConsent(false);
    window.location.href = PROLIFIC_DECLINE_URL;
  };

  return (
    <div className="min-h-screen bg-background p-6 relative">
      <LanguageSwitcher className="absolute top-4 right-4 z-10" />
      <div className="flex items-center justify-center min-h-[calc(100vh-3rem)]">
        <div className="max-w-2xl w-full bg-card border border-border rounded-2xl shadow-sm p-8 space-y-6">
          <header className="space-y-2">
            <h1 className="text-2xl font-display font-bold">{t("consent.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("consent.subtitle")}</p>
          </header>

          <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-4 text-sm leading-relaxed text-foreground/90">
            <p>{t("consent.intro")}</p>

            <div>
              <h2 className="font-semibold text-foreground">{t("consent.purposeTitle")}</h2>
              <p>{t("consent.purpose")}</p>
            </div>

            <div>
              <h2 className="font-semibold text-foreground">{t("consent.whoTitle")}</h2>
              <p>{t("consent.who")}</p>
            </div>

            <div>
              <h2 className="font-semibold text-foreground">{t("consent.procedureTitle")}</h2>
              <p>{t("consent.procedure1")}</p>
              <p>{t("consent.procedure2")}</p>
              <p>{t("consent.procedure3")}</p>
              <p>{t("consent.procedure4")}</p>
              <p>{t("consent.procedure5")}</p>
            </div>

            <div>
              <h2 className="font-semibold text-foreground">{t("consent.risksTitle")}</h2>
              <p>{t("consent.risks")}</p>
            </div>

            <div>
              <h2 className="font-semibold text-foreground">{t("consent.leadTitle")}</h2>
              <p>Prof. Dr. Marcia Nißen &lt;marcia.nissen@uzh.ch&gt;</p>
            </div>

            <div>
              <h2 className="font-semibold text-foreground">{t("consent.contactTitle")}</h2>
              <p>Arjun Singh Bhadoria &lt;arjunsingh.bhadoria@uzh.ch&gt;; Roshni Gopal &lt;roshni.gopal@uzh.ch&gt;; Qiqi Li &lt;qiqi.li@uzh.ch&gt;; Yue Zhang &lt;yue.zhang2@uzh.ch&gt;; Leyi Hu &lt;leyi.hu@uzh.ch&gt;; Wan-Yu Sung &lt;wan-yu.sung@uzh.ch&gt;</p>
            </div>

            <div>
              <h2 className="font-semibold text-foreground">{t("consent.instituteTitle")}</h2>
              <p>{t("consent.institute")} — <a href="https://www.dsi.uzh.ch" target="_blank" rel="noreferrer" className="underline text-primary">https://www.dsi.uzh.ch</a></p>
            </div>
          </div>

          <p className="text-sm font-medium pt-2">{t("consent.question")} <span className="text-coral">*</span></p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={decline} variant="outline" disabled={busy} className="rounded-xl flex-1">
              {t("consent.disagree")}
            </Button>
            <Button onClick={accept} disabled={busy} className="rounded-xl flex-1">
              {t("consent.agree")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consent;
