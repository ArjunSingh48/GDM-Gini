import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { getStoredPid } from "@/lib/study/pid";
import { callFn } from "@/lib/study/network";
import { surveyQuestions, type SurveyQuestion } from "@/lib/study/questions";

const Survey = () => {
  const navigate = useNavigate();
  const pid = getStoredPid();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!pid) navigate("/study", { replace: true });
  }, [pid, navigate]);

  useEffect(() => { setStartedAt(Date.now()); }, [idx]);

  const q = surveyQuestions[idx];
  const total = surveyQuestions.length;
  const progress = useMemo(() => Math.round(((idx) / total) * 100), [idx, total]);

  const setAnswer = (val: unknown) => setAnswers((a) => ({ ...a, [q.id]: val }));
  const current = answers[q?.id];

  const isAnswered = () => {
    if (!q.required) return true;
    if (q.type === "multi") return Array.isArray(current) && current.length > 0;
    if (q.type === "text" || q.type === "textarea") return typeof current === "string" && current.trim().length > 0;
    return current !== undefined && current !== null && current !== "";
  };

  const next = async () => {
    if (!pid || saving) return;
    if (!isAnswered()) { toast.error("Please answer to continue"); return; }
    setSaving(true);
    try {
      await callFn("study-survey-save", {
        pid,
        question_id: q.id,
        question_text: q.text,
        answer: current ?? null,
        time_spent_ms: Date.now() - startedAt,
      });
      if (idx + 1 < total) setIdx(idx + 1);
      else navigate("/study/chat");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed — retrying network");
    } finally {
      setSaving(false);
    }
  };

  if (!q) return null;

  return (
    <div className="min-h-screen bg-background px-6 py-10 flex items-start justify-center">
      <div className="w-full max-w-xl">
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Question {idx + 1} of {total}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="bg-card rounded-2xl shadow-soft p-6 space-y-5">
          <h2 className="text-lg font-display font-semibold">{q.text}</h2>
          <QuestionInput q={q} value={current} onChange={setAnswer} />
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={next} disabled={saving} className="rounded-xl h-11 px-6">
            {saving ? "Saving…" : idx + 1 === total ? "Continue to chat →" : "Next →"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const QuestionInput = ({ q, value, onChange }: { q: SurveyQuestion; value: unknown; onChange: (v: unknown) => void }) => {
  if (q.type === "text") {
    return <Input autoFocus value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={q.placeholder} className="rounded-xl h-11" />;
  }
  if (q.type === "textarea") {
    return <Textarea autoFocus value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={q.placeholder} className="rounded-xl min-h-28" />;
  }
  if (q.type === "single") {
    return (
      <div className="space-y-2">
        {q.options.map((opt) => (
          <button
            key={opt}
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
  if (q.type === "multi") {
    const arr = Array.isArray(value) ? (value as string[]) : [];
    const toggle = (opt: string) => onChange(arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt]);
    return (
      <div className="space-y-2">
        {q.options.map((opt) => (
          <button
            key={opt}
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
  }
  // likert
  const min = q.min ?? 1, max = q.max ?? 5;
  const nums = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div>
      <div className="flex gap-2 justify-between">
        {nums.map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-colors ${
              value === n ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-muted"
            }`}
          >{n}</button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>{q.minLabel ?? min}</span>
        <span>{q.maxLabel ?? max}</span>
      </div>
    </div>
  );
};

export default Survey;
