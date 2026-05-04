import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { getStoredPid } from "@/lib/study/pid";
import { callFn } from "@/lib/study/network";
import { surveyPages, type SurveyQuestion } from "@/lib/study/questions";
import { SURVEY_DONE_KEY } from "@/lib/study/surveyState";

const Survey = () => {
  const navigate = useNavigate();
  const pid = getStoredPid();
  const [pageIdx, setPageIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [pageStartedAt, setPageStartedAt] = useState<number>(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [pidEditable, setPidEditable] = useState(false);

  useEffect(() => {
    if (!pid) {
      toast.error("No Prolific ID found — please open the study from your Prolific link.");
      navigate("/profile", { replace: true });
      return;
    }
    setAnswers((a) => ({ ...a, prolific_id: pid }));
    // Make sure participant row exists so survey-save accepts answers
    callFn("study-init", {
      pid,
      metadata: { ua: navigator.userAgent, source: "survey" },
    }).catch(() => {});
  }, [pid, navigate]);

  useEffect(() => {
    setPageStartedAt(Date.now());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pageIdx]);

  const page = surveyPages[pageIdx];
  const totalPages = surveyPages.length;
  const progress = useMemo(() => Math.round(((pageIdx) / totalPages) * 100), [pageIdx, totalPages]);

  const setAnswer = (id: string, val: unknown) => setAnswers((a) => ({ ...a, [id]: val }));

  const isPageComplete = () => {
    for (const q of page.questions) {
      if (!q.required) continue;
      const v = answers[q.id];
      if (q.type === "multi") {
        if (!Array.isArray(v) || v.length === 0) return false;
      } else if (q.type === "text" || q.type === "textarea" || q.type === "number") {
        if (typeof v !== "string" || v.trim().length === 0) return false;
      } else {
        if (v === undefined || v === null || v === "") return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!isPageComplete()) {
      toast.error("Please answer all required questions");
      return;
    }
    if (pageIdx + 1 < totalPages) setPageIdx(pageIdx + 1);
  };

  const handleBack = () => {
    if (pageIdx > 0) setPageIdx(pageIdx - 1);
  };

  const handleSubmit = async () => {
    if (!pid || submitting) return;
    if (!isPageComplete()) {
      toast.error("Please answer all required questions");
      return;
    }
    setSubmitting(true);
    try {
      // Save every answered question
      const allQs = surveyPages.flatMap((p) => p.questions);
      const timeSpent = Date.now() - pageStartedAt;
      for (const q of allQs) {
        const ans = answers[q.id];
        if (ans === undefined || ans === null || ans === "") continue;
        await callFn("study-survey-save", {
          pid,
          question_id: q.id,
          question_text: q.text,
          answer: ans,
          time_spent_ms: timeSpent,
        });
      }
      try { localStorage.setItem(SURVEY_DONE_KEY, "1"); } catch {}
      navigate("/study/done", { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  if (!page) return null;
  const isLastPage = pageIdx === totalPages - 1;

  return (
    <div className="min-h-screen bg-background px-6 py-10 flex items-start justify-center">
      <div className="w-full max-w-xl">
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Section {pageIdx + 1} of {totalPages}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="bg-card rounded-2xl shadow-sm p-6 space-y-6 border">
          <div>
            <h2 className="text-xl font-display font-semibold">{page.title}</h2>
            {page.subtitle && <p className="text-sm text-muted-foreground mt-1">{page.subtitle}</p>}
          </div>

          {page.questions.map((q) => (
            <div key={q.id} className="space-y-3">
              <label className="block text-sm font-medium text-foreground">
                {q.text}
                {q.required && <span className="text-destructive ml-1">*</span>}
              </label>
              {q.id === "prolific_id" ? (
                <div className="flex gap-2 items-center">
                  <Input
                    value={(answers[q.id] as string) ?? ""}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    placeholder={q.type === "text" ? q.placeholder : undefined}
                    readOnly={!pidEditable}
                    className={`rounded-xl h-11 flex-1 ${!pidEditable ? "bg-muted" : ""}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPidEditable((v) => !v)}
                    className="rounded-xl h-11"
                  >
                    {pidEditable ? "Done" : "Edit"}
                  </Button>
                </div>
              ) : (
                <QuestionInput q={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={pageIdx === 0 || submitting}
            className="rounded-xl h-11 px-6"
          >
            ← Back
          </Button>
          {isLastPage ? (
            <Button onClick={handleSubmit} disabled={submitting} className="rounded-xl h-11 px-6">
              {submitting ? "Submitting…" : "Submit & Finish"}
            </Button>
          ) : (
            <Button onClick={handleNext} className="rounded-xl h-11 px-6">
              Next →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const QuestionInput = ({ q, value, onChange }: { q: SurveyQuestion; value: unknown; onChange: (v: unknown) => void }) => {
  if (q.type === "text") {
    return (
      <Input
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={q.placeholder}
        readOnly={q.readOnly}
        className={`rounded-xl h-11 ${q.readOnly ? "bg-muted" : ""}`}
      />
    );
  }
  if (q.type === "number") {
    return (
      <Input
        type="number"
        inputMode="numeric"
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
        placeholder={q.placeholder}
        className="rounded-xl h-11"
      />
    );
  }
  if (q.type === "textarea") {
    return (
      <Textarea
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={q.placeholder}
        className="rounded-xl min-h-24"
      />
    );
  }
  if (q.type === "single") {
    return (
      <div className="space-y-2">
        {q.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
              value === opt ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }
  // multi
  const arr = Array.isArray(value) ? (value as string[]) : [];
  const toggle = (opt: string) => onChange(arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt]);
  return (
    <div className="space-y-2">
      {q.options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
            arr.includes(opt) ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted"
          }`}
        >
          {arr.includes(opt) ? "✓ " : ""}{opt}
        </button>
      ))}
    </div>
  );
};

export default Survey;
