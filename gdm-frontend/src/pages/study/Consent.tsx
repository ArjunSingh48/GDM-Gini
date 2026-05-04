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
          <h1 className="text-2xl font-display font-bold">MOMentum: A Digital Women's Health Intervention Targeting Gestational Diabetes Mellitus (GDM)</h1>
          <p className="text-sm text-muted-foreground">Participation Information and Consent Form</p>
        </header>

        <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-4 text-sm leading-relaxed text-foreground/90">
          <p>We appreciate your decision to participate in this project. Please read the text below carefully and check the box if you agree with the study conditions. We are happy to answer questions or provide additional information if required.</p>

          <div>
            <h2 className="font-semibold text-foreground">Purpose of the Study</h2>
            <p>This survey aims to conduct a test for the MOMentum App prototype. By interacting with the demo, participants will help evaluate the tool's functional design and its effectiveness in supporting GDM management. Your insights will be crucial in refining the digital intervention before its final development.</p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">Who can participate in the study?</h2>
            <p>Anyone older than 18 years old, having experience with GDM.</p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">Study Procedure</h2>
            <p>Participation in this study involves completing an online questionnaire, which will take approximately 5–10 minutes. The questionnaire covers topics related to epidemiologic information, the experience with GDM and digital health technologies. There are no right or wrong answers — we are simply interested in your personal views and experiences.</p>
            <p>Participation is voluntary. You may withdraw from the study at any time without providing a reason and without facing any disadvantages.</p>
            <p>Your responses will be strictly confidential. All data will be anonymized and stored in a way that prevents any identification of individual participants.</p>
            <p>Anonymized aggregated data might be published in scientific outlets.</p>
            <p>Should you choose to withdraw your data after participation, you may do so at any point until July 30, 2026. After this date, all data will have been fully anonymized and can no longer be linked to individual participants.</p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">Possible Risks and Benefits</h2>
            <p>There are no known risks associated with this study. If you feel uncomfortable at any point, you may stop the interview or questionnaire at any time. Your participation will contribute to the development of better data for female health research.</p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">Project Lead</h2>
            <p>Prof. Dr. Marcia Nißen &lt;marcia.nissen@uzh.ch&gt;</p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">Contact persons</h2>
            <p>Arjun Singh Bhadoria &lt;arjunsingh.bhadoria@uzh.ch&gt;; Roshni Gopal &lt;roshni.gopal@uzh.ch&gt;; Qiqi Li &lt;qiqi.li@uzh.ch&gt;; Yue Zhang &lt;yue.zhang2@uzh.ch&gt;; Leyi Hu &lt;leyi.hu@uzh.ch&gt;; Wan-Yu Sung &lt;wan-yu.sung@uzh.ch&gt;</p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">Research Institute</h2>
            <p>UZH Digital Society Initiative — <a href="https://www.dsi.uzh.ch" target="_blank" rel="noreferrer" className="underline text-primary">https://www.dsi.uzh.ch</a></p>
          </div>
        </div>

        <p className="text-sm font-medium pt-2">Do you agree to the above consent form? <span className="text-coral">*</span></p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={decline} variant="outline" disabled={busy} className="rounded-xl flex-1">
            Disagree
          </Button>
          <Button onClick={accept} disabled={busy} className="rounded-xl flex-1">
            Agree
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Consent;
