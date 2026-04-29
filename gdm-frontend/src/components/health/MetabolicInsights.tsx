import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface InsightsData {
  patterns: { icon: string; insight: string }[];
  prediction: string;
  daily_focus: string[];
}

const MetabolicInsights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch user data
      const [glucoseRes, mealRes, activityRes, profileRes] = await Promise.all([
        supabase
          .from("glucose_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("logged_at", { ascending: false })
          .limit(14),
        supabase
          .from("meal_analyses")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("activity_completions")
          .select("*")
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false })
          .limit(10),
        supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single(),
      ]);

      const { data, error } = await supabase.functions.invoke("metabolic-insights", {
        body: {
          glucoseLogs: glucoseRes.data || [],
          mealAnalyses: mealRes.data || [],
          activities: activityRes.data || [],
          profile: profileRes.data,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setInsights(data);
    } catch (err: any) {
      toast.error(err.message || "Could not generate insights.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchInsights();
  }, [user]);

  if (!user) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-soft text-center">
        <p className="text-sm text-muted-foreground">
          Sign in to see your personalized metabolic insights 🌿
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Analyzing your patterns...</p>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-soft text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          Log some health data and meals to unlock personalized insights 🌱
        </p>
        <Button variant="outline" className="rounded-xl gap-2" onClick={fetchInsights}>
          <RefreshCw className="w-4 h-4" /> Generate Insights
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pattern Insights */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-sm">Pattern Insights</h3>
        {insights.patterns.map((p, i) => (
          <div key={i} className="bg-card rounded-2xl p-4 shadow-soft flex items-start gap-3">
            <span className="text-xl">{p.icon}</span>
            <p className="text-sm text-foreground/80 leading-relaxed">{p.insight}</p>
          </div>
        ))}
      </div>

      {/* Glucose Prediction */}
      <div className="bg-primary/5 rounded-2xl p-4">
        <h3 className="font-display font-semibold text-sm mb-2 flex items-center gap-2">
          <span>🔮</span> Glucose Outlook
        </h3>
        <p className="text-sm text-foreground/70 leading-relaxed">
          {insights.prediction}
        </p>
      </div>

      {/* Daily Focus */}
      <div className="bg-card rounded-2xl p-4 shadow-soft">
        <h3 className="font-display font-semibold text-sm mb-3">Today's Metabolic Focus</h3>
        <div className="space-y-2">
          {insights.daily_focus.map((focus, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-foreground/80">
              <span className="text-primary shrink-0">{["🌿", "🚶", "💧"][i] || "🌱"}</span>
              <span>{focus}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Based on recent patterns — does not replace medical advice.
      </p>

      <Button
        variant="outline"
        className="w-full rounded-xl gap-2"
        onClick={fetchInsights}
      >
        <RefreshCw className="w-4 h-4" /> Refresh Insights
      </Button>
    </div>
  );
};

export default MetabolicInsights;
