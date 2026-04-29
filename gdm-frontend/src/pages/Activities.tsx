import { useState } from "react";
import { Check } from "lucide-react";

const activities = [
  {
    id: "walk",
    emoji: "🚶‍♀️",
    name: "10-Minute Walk After Meals",
    duration: "10 min",
    why: "Walking after meals helps lower blood sugar levels by using glucose for energy. Even a short stroll can make a real difference.",
  },
  {
    id: "stretch",
    emoji: "🧘",
    name: "Prenatal Stretching",
    duration: "15 min",
    why: "Gentle stretching improves circulation, reduces tension, and supports overall metabolic health during pregnancy.",
  },
  {
    id: "hydration",
    emoji: "💧",
    name: "Hydration Check",
    duration: "All day",
    why: "Staying hydrated helps maintain stable blood sugar levels and supports your body's increased fluid needs during pregnancy.",
  },
  {
    id: "yoga",
    emoji: "🌸",
    name: "Gentle Yoga",
    duration: "20 min",
    why: "Prenatal yoga reduces stress hormones that can raise blood sugar, while improving flexibility and mood.",
  },
  {
    id: "breathing",
    emoji: "🌬️",
    name: "Breathing Exercises",
    duration: "5 min",
    why: "Deep breathing activates the relaxation response, helping manage stress-related glucose spikes.",
  },
];

const Activities = () => {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const toggleActivity = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const completedCount = completed.size;
  const totalCount = activities.length;

  return (
    <div className="pt-8 pb-4 animate-fade-in">
      <h1 className="text-2xl font-display font-bold mb-1">Activities</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Simple daily actions to support your health 🌿
      </p>

      {/* Progress */}
      <div className="bg-card rounded-2xl p-4 shadow-soft mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Today's Progress</span>
          <span className="text-xs text-muted-foreground">
            {completedCount}/{totalCount} done
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
        {completedCount === totalCount && (
          <p className="text-xs text-primary mt-2 font-medium animate-fade-in">
            Amazing! You completed all activities today! 🎉
          </p>
        )}
      </div>

      {/* Activity Cards */}
      <div className="space-y-3">
        {activities.map((activity) => {
          const isDone = completed.has(activity.id);
          return (
            <div
              key={activity.id}
              className={`bg-card rounded-2xl p-4 shadow-soft transition-all duration-300 ${
                isDone ? "opacity-75" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleActivity(activity.id)}
                  className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                    isDone
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/30 hover:border-primary/50"
                  }`}
                >
                  {isDone && <Check className="w-4 h-4 text-primary-foreground" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{activity.emoji}</span>
                    <h3 className={`font-semibold text-sm ${isDone ? "line-through text-muted-foreground" : ""}`}>
                      {activity.name}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                    {activity.why}
                  </p>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/30 text-accent-foreground">
                    ⏱ {activity.duration}
                  </span>
                </div>
              </div>
              {isDone && (
                <p className="text-xs text-primary mt-2 ml-9 font-medium animate-fade-in">
                  Great job! Every step counts 💚
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Activities;
