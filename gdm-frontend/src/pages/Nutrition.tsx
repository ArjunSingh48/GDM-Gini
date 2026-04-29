import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Check, Shuffle, X, ArrowLeft, Settings2 } from "lucide-react";
import MealCheckTab from "@/components/nutrition/MealCheckTab";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const tabs = ["Meal Plan", "Cultural", "Build My Plate", "Grocery List", "Meal Check"];

const mealRecipes: Record<string, { ingredients: string[]; steps: string[]; prepTime: string; cookTime: string; macros: { carbs: number; protein: number; fat: number; fiber: number } }> = {
  "Veggie egg scramble": {
    ingredients: ["2 eggs", "1 cup spinach", "1 tomato, diced", "1 slice whole grain toast", "1 tsp olive oil"],
    steps: ["Heat olive oil in a pan over medium heat.", "Add spinach and tomato, sauté 2 min.", "Beat eggs and pour into pan, scramble until cooked.", "Serve with whole grain toast."],
    prepTime: "5 min", cookTime: "8 min",
    macros: { carbs: 20, protein: 18, fat: 12, fiber: 4 },
  },
  "Greek yogurt bowl": {
    ingredients: ["1 cup plain Greek yogurt", "½ cup mixed berries", "1 tbsp chia seeds", "1 tsp honey (optional)"],
    steps: ["Add yogurt to a bowl.", "Top with berries and chia seeds.", "Drizzle honey if desired."],
    prepTime: "3 min", cookTime: "0 min",
    macros: { carbs: 18, protein: 15, fat: 5, fiber: 6 },
  },
  "Avocado toast": {
    ingredients: ["1 slice rye bread", "½ avocado", "1 egg", "Salt, pepper, red pepper flakes"],
    steps: ["Toast the rye bread.", "Mash avocado and spread on toast.", "Poach or fry the egg and place on top.", "Season to taste."],
    prepTime: "3 min", cookTime: "5 min",
    macros: { carbs: 22, protein: 12, fat: 16, fiber: 7 },
  },
  "Grilled chicken salad": {
    ingredients: ["150g chicken breast", "2 cups mixed greens", "1 tbsp olive oil", "½ lemon juice", "¼ avocado"],
    steps: ["Season and grill chicken breast 6 min per side.", "Toss greens with olive oil and lemon.", "Slice chicken and arrange on salad.", "Top with avocado."],
    prepTime: "5 min", cookTime: "12 min",
    macros: { carbs: 25, protein: 30, fat: 14, fiber: 5 },
  },
  "Quinoa buddha bowl": {
    ingredients: ["½ cup quinoa", "1 cup roasted vegetables", "2 tbsp tahini", "Lemon juice", "Salt"],
    steps: ["Cook quinoa per package directions.", "Roast vegetables at 400°F for 20 min.", "Assemble bowl with quinoa and veggies.", "Drizzle with tahini and lemon."],
    prepTime: "10 min", cookTime: "25 min",
    macros: { carbs: 35, protein: 18, fat: 12, fiber: 8 },
  },
  "Baked salmon": {
    ingredients: ["150g salmon fillet", "1 cup asparagus", "1 small sweet potato", "1 tbsp olive oil", "Lemon"],
    steps: ["Preheat oven to 400°F.", "Place salmon, asparagus, and cubed sweet potato on a sheet pan.", "Drizzle with olive oil and season.", "Bake 18-20 min."],
    prepTime: "10 min", cookTime: "20 min",
    macros: { carbs: 30, protein: 35, fat: 16, fiber: 6 },
  },
  "Turkey stir-fry": {
    ingredients: ["150g ground turkey", "1 cup mixed vegetables", "½ cup brown rice", "1 tbsp soy sauce", "1 tsp sesame oil"],
    steps: ["Cook brown rice per package directions.", "Brown turkey in a pan over medium-high heat.", "Add vegetables and stir-fry 3-4 min.", "Add soy sauce and sesame oil. Serve over rice."],
    prepTime: "5 min", cookTime: "20 min",
    macros: { carbs: 35, protein: 28, fat: 10, fiber: 4 },
  },
};

