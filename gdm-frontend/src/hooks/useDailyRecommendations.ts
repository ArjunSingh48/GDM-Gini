import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDemoAuth } from "@/hooks/useDemoAuth";
import {
  todaysFocus,
  focusCategoryDescriptions,
  pregnancyFriendlyMeals,
  pregnancyWellnessReminders,
  culturalMeals,
  type FocusTask,
  type Meal,
} from "@/data/dailyContent";

// Seeded pseudo-random number generator
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function dateSeed(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

function getEffectiveDate(): Date {
  const testingEnabled = localStorage.getItem("gdm_testing_mode") === "true";
  const testDate = localStorage.getItem("gdm_testing_date");
  if (testingEnabled && testDate) {
    return new Date(testDate);
  }
  return new Date();
}

function dateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

// Pick item from array using seeded random, avoiding recently used items
function pickItem<T>(
  items: T[],
  rand: () => number,
  recentIds: Set<number>,
  getId: (item: T, index: number) => number
): { item: T; index: number } {
  const available = items
    .map((item, i) => ({ item, i }))
    .filter(({ i }) => !recentIds.has(getId(items[i], i)));

  const pool = available.length > 0 ? available : items.map((item, i) => ({ item, i }));
  const picked = pool[Math.floor(rand() * pool.length)];
  return { item: picked.item, index: picked.i };
}

export interface DailyRecommendations {
  focus: FocusTask | null;
  focusDescription: string;
  focusStatus: "pending" | "completed" | "skipped";
  meals: { breakfast: Meal | null; lunch: Meal | null; dinner: Meal | null };
  wellness: { do: string; eat: string; relax: string };
  effectiveDate: Date;
  markFocusDone: () => void;
  markFocusSkipped: () => void;
  loading: boolean;
}

export function useDailyRecommendations(): DailyRecommendations {
  const { user } = useAuth();
  const { isDemoMode } = useDemoAuth();
  const [focus, setFocus] = useState<FocusTask | null>(null);
  const [focusStatus, setFocusStatus] = useState<"pending" | "completed" | "skipped">("pending");
  const [meals, setMeals] = useState<{ breakfast: Meal | null; lunch: Meal | null; dinner: Meal | null }>({
    breakfast: null, lunch: null, dinner: null,
  });
  const [wellness, setWellness] = useState({ do: "", eat: "", relax: "" });
  const [loading, setLoading] = useState(true);

  const effectiveDate = getEffectiveDate();
  const today = dateStr(effectiveDate);

  const generateRecommendations = useCallback(async (
    recentFocusIds: Set<number>,
    recentMealNames: Set<string>,
    recentWellness: Set<string>,
    highGlucose: boolean,
    skippedYesterday: boolean,
  ) => {
    const seed = dateSeed(effectiveDate);
    const rand = seededRandom(seed);

    // ─── Focus selection ────────────────────────────
    let focusPool = [...todaysFocus];

    // Smart layer: prefer nutrition tasks if high glucose
    if (highGlucose) {
      const nutritionTasks = focusPool.filter(t => t.category === "nutrition");
      if (nutritionTasks.length > 0) focusPool = nutritionTasks;
    }

    // If skipped yesterday, prefer lighter categories
    if (skippedYesterday) {
      const easyCategories = ["hydration", "wellbeing", "mental_wellbeing"];
      const easyTasks = focusPool.filter(t => easyCategories.includes(t.category));
      if (easyTasks.length > 0) focusPool = easyTasks;
    }

    const { item: selectedFocus } = pickItem(
      focusPool, rand, recentFocusIds, (t) => t.id
    );
    setFocus(selectedFocus);

    // ─── Meal selection ─────────────────────────────
    // Combine standard meals with cultural meals as additional lunch/dinner options
    const culturalMealsAsMeals: Meal[] = culturalMeals.map(cm => ({
      name: cm.name,
      ingredients: [{ item: cm.recipe, amount: "" }],
      recipe: [cm.recipe],
      benefit: cm.benefit,
    }));

    const pickMeal = (mealList: Meal[]) => {
      const available = mealList.filter(m => !recentMealNames.has(m.name));
      const pool = available.length > 0 ? available : mealList;
      return pool[Math.floor(rand() * pool.length)];
    };

    const selectedBreakfast = pickMeal(pregnancyFriendlyMeals.breakfast);
    const selectedLunch = pickMeal([...pregnancyFriendlyMeals.lunch, ...culturalMealsAsMeals]);
    const selectedDinner = pickMeal([...pregnancyFriendlyMeals.dinner, ...culturalMealsAsMeals]);
    setMeals({ breakfast: selectedBreakfast, lunch: selectedLunch, dinner: selectedDinner });

    // ─── Wellness selection ─────────────────────────
    const pickWellness = (list: { text: string }[]) => {
      const available = list.filter(w => !recentWellness.has(w.text));
      const pool = available.length > 0 ? available : list;
      return pool[Math.floor(rand() * pool.length)].text;
    };

    const wellnessDo = pickWellness(pregnancyWellnessReminders.somethingToDo);
    const wellnessEat = pickWellness(pregnancyWellnessReminders.somethingToEatDrink);
    const wellnessRelax = pickWellness(pregnancyWellnessReminders.somethingToRelax);
    setWellness({ do: wellnessDo, eat: wellnessEat, relax: wellnessRelax });

    // ─── Save to DB ─────────────────────────────────
    if (user && !isDemoMode) {
      const entries = [
        { category: "focus", recommendation: selectedFocus.task },
        { category: "meal_breakfast", recommendation: selectedBreakfast.name },
        { category: "meal_lunch", recommendation: selectedLunch.name },
        { category: "meal_dinner", recommendation: selectedDinner.name },
        { category: "wellness_do", recommendation: wellnessDo },
        { category: "wellness_eat", recommendation: wellnessEat },
        { category: "wellness_relax", recommendation: wellnessRelax },
      ];

      for (const entry of entries) {
        await supabase.from("recommendation_history").upsert({
          user_id: user.id,
          shown_date: today,
          category: entry.category,
          recommendation: entry.recommendation,
          status: "pending",
        }, { onConflict: "id" });
      }
    }

    setLoading(false);
  }, [effectiveDate, today, user, isDemoMode]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // Check if we already have today's recommendations
      if (user && !isDemoMode) {
        const { data: existing } = await supabase
          .from("recommendation_history")
          .select("*")
          .eq("user_id", user.id)
          .eq("shown_date", today);

        if (existing && existing.length >= 5) {
          // Load from existing
          const focusRec = existing.find(e => e.category === "focus");
          const breakfastRec = existing.find(e => e.category === "meal_breakfast");
          const lunchRec = existing.find(e => e.category === "meal_lunch");
          const dinnerRec = existing.find(e => e.category === "meal_dinner");
          const wellnessDoRec = existing.find(e => e.category === "wellness_do");
          const wellnessEatRec = existing.find(e => e.category === "wellness_eat");
          const wellnessRelaxRec = existing.find(e => e.category === "wellness_relax");

          if (focusRec) {
            const matchedFocus = todaysFocus.find(t => t.task === focusRec.recommendation);
            setFocus(matchedFocus || null);
            setFocusStatus(focusRec.status as "pending" | "completed" | "skipped");
          }

          if (breakfastRec) {
            setMeals({
              breakfast: pregnancyFriendlyMeals.breakfast.find(m => m.name === breakfastRec.recommendation) || null,
              lunch: pregnancyFriendlyMeals.lunch.find(m => m.name === lunchRec?.recommendation) || null,
              dinner: pregnancyFriendlyMeals.dinner.find(m => m.name === dinnerRec?.recommendation) || null,
            });
          }

          setWellness({
            do: wellnessDoRec?.recommendation || "",
            eat: wellnessEatRec?.recommendation || "",
            relax: wellnessRelaxRec?.recommendation || "",
          });

          setLoading(false);
          return;
        }
      }

      // Get recent history for anti-repetition
      let recentFocusIds = new Set<number>();
      let recentMealNames = new Set<string>();
      let recentWellness = new Set<string>();
      let highGlucose = false;
      let skippedYesterday = false;

      if (user && !isDemoMode) {
        // Last 3 days of focus
        const threeDaysAgo = new Date(effectiveDate);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const { data: recentRecs } = await supabase
          .from("recommendation_history")
          .select("recommendation, category, status, shown_date")
          .eq("user_id", user.id)
          .gte("shown_date", dateStr(threeDaysAgo))
          .lt("shown_date", today);

        if (recentRecs) {
          for (const r of recentRecs) {
            if (r.category === "focus") {
              const match = todaysFocus.find(t => t.task === r.recommendation);
              if (match) recentFocusIds.add(match.id);
            }
            if (r.category.startsWith("meal_")) recentMealNames.add(r.recommendation);
            if (r.category.startsWith("wellness_")) recentWellness.add(r.recommendation);
          }

          // Check if yesterday's focus was skipped
          const yesterday = new Date(effectiveDate);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayFocus = recentRecs.find(
            r => r.category === "focus" && r.shown_date === dateStr(yesterday)
          );
          if (yesterdayFocus?.status === "skipped") skippedYesterday = true;
        }

        // Check glucose
        const { data: glucoseData } = await supabase
          .from("glucose_logs")
          .select("fasting_glucose")
          .eq("user_id", user.id)
          .order("logged_at", { ascending: false })
          .limit(3);

        if (glucoseData?.some(g => g.fasting_glucose && g.fasting_glucose > 95)) {
          highGlucose = true;
        }
      }

      await generateRecommendations(recentFocusIds, recentMealNames, recentWellness, highGlucose, skippedYesterday);
    };

    load();
  }, [user, isDemoMode, today, generateRecommendations]);

  const updateFocusStatus = useCallback(async (status: "completed" | "skipped") => {
    setFocusStatus(status);
    if (user && !isDemoMode && focus) {
      await supabase
        .from("recommendation_history")
        .update({ status })
        .eq("user_id", user.id)
        .eq("shown_date", today)
        .eq("category", "focus");
    }
  }, [user, isDemoMode, focus, today]);

  return {
    focus,
    focusDescription: focus ? (focusCategoryDescriptions[focus.category] || "") : "",
    focusStatus,
    meals,
    wellness,
    effectiveDate,
    markFocusDone: () => updateFocusStatus("completed"),
    markFocusSkipped: () => updateFocusStatus("skipped"),
    loading,
  };
}
