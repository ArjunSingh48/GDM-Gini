import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getStoredPid } from "@/lib/study/pid";
import { setConsent, PROLIFIC_DECLINE_URL } from "@/lib/study/consent";
import { callFn } from "@/lib/study/network";

const Consent = () => {
  const navigate = useNavigate();
  const pid = getStoredPid();
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!pid) navigate("/", { replace: true }); }, [pid, navigate]);

  const log = (consent_given: boolean) =>
    callFn("consent-log", { pid, consent_given }).catch(() => {});

  const accept = async () => {
    setBusy(true);
    await log(true);
    setConsent(true);
    navigate("/study/auth", { replace: true });
  };

  const decline = async () => {
    setBusy(true);
    await log(false);
    setConsent(false);
    window.location.href = PROLIFIC_DECLINE_URL;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-card border border-border rounded-2xl shadow-sm p-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-display font-bold">Participant Consent Form</h1>
          <p className="text-sm text-muted-foreground">Please read carefully before continuing.</p>
        </header>

        <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-4 text-sm leading-relaxed text-foreground/90">
          <p><strong>Study purpose.</strong> You are invited to participate in a research study about how people interact with an AI assistant. The session takes approximately 10–15 minutes.</p>
          <p><strong>What you'll do.</strong> You will answer a short survey, then have a brief conversation with an AI assistant. All your responses will be logged for analysis.</p>
          <p><strong>Data collected.</strong> Your Prolific Participant ID, your survey answers, and the text of your conversation with the assistant. We do not collect your name, email beyond what you optionally provide for an account, or any contact details.</p>
          <p><strong>Confidentiality.</strong> Your data is stored securely and only the research team has access. Reports will use aggregated, de-identified data.</p>
          <p><strong>Voluntary participation.</strong> You can stop at any time. If you decline below, you will be returned to Prolific and no data is collected beyond your consent decision.</p>
          <p><strong>Compensation.</strong> You will be compensated through Prolific upon completing the study and returning via the completion link.</p>
          <p><strong>Contact.</strong> For questions about this research, please contact the research team via Prolific messaging.</p>
          <p>By clicking <em>I consent</em> you confirm you are 18 or older and agree to participate under the terms above.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button onClick={decline} variant="outline" disabled={busy} className="rounded-xl flex-1">
            I do not consent
          </Button>
          <Button onClick={accept} disabled={busy} className="rounded-xl flex-1">
            I consent
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Consent;