const mealPlans = [
  {
    emoji: "🍞", name: "Breakfast", timing: "Within 1 hour of waking", carbs: "15–30g carbs",
    tip: "🚨 Breakfast carbs matter most — glucose resistance is highest in the morning.",
    meals: [
      { name: "Veggie egg scramble", desc: "2 eggs, spinach, tomato, 1 slice whole grain toast", gi: "Low GI", carbsG: "20g carbs", proteinG: "18g protein" },
      { name: "Greek yogurt bowl", desc: "Plain Greek yogurt, ½ cup berries, 1 tbsp chia seeds", gi: "Low GI", carbsG: "18g carbs", proteinG: "15g protein" },
      { name: "Avocado toast", desc: "1 slice rye bread, ½ avocado, poached egg", gi: "Low-Med GI", carbsG: "22g carbs", proteinG: "12g protein" },
    ],
  },
  {
    emoji: "🍎", name: "Mid-Morning Snack", timing: "2–3 hours after breakfast", carbs: "10–15g carbs",
    meals: [
      { name: "Apple & almond butter", desc: "½ apple with 1 tbsp almond butter", gi: "Low GI", carbsG: "12g carbs", proteinG: "4g protein" },
      { name: "Cheese & crackers", desc: "2 whole grain crackers with cheese", gi: "Low GI", carbsG: "10g carbs", proteinG: "7g protein" },
    ],
  },
  {
    emoji: "🥗", name: "Lunch", timing: "4–5 hours after breakfast", carbs: "30–45g carbs",
    meals: [
      { name: "Grilled chicken salad", desc: "Mixed greens, grilled chicken, olive oil dressing", gi: "Low GI", carbsG: "25g carbs", proteinG: "30g protein" },
      { name: "Quinoa buddha bowl", desc: "Quinoa, roasted vegetables, tahini", gi: "Low GI", carbsG: "35g carbs", proteinG: "18g protein" },
    ],
  },
  {
    emoji: "🥕", name: "Afternoon Snack", timing: "2–3 hours after lunch", carbs: "10–15g carbs",
    meals: [
      { name: "Hummus & veggies", desc: "Hummus with carrot and cucumber sticks", gi: "Low GI", carbsG: "12g carbs", proteinG: "5g protein" },
    ],
  },
  {
    emoji: "🌙", name: "Dinner", timing: "At least 2 hours before bedtime", carbs: "30–45g carbs",
    meals: [
      { name: "Baked salmon", desc: "Salmon fillet, asparagus, sweet potato", gi: "Low GI", carbsG: "30g carbs", proteinG: "35g protein" },
      { name: "Turkey stir-fry", desc: "Ground turkey, mixed vegetables, brown rice", gi: "Low GI", carbsG: "35g carbs", proteinG: "28g protein" },
    ],
  },
];

const plateOptions = {
  carbs: ["Brown Rice", "Quinoa", "Sweet Potato", "Whole Wheat Pasta", "Oats"],
  proteins: ["Chicken", "Salmon", "Eggs", "Lentils", "Tofu", "Greek Yogurt"],
  vegetables: ["Spinach", "Broccoli", "Bell Peppers", "Asparagus", "Zucchini"],
  fats: ["Avocado", "Olive Oil", "Almonds", "Walnuts", "Chia Seeds"],
};

const groceryItems = [
  { category: "Proteins", items: ["Eggs", "Chicken breast", "Salmon", "Greek yogurt (plain)", "Cottage cheese", "Tofu"] },
  { category: "Vegetables", items: ["Spinach", "Broccoli", "Bell peppers", "Tomatoes", "Zucchini", "Asparagus"] },
  { category: "Grains", items: ["Brown rice", "Quinoa", "Whole wheat bread", "Oats", "Rye bread"] },
  { category: "Healthy Fats", items: ["Avocados", "Olive oil", "Almonds", "Walnuts", "Chia seeds"] },
  { category: "Fruits (Low GI)", items: ["Berries", "Apples", "Pears", "Citrus fruits"] },
];

