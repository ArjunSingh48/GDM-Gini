import { Check, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FocusTask } from "@/data/dailyContent";

interface DailyFocusProps {
  focus: FocusTask | null;
  description: string;
  status: "pending" | "completed" | "skipped";
  onDone: () => void;
  onSkip: () => void;
}

const categoryEmoji: Record<string, string> = {
  movement: "🚶‍♀️",
  hydration: "💧",
  nutrition: "🥗",
  wellbeing: "🌸",
  mental_wellbeing: "🧘",
  mindful_eating: "🍽️",
  sleep: "😴",
  tracking: "📝",
  health: "💊",
};

const DailyFocus = ({ focus, description, status, onDone, onSkip }: DailyFocusProps) => {
  if (!focus) return null;

  const emoji = categoryEmoji[focus.category] || "✨";
  const isDone = status === "completed";
  const isSkipped = status === "skipped";

  return (
    <div className="bg-card rounded-2xl p-5 shadow-soft border border-border mb-4">
      <h3 className="font-display font-bold text-sm mb-1 flex items-center gap-2">
        <span>✨</span> Today's Focus
      </h3>
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
        {focus.category.replace("_", " ")}
      </span>

      <div className="mt-3 flex items-start gap-3">
        <span className="text-2xl mt-0.5">{emoji}</span>
        <div className="flex-1">
          <p className={`text-sm font-medium ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {focus.task}
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
        </div>
      </div>

      {status === "pending" && (
        <div className="flex gap-2 mt-4">
          <Button
            onClick={onDone}
            size="sm"
            className="flex-1 rounded-xl gap-1.5 bg-primary hover:bg-primary/90"
          >
            <Check className="w-3.5 h-3.5" /> Mark as Done
          </Button>
          <Button
            onClick={onSkip}
            variant="outline"
            size="sm"
            className="rounded-xl gap-1.5"
          >
            <SkipForward className="w-3.5 h-3.5" /> Skip
          </Button>
        </div>
      )}

      {isDone && (
        <div className="mt-3 text-xs text-primary font-medium flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" /> Completed — great job, mama! 💚
        </div>
      )}

      {isSkipped && (
        <div className="mt-3 text-xs text-muted-foreground font-medium">
          Skipped today — that's okay, tomorrow is a new day 🌿
        </div>
      )}
    </div>
  );
};

export default DailyFocus;
