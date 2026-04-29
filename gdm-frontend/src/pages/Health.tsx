import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MetabolicInsights from "@/components/health/MetabolicInsights";

const moodOptions = [
  { emoji: "😊", label: "Great" },
  { emoji: "🙂", label: "Good" },
  { emoji: "😐", label: "Okay" },
  { emoji: "😔", label: "Low" },
  { emoji: "😰", label: "Anxious" },
];

const Health = () => {
  const [fastingGlucose, setFastingGlucose] = useState("");
  const [postMealGlucose, setPostMealGlucose] = useState("");
  const [weight, setWeight] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [logged, setLogged] = useState(false);

  const handleLog = () => {
    setLogged(true);
    setTimeout(() => setLogged(false), 3000);
  };

  const getGlucoseColor = (value: string, type: "fasting" | "post") => {
    const num = parseFloat(value);
    if (!num) return "";
    if (type === "fasting") {
      if (num <= 95) return "text-green-range";
      if (num <= 105) return "text-amber-watch";
      return "text-coral";
    }
    if (num <= 140) return "text-green-range";
    if (num <= 160) return "text-amber-watch";
    return "text-coral";
  };

  const getGlucoseTip = (value: string, type: "fasting" | "post") => {
    const num = parseFloat(value);
    if (!num) return null;
    if (type === "fasting" && num > 95) return "Consider a small protein-rich snack before bed — it can help with fasting levels. 💚";
    if (type === "post" && num > 140) return "A short walk after meals can help. Consider adding more protein to your next meal. 🌿";
    return null;
  };

  return (
    <div className="pt-8 pb-4 animate-fade-in">
      <h1 className="text-2xl font-display font-bold mb-1">Wellbeing</h1>
      <p className="text-sm text-muted-foreground mb-6">Track your wellbeing — every entry helps 💚</p>

      <Tabs defaultValue="log" className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-xl bg-muted/50 p-1 h-auto">
          <TabsTrigger value="log" className="rounded-lg text-xs py-2 data-[state=active]:bg-card data-[state=active]:shadow-soft">Log Entry</TabsTrigger>
          <TabsTrigger value="trends" className="rounded-lg text-xs py-2 data-[state=active]:bg-card data-[state=active]:shadow-soft">Weekly Trends</TabsTrigger>
          <TabsTrigger value="insights" className="rounded-lg text-xs py-2 data-[state=active]:bg-card data-[state=active]:shadow-soft">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="mt-4 space-y-5">
          <div className="bg-card rounded-2xl p-4 shadow-soft space-y-4">
            <h3 className="font-display font-semibold text-sm">Glucose (mg/dL)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Fasting</Label>
                <Input type="number" value={fastingGlucose} onChange={(e) => setFastingGlucose(e.target.value)} placeholder="e.g. 90" className={`mt-1 rounded-xl ${getGlucoseColor(fastingGlucose, "fasting")}`} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">1hr Post-Meal</Label>
                <Input type="number" value={postMealGlucose} onChange={(e) => setPostMealGlucose(e.target.value)} placeholder="e.g. 130" className={`mt-1 rounded-xl ${getGlucoseColor(postMealGlucose, "post")}`} />
              </div>
            </div>
            {getGlucoseTip(fastingGlucose, "fasting") && <p className="text-xs bg-muted/50 rounded-xl p-3 text-foreground/80">{getGlucoseTip(fastingGlucose, "fasting")}</p>}
            {getGlucoseTip(postMealGlucose, "post") && <p className="text-xs bg-muted/50 rounded-xl p-3 text-foreground/80">{getGlucoseTip(postMealGlucose, "post")}</p>}
          </div>

          <div className="bg-card rounded-2xl p-4 shadow-soft">
            <h3 className="font-display font-semibold text-sm mb-3">Weight (kg)</h3>
            <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 68" className="rounded-xl" />
          </div>

          <div className="bg-card rounded-2xl p-4 shadow-soft">
            <h3 className="font-display font-semibold text-sm mb-3">How are you feeling?</h3>
            <div className="flex justify-between">
              {moodOptions.map((mood) => (
                <button key={mood.label} onClick={() => setSelectedMood(mood.label)} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${selectedMood === mood.label ? "bg-primary/10 scale-110" : "hover:bg-muted/50"}`}>
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-[10px] text-muted-foreground">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleLog} className="w-full rounded-xl" disabled={logged}>
            {logged ? "✓ Logged! Great job 💚" : "Save Health Log"}
          </Button>
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <WeeklyTrends />
        </TabsContent>

        <TabsContent value="insights" className="mt-4">
          <MetabolicInsights />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const WeeklyTrends = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const fastingData = [88, 92, 90, 95, 87, 91, 89];
  const postMealData = [125, 138, 132, 145, 128, 135, 130];
  const maxVal = 160;

  const getBarColor = (val: number, type: "fasting" | "post") => {
    if (type === "fasting") { if (val <= 95) return "bg-green-range"; if (val <= 105) return "bg-amber-watch"; return "bg-coral"; }
    if (val <= 140) return "bg-green-range"; if (val <= 160) return "bg-amber-watch"; return "bg-coral";
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-4 shadow-soft">
        <h3 className="font-display font-semibold text-sm mb-4">Fasting Glucose</h3>
        <div className="flex items-end justify-between gap-1 h-32">
          {days.map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[10px] text-muted-foreground">{fastingData[i]}</span>
              <div className={`w-full rounded-t-lg ${getBarColor(fastingData[i], "fasting")} transition-all`} style={{ height: `${(fastingData[i] / maxVal) * 100}%`, minHeight: 8 }} />
              <span className="text-[10px] text-muted-foreground">{day}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-range" /> In range</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-watch" /> Watch</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-coral" /> Adjust</span>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 shadow-soft">
        <h3 className="font-display font-semibold text-sm mb-4">Post-Meal Glucose</h3>
        <div className="flex items-end justify-between gap-1 h-32">
          {days.map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[10px] text-muted-foreground">{postMealData[i]}</span>
              <div className={`w-full rounded-t-lg ${getBarColor(postMealData[i], "post")} transition-all`} style={{ height: `${(postMealData[i] / maxVal) * 100}%`, minHeight: 8 }} />
              <span className="text-[10px] text-muted-foreground">{day}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground">Your glucose has been mostly in range this week — keep it up! 🌟</p>
    </div>
  );
};

export default Health;