const preferenceOptions = [
  "No Preference", "Vegetarian", "Vegan", "South Asian", "Latin American", "East Asian", "Mediterranean",
];

const Nutrition = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showPreferenceDialog, setShowPreferenceDialog] = useState(false);
  const [preferences, setPreferences] = useState<string[]>(() => {
    const saved = localStorage.getItem("gdm_meal_preferences");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const hasVisited = localStorage.getItem("gdm_nutrition_visited");
    if (!hasVisited && preferences.length === 0) {
      setShowPreferenceDialog(true);
      localStorage.setItem("gdm_nutrition_visited", "true");
    }
  }, []);

  const savePreferences = (prefs: string[]) => {
    setPreferences(prefs);
    localStorage.setItem("gdm_meal_preferences", JSON.stringify(prefs));
    setShowPreferenceDialog(false);
  };

  return (
    <div className="pt-4 pb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐶</span>
          <span className="font-display font-bold text-base">GDM Guide</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPreferenceDialog(true)} className="text-muted-foreground hover:text-foreground transition-colors">
            <Settings2 className="w-4 h-4" />
          </button>
          <span className="text-xs text-muted-foreground border border-border rounded-full px-3 py-1">Educational only</span>
        </div>
      </div>
      <div className="border-b border-border mb-4" />

      <h1 className="text-2xl font-display font-bold mb-1 flex items-center gap-2">
        <span>🌿</span> Nutrition Guide
      </h1>
      <p className="text-sm text-muted-foreground mb-4">Low-GI meal plan tailored for GDM</p>

      {/* Preferences display */}
      {preferences.length > 0 && !preferences.includes("No Preference") && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {preferences.map((p) => (
            <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{p}</span>
          ))}
        </div>
      )}

      {/* Daily Carb Distribution */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: "linear-gradient(135deg, hsl(110, 22%, 69%, 0.15) 0%, hsl(0, 68%, 87%, 0.15) 50%, hsl(290, 30%, 78%, 0.15) 100%)" }}>
        <h3 className="font-bold text-sm mb-3">Daily Carb Distribution</h3>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {[
            { label: "Breakfast", range: "15–30g", color: "bg-coral" },
            { label: "Lunch", range: "30–45g", color: "bg-green-range" },
            { label: "Dinner", range: "30–45g", color: "bg-accent" },
          ].map((item) => (
            <div key={item.label} className="bg-card/80 rounded-xl p-3 text-center">
              <div className={`h-1 ${item.color} rounded-full mb-2`} />
              <p className="text-xs font-semibold">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.range}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Spread carbs across 3 meals + 2–3 snacks throughout the day</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === i
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-card text-muted-foreground border border-border hover:bg-muted/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 0 && <MealPlanTab />}
      {activeTab === 1 && <CulturalTab />}
      {activeTab === 2 && <BuildMyPlateTab />}
      {activeTab === 3 && <GroceryListTab />}
      {activeTab === 4 && <MealCheckTab />}

      {/* Preference Dialog */}
      <PreferenceDialog
        open={showPreferenceDialog}
        onOpenChange={setShowPreferenceDialog}
        preferences={preferences}
        onSave={savePreferences}
      />
    </div>
  );
};

