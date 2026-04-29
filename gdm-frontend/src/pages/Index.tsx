import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDemoAuth } from "@/hooks/useDemoAuth";
import { useDailyRecommendations } from "@/hooks/useDailyRecommendations";
import DailyFocus from "@/components/home/DailyFocus";
import { supabase } from "@/integrations/supabase/client";
import { Leaf, Heart, Users, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Meal } from "@/data/dailyContent";

const greetings = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const todayDate = () => {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
};

const mealTypeEmoji: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
};

const wellnessEmojis = {
  do: "🚶‍♀️",
  eat: "🥤",
  relax: "🧘",
};

const Index = () => {
  const { user } = useAuth();
  const { isDemoMode, demoProfile } = useDemoAuth();
  const [profile, setProfile] = useState<any>(null);
  const [selectedMeal, setSelectedMeal] = useState<{ meal: Meal; type: string } | null>(null);

  const {
    focus,
    focusDescription,
    focusStatus,
    meals,
    wellness,
    markFocusDone,
    markFocusSkipped,
    loading: recsLoading,
  } = useDailyRecommendations();

  useEffect(() => {
    if (isDemoMode) {
      setProfile(demoProfile);
      return;
    }
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user, isDemoMode, demoProfile]);

  const name = profile?.name || "Mama";
  const riskLevel = profile?.risk_level || "moderate";
  const pregnancyWeek = profile?.pregnancy_week;

  const riskDisplay: Record<string, { label: string; color: string; bg: string }> = {
    low: { label: "Low Risk", color: "text-green-range", bg: "bg-green-range/15" },
    moderate: { label: "Moderate", color: "text-amber-watch", bg: "bg-amber-watch/15" },
    elevated: { label: "Elevated", color: "text-coral", bg: "bg-coral/15" },
  };

  const risk = riskDisplay[riskLevel] || riskDisplay.moderate;

  const mealEntries = [
    { type: "Breakfast", key: "breakfast" as const, meal: meals.breakfast },
    { type: "Lunch", key: "lunch" as const, meal: meals.lunch },
    { type: "Dinner", key: "dinner" as const, meal: meals.dinner },
  ];

  return (
    <div className="pt-4 pb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐶</span>
          <span className="font-display font-bold text-base">GDM Guide</span>
        </div>
        <div className="flex items-center gap-2">
          {isDemoMode && (
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-accent/40 text-accent-foreground">Demo</span>
          )}
          <span className="text-xs text-muted-foreground border border-border rounded-full px-3 py-1">Educational only</span>
        </div>
      </div>

      <div className="border-b border-border mb-4" />

      {/* Greeting */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground">{todayDate()}</p>
        <h1 className="text-2xl font-display font-bold text-foreground">
          {greetings()}, {name} 🌸
        </h1>
        {pregnancyWeek && (
          <p className="text-sm text-muted-foreground">Week {pregnancyWeek} of your pregnancy</p>
        )}
      </div>

      {/* Care Plan Card */}
      <div className={`${risk.bg} rounded-2xl p-4 mb-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <span className="text-xl">🐶</span>
          <div>
            <p className="text-xs text-muted-foreground">Your care plan</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${risk.bg} ${risk.color}`}>{risk.label}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Last fasting</p>
          <p className="text-xs text-foreground font-medium">{isDemoMode ? "88 mg/dL" : "No entries yet"}</p>
        </div>
      </div>

      {/* Today's Focus — Single Dynamic Card */}
      <DailyFocus
        focus={focus}
        description={focusDescription}
        status={focusStatus}
        onDone={markFocusDone}
        onSkip={markFocusSkipped}
      />

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 gap-3 my-4">
        <Link to="/nutrition" className="bg-green-range/15 rounded-2xl p-4 hover:shadow-soft transition-all active:scale-[0.98]">
          <Leaf className="w-6 h-6 text-green-range mb-2" />
          <h3 className="font-display font-bold text-sm">Meal Guide</h3>
          <p className="text-xs text-muted-foreground">Today's suggestions</p>
        </Link>
        <Link to="/health" className="bg-secondary/40 rounded-2xl p-4 hover:shadow-soft transition-all active:scale-[0.98]">
          <Heart className="w-6 h-6 text-coral mb-2" />
          <h3 className="font-display font-bold text-sm">Wellbeing</h3>
          <p className="text-xs text-muted-foreground">Track your levels</p>
        </Link>
        <Link to="/community" className="bg-accent/30 rounded-2xl p-4 hover:shadow-soft transition-all active:scale-[0.98]">
          <Users className="w-6 h-6 text-accent-foreground mb-2" />
          <h3 className="font-display font-bold text-sm">Community</h3>
          <p className="text-xs text-muted-foreground">Learn & connect</p>
        </Link>
        <button onClick={() => document.querySelector<HTMLButtonElement>('[aria-label="Talk to Gini"]')?.click()} className="bg-card border border-border rounded-2xl p-4 hover:shadow-soft transition-all active:scale-[0.98] text-left">
          <span className="text-2xl block mb-2">💬</span>
          <h3 className="font-display font-bold text-sm">Ask Gini</h3>
          <p className="text-xs text-muted-foreground">Get guidance</p>
        </button>
      </div>

      {/* Today's Meals — Dynamic */}
      <div className="bg-card rounded-2xl p-4 shadow-soft mb-4 border border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-sm flex items-center gap-2">
            <span>🌿</span> Today's Meals
          </h3>
          <Link to="/nutrition" className="text-xs text-primary font-medium">See all &gt;</Link>
        </div>
        <div className="space-y-3">
          {mealEntries.map((entry, i) => (
            <button
              key={entry.key}
              onClick={() => entry.meal && setSelectedMeal({ meal: entry.meal, type: entry.type })}
              className={`w-full text-left ${i < mealEntries.length - 1 ? "pb-3 border-b border-border" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{mealTypeEmoji[entry.key]}</span>
                  <div>
                    <p className="text-xs font-bold text-coral">{entry.type}</p>
                    <p className="text-sm text-foreground">{entry.meal?.name || "Loading..."}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Wellness Reminders — Dynamic */}
      <div className="bg-card rounded-2xl p-4 shadow-soft border border-border mb-4">
        <h3 className="font-display font-bold text-sm flex items-center gap-2 mb-3">
          <span>✨</span> Wellness Reminders
        </h3>
        <div className="space-y-2">
          {[
            { emoji: wellnessEmojis.do, text: wellness.do },
            { emoji: wellnessEmojis.eat, text: wellness.eat },
            { emoji: wellnessEmojis.relax, text: wellness.relax },
          ].filter(w => w.text).map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
              <span className="text-lg">{item.emoji}</span>
              <span className="text-sm text-foreground">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground mt-2">
        You are supporting both you and your baby. 💚
      </p>

      {/* Meal Recipe Dialog */}
      <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
          {selectedMeal && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-lg">
                  {mealTypeEmoji[selectedMeal.type.toLowerCase()]} {selectedMeal.meal.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Benefit */}
                <div className="bg-primary/10 rounded-xl p-3">
                  <p className="text-xs text-primary font-medium">🌿 {selectedMeal.meal.benefit}</p>
                </div>

                {/* Ingredients */}
                <div>
                  <h4 className="font-display font-semibold text-sm mb-2">Ingredients</h4>
                  <div className="space-y-1.5">
                    {selectedMeal.meal.ingredients.map((ing, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{ing.item}</span>
                        <span className="text-muted-foreground text-xs">{ing.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recipe Steps */}
                <div>
                  <h4 className="font-display font-semibold text-sm mb-2">Recipe</h4>
                  <div className="space-y-2">
                    {selectedMeal.meal.recipe.map((step, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">
                          {i + 1}
                        </span>
                        <span className="text-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
