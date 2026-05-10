import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

const Activities = () => {
  const { t } = useTranslation();
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const activities = [
    { id: "walk", emoji: "🚶‍♀️", name: t("activities.walkName"), duration: t("activities.min10"), why: t("activities.walkWhy") },
    { id: "stretch", emoji: "🧘", name: t("activities.stretchName"), duration: t("activities.min15"), why: t("activities.stretchWhy") },
    { id: "hydration", emoji: "💧", name: t("activities.hydrationName"), duration: t("activities.allDay"), why: t("activities.hydrationWhy") },
    { id: "yoga", emoji: "🌸", name: t("activities.yogaName"), duration: t("activities.min20"), why: t("activities.yogaWhy") },
    { id: "breathing", emoji: "🌬️", name: t("activities.breathingName"), duration: t("activities.min5"), why: t("activities.breathingWhy") },
  ];

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
      <h1 className="text-2xl font-display font-bold mb-1">{t("activities.title")}</h1>
      <p className="text-sm text-muted-foreground mb-4">{t("activities.subtitle")}</p>

      <div className="bg-card rounded-2xl p-4 shadow-soft mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{t("activities.todayProgress")}</span>
          <span className="text-xs text-muted-foreground">
            {t("activities.done", { done: completedCount, total: totalCount })}
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
            {t("activities.allDone")}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {activities.map((activity) => {
          const isDone = completed.has(activity.id);
          return (
            <div
              key={activity.id}
              className={`bg-card rounded-2xl p-4 shadow-soft transition-all duration-300 ${isDone ? "opacity-75" : ""}`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleActivity(activity.id)}
                  className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                    isDone ? "bg-primary border-primary" : "border-muted-foreground/30 hover:border-primary/50"
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
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">{activity.why}</p>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/30 text-accent-foreground">
                    ⏱ {activity.duration}
                  </span>
                </div>
              </div>
              {isDone && (
                <p className="text-xs text-primary mt-2 ml-9 font-medium animate-fade-in">
                  {t("activities.stepCounts")}
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