// ─── Preference Dialog ──────────────────────────────────────
const PreferenceDialog = ({
  open,
  onOpenChange,
  preferences,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  preferences: string[];
  onSave: (prefs: string[]) => void;
}) => {
  const [selected, setSelected] = useState<string[]>(preferences);

  const toggle = (p: string) => {
    if (p === "No Preference") {
      setSelected(["No Preference"]);
      return;
    }
    setSelected((prev) => {
      const without = prev.filter((x) => x !== "No Preference");
      return without.includes(p) ? without.filter((x) => x !== p) : [...without, p];
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">What are your dietary preferences?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-4">Select all that apply. You can change this anytime.</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {preferenceOptions.map((p) => (
            <button
              key={p}
              onClick={() => toggle(p)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selected.includes(p)
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <Button onClick={() => onSave(selected)} className="w-full rounded-2xl h-11">
          Save Preferences
        </Button>
      </DialogContent>
    </Dialog>
  );
};

// ─── Meal Plan Tab ──────────────────────────────────────────
const MealPlanTab = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);

  if (selectedRecipe) {
    const recipe = mealRecipes[selectedRecipe];
    if (!recipe) { setSelectedRecipe(null); return null; }

    const totalMacros = recipe.macros.carbs + recipe.macros.protein + recipe.macros.fat;

    return (
      <div className="space-y-4 animate-fade-in">
        <button onClick={() => setSelectedRecipe(null)} className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to meals
        </button>

        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
          <h2 className="font-display font-bold text-lg mb-1">{selectedRecipe}</h2>
          <div className="flex gap-3 text-xs text-muted-foreground mb-4">
            <span>⏱ Prep: {recipe.prepTime}</span>
            <span>🔥 Cook: {recipe.cookTime}</span>
          </div>

          {/* Macro bars */}
          <div className="space-y-2 mb-5">
            {[
              { label: "Carbs", value: recipe.macros.carbs, color: "bg-amber-watch" },
              { label: "Protein", value: recipe.macros.protein, color: "bg-green-range" },
              { label: "Fat", value: recipe.macros.fat, color: "bg-coral" },
              { label: "Fiber", value: recipe.macros.fiber, color: "bg-primary" },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span>{m.label}</span>
                  <span className="text-muted-foreground">{m.value}g</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${m.color}`} style={{ width: `${Math.min((m.value / totalMacros) * 100 * 2, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>

          <h3 className="font-bold text-sm mb-2">Ingredients</h3>
          <ul className="space-y-1.5 mb-5">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="text-sm text-foreground/80 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {ing}
              </li>
            ))}
          </ul>

          <h3 className="font-bold text-sm mb-2">Instructions</h3>
          <ol className="space-y-2">
            {recipe.steps.map((step, i) => (
              <li key={i} className="text-sm text-foreground/80 flex gap-2">
                <span className="text-xs font-bold text-primary shrink-0 mt-0.5">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {mealPlans.map((section) => (
        <div key={section.name} className="bg-card rounded-2xl border border-border overflow-hidden shadow-soft">
          <button
            onClick={() => setExpanded(expanded === section.name ? null : section.name)}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{section.emoji}</span>
              <div className="text-left">
                <h3 className="font-bold text-sm">{section.name}</h3>
                <p className="text-xs text-muted-foreground">{section.timing} · {section.carbs}</p>
              </div>
            </div>
            {expanded === section.name ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </button>

          {expanded === section.name && (
            <div className="px-4 pb-4 animate-fade-in space-y-3">
              <div className="border-t border-border" />
              {section.meals.map((meal) => (
                <button
                  key={meal.name}
                  onClick={() => mealRecipes[meal.name] && setSelectedRecipe(meal.name)}
                  className={`w-full text-left bg-muted/30 rounded-xl p-3 transition-all ${mealRecipes[meal.name] ? "hover:bg-muted/50 cursor-pointer" : ""}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm">{meal.name}</h4>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-range/10 text-green-range">{meal.gi}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{meal.desc}</p>
                  <div className="flex gap-4 text-xs">
                    <span>🍞 {meal.carbsG}</span>
                    <span>💪 {meal.proteinG}</span>
                  </div>
                  {mealRecipes[meal.name] && (
                    <p className="text-[10px] text-primary mt-1 font-medium">Tap for recipe →</p>
                  )}
                </button>
              ))}
              {section.tip && (
                <div className="bg-amber-watch/10 rounded-xl p-3">
                  <p className="text-xs text-foreground">{section.tip}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Build My Plate Tab ─────────────────────────────────────
const BuildMyPlateTab = () => {
  const [selections, setSelections] = useState({ carbs: "", proteins: "", vegetables: "", fats: "" });
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
  const [surpriseMeal, setSurpriseMeal] = useState<{ name: string; macros: { carbs: number; protein: number; fat: number; fiber: number }; recipe: string } | null>(null);

  const allIngredients = [...plateOptions.carbs, ...plateOptions.proteins, ...plateOptions.vegetables, ...plateOptions.fats];
  const availableIngredients = allIngredients.filter((i) => !excludedIngredients.includes(i));

  const generateSurpriseMeal = () => {
    const available = {
      carbs: plateOptions.carbs.filter((i) => !excludedIngredients.includes(i)),
      proteins: plateOptions.proteins.filter((i) => !excludedIngredients.includes(i)),
      vegetables: plateOptions.vegetables.filter((i) => !excludedIngredients.includes(i)),
      fats: plateOptions.fats.filter((i) => !excludedIngredients.includes(i)),
    };

    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)] || "—";
    const carb = pick(available.carbs);
    const protein = pick(available.proteins);
    const veg = pick(available.vegetables);
    const fat = pick(available.fats);

    setSelections({ carbs: carb, proteins: protein, vegetables: veg, fats: fat });
    setSurpriseMeal({
      name: `${protein} with ${veg} & ${carb}`,
      macros: { carbs: 30, protein: 25, fat: 12, fiber: 6 },
      recipe: `1. Season ${protein.toLowerCase()} and cook until done.\n2. Sauté ${veg.toLowerCase()} with ${fat.toLowerCase()}.\n3. Serve alongside ${carb.toLowerCase()}.\n4. Enjoy your balanced GDM-friendly meal! 🌿`,
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
        <h3 className="font-bold text-base mb-4">The GDM Plate Method</h3>
        <div className="flex justify-center mb-5">
          <div className="w-48 h-48 rounded-full overflow-hidden relative border-4 border-muted">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-green-range/20 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xs font-bold">½ Non-Starchy</p>
                <p className="text-xs font-bold">Vegetables</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-secondary/30 flex items-center justify-center">
              <div className="text-center">
                <p className="text-[10px] font-bold">¼ Lean</p>
                <p className="text-[10px] font-bold">Protein</p>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-accent/30 flex items-center justify-center">
              <div className="text-center">
                <p className="text-[10px] font-bold">¼ Low-GI</p>
                <p className="text-[10px] font-bold">Carbs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exclude ingredients */}
      <div>
        <h3 className="font-semibold text-sm mb-2">Exclude ingredients you don't have:</h3>
        <div className="flex flex-wrap gap-2">
          {allIngredients.map((item) => (
            <button
              key={item}
              onClick={() =>
                setExcludedIngredients((prev) =>
                  prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
                )
              }
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                excludedIngredients.includes(item)
                  ? "bg-destructive/10 text-destructive line-through"
                  : "bg-card text-muted-foreground border border-border"
              }`}
            >
              {item}
              {excludedIngredients.includes(item) && <X className="w-3 h-3" />}
            </button>
          ))}
        </div>
      </div>

      {/* Build Your Own */}
      <div className="space-y-4">
        {(Object.keys(plateOptions) as Array<keyof typeof plateOptions>).map((category) => (
          <div key={category}>
            <h3 className="font-semibold text-sm mb-2 capitalize">{category === "fats" ? "Healthy Fats" : category}</h3>
            <div className="flex flex-wrap gap-2">
              {plateOptions[category].filter((i) => !excludedIngredients.includes(i)).map((item) => (
                <button
                  key={item}
                  onClick={() => setSelections((s) => ({ ...s, [category]: item }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selections[category] === item ? "bg-primary text-primary-foreground shadow-soft" : "bg-card text-muted-foreground border border-border"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
        <Button onClick={generateSurpriseMeal} variant="outline" className="w-full rounded-2xl gap-2">
          <Shuffle className="w-4 h-4" /> Surprise Meal
        </Button>
      </div>

      {/* Surprise Meal Result */}
      {surpriseMeal && (
        <div className="bg-card rounded-2xl p-5 border border-border shadow-soft animate-fade-in">
          <h3 className="font-display font-bold text-base mb-1">{surpriseMeal.name}</h3>

          {/* Macro distribution */}
          <div className="space-y-2 my-4">
            {[
              { label: "Carbs", value: surpriseMeal.macros.carbs, color: "bg-amber-watch" },
              { label: "Protein", value: surpriseMeal.macros.protein, color: "bg-green-range" },
              { label: "Fat", value: surpriseMeal.macros.fat, color: "bg-coral" },
              { label: "Fiber", value: surpriseMeal.macros.fiber, color: "bg-primary" },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span>{m.label}</span>
                  <span className="text-muted-foreground">{m.value}g</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${m.color}`} style={{ width: `${(m.value / 40) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <h4 className="font-bold text-sm mb-2">Quick Recipe</h4>
          <p className="text-sm text-foreground/80 whitespace-pre-line">{surpriseMeal.recipe}</p>
        </div>
      )}

      {/* Tip */}
      <div className="bg-amber-watch/10 rounded-2xl p-4">
        <h4 className="text-sm font-bold mb-1">💡 Tip</h4>
        <p className="text-xs text-foreground/80">Add a small glass of water and eat slowly — aim for 20+ minutes per meal. This helps glucose rise gradually.</p>
      </div>
    </div>
  );
};

// ─── Grocery List Tab ───────────────────────────────────────
const GroceryListTab = () => {
  const [checked, setChecked] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("gdm_grocery_checked");
    return saved ? new Set(JSON.parse(saved)) : new Set<string>();
  });

  const toggleItem = (item: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item); else next.add(item);
      localStorage.setItem("gdm_grocery_checked", JSON.stringify([...next]));
      return next;
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base flex items-center gap-2">🛒 GDM-Friendly Grocery List</h3>
        <span className="text-xs text-muted-foreground">{checked.size} checked</span>
      </div>
      <p className="text-xs text-muted-foreground -mt-3">Checked items will be used for meal suggestions in Build My Plate.</p>
      {groceryItems.map((group) => (
        <div key={group.category} className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
          <h4 className="font-bold text-sm px-4 pt-4 pb-2">{group.category}</h4>
          <div>
            {group.items.map((item, i) => (
              <button
                key={item}
                onClick={() => toggleItem(item)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                  i < group.items.length - 1 ? "border-b border-border" : ""
                } ${checked.has(item) ? "line-through text-muted-foreground" : "text-foreground"}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${checked.has(item) ? "bg-primary border-primary" : "border-muted-foreground/30"}`}>
                  {checked.has(item) && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
                {item}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Cultural Tab ───────────────────────────────────────────
const CulturalTab = () => {
  const culturalMeals = [
    { region: "South Asia", meals: ["Dal with chapati and mixed vegetables", "Tandoori chicken with raita and salad", "Moong dal chilla with mint chutney"] },
    { region: "Latin America", meals: ["Grilled fish with black beans and salad", "Chicken tortilla soup with avocado", "Bean and vegetable burrito bowl"] },
    { region: "East Asia", meals: ["Steamed fish with bok choy and brown rice", "Tofu stir-fry with vegetables", "Miso soup with edamame"] },
    { region: "Mediterranean", meals: ["Grilled chicken with tabbouleh and hummus", "Lentil soup with whole grain pita", "Baked fish with roasted vegetables and olive oil"] },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">GDM-friendly meals from your cultural background</p>
      {culturalMeals.map((culture) => (
        <div key={culture.region} className="bg-card rounded-2xl border border-border p-4 shadow-soft">
          <h3 className="font-bold text-sm mb-3">{culture.region}</h3>
          <div className="space-y-2">
            {culture.meals.map((meal) => (
              <div key={meal} className="flex items-start gap-2 text-xs text-foreground/80">
                <span className="text-primary shrink-0">🌱</span>
                <span>{meal}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Nutrition;
