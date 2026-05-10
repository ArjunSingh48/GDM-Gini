import { Check, SkipForward } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { tFocusTask, tFocusCategoryLabel, tFocusCategoryDesc } from "@/lib/i18n";
import type { FocusTask } from "@/data/dailyContent";

interface DailyFocusProps {
  focus: FocusTask | null;
  description: string;
  status: "pending" | "completed" | "skipped";
  onDone: () => void;
  onSkip: () => void;
}

const categoryEmoji: Record<string, string> = {
  movement: "🚶‍♀️", hydration: "💧", nutrition: "🥗", wellbeing: "🌸",
  mental_wellbeing: "🧘", mindful_eating: "🍽️", sleep: "😴", tracking: "📝", health: "💊",
};

const DailyFocus = ({ focus, description, status, onDone, onSkip }: DailyFocusProps) => {
  const { t } = useTranslation();
  if (!focus) return null;

  const emoji = categoryEmoji[focus.category] || "✨";
  const isDone = status === "completed";
  const isSkipped = status === "skipped";

  const localizedTask = tFocusTask(focus.id) || focus.task;
  const localizedDesc = tFocusCategoryDesc(focus.category) || description;
  const localizedCategory = tFocusCategoryLabel(focus.category);

  return (
    <div className="bg-card rounded-2xl p-5 shadow-soft border border-border mb-4">
      <h3 className="font-display font-bold text-sm mb-1 flex items-center gap-2">
        <span>✨</span> {t("focus.title")}
      </h3>
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
        {localizedCategory}
      </span>

      <div className="mt-3 flex items-start gap-3">
        <span className="text-2xl mt-0.5">{emoji}</span>
        <div className="flex-1">
          <p className={`text-sm font-medium ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {localizedTask}
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{localizedDesc}</p>
        </div>
      </div>

      {status === "pending" && (
        <div className="flex gap-2 mt-4">
          <Button onClick={onDone} size="sm" className="flex-1 rounded-xl gap-1.5 bg-primary hover:bg-primary/90">
            <Check className="w-3.5 h-3.5" /> {t("focus.markDone")}
          </Button>
          <Button onClick={onSkip} variant="outline" size="sm" className="rounded-xl gap-1.5">
            <SkipForward className="w-3.5 h-3.5" /> {t("focus.skip")}
          </Button>
        </div>
      )}

      {isDone && (
        <div className="mt-3 text-xs text-primary font-medium flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" /> {t("focus.completed")}
        </div>
      )}

      {isSkipped && (
        <div className="mt-3 text-xs text-muted-foreground font-medium">
          {t("focus.skipped")}
        </div>
      )}
    </div>
  );
};

export default DailyFocus;
