import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";
import { getStoredPid } from "@/lib/study/pid";
import {
  isSurveyDone,
  wasPromptShown,
  markPromptShown,
  getOrInitTimerStart,
} from "@/lib/study/surveyState";

const FIVE_MIN_MS = 5 * 60 * 1000;

const SurveyReminder = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const pid = getStoredPid();
    if (!pid) return;
    if (isSurveyDone()) return;
    if (wasPromptShown()) return;

    const start = getOrInitTimerStart();
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, FIVE_MIN_MS - elapsed);

    const t = setTimeout(() => {
      if (isSurveyDone() || wasPromptShown()) return;
      markPromptShown();
      setOpen(true);
    }, remaining);

    return () => clearTimeout(t);
  }, []);

  const goToSurvey = () => {
    setOpen(false);
    navigate("/study/survey");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <div className="mx-auto bg-primary/15 rounded-full p-3 mb-2">
            <ClipboardList className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center font-display text-xl">
            Help us improve — take the survey 💚
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Thanks for exploring the app! Please take a few minutes to share your
            feedback. You can also find the survey anytime in your{" "}
            <strong>Profile → Testing Mode</strong> section.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-4">
          <Button onClick={goToSurvey} className="rounded-xl h-11">
            Take the Survey
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl h-10">
            Remind me later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SurveyReminder;
