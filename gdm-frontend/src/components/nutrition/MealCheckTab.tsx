import { useState, useRef } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface MealAnalysis {
  detected_foods: { name: string; category: string }[];
  balance_evaluation: {
    carbs: string;
    protein: string;
    fiber: string;
    healthy_fats: string;
  };
  overall_message: string;
  suggestions: string[];
  educational_snippet: string;
}

const categoryIcons: Record<string, string> = {
  carb: "🌾",
  protein: "🥚",
  fiber: "🥦",
  fat: "🥑",
  other: "🍽️",
};

const balanceColor = (level: string) => {
  if (level === "balanced" || level === "good") return "bg-green-range";
  if (level === "moderate") return "bg-amber-watch";
  return "bg-coral";
};

const balancePercent = (level: string) => {
  if (level === "balanced" || level === "good") return 90;
  if (level === "moderate") return 60;
  return 35;
};

const MealCheckTab = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<MealAnalysis | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeMeal = async () => {
    if (!preview) return;
    setAnalyzing(true);

    try {
      const base64 = preview.split(",")[1];

      const { data, error } = await supabase.functions.invoke("analyze-meal", {
        body: { imageBase64: base64 },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setResult(data);

      // Save to database if authenticated
      if (user) {
        // Upload image to storage
        const fileName = `${user.id}/${Date.now()}.jpg`;
        const { data: uploadData } = await supabase.storage
          .from("meal-photos")
          .upload(fileName, await fetch(preview).then((r) => r.blob()));

        if (uploadData) {
          const { data: urlData } = supabase.storage
            .from("meal-photos")
            .getPublicUrl(fileName);

          await supabase.from("meal_analyses").insert({
            user_id: user.id,
            image_url: urlData.publicUrl,
            detected_foods: data.detected_foods,
            balance_evaluation: data.balance_evaluation,
            suggestions: data.suggestions,
            educational_snippet: data.educational_snippet,
          });
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Take a quick photo of your meal and Gini will help you understand its balance 🐶
      </p>

      {!preview ? (
        <div className="bg-card rounded-2xl p-8 shadow-soft flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="w-10 h-10 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Take a photo or upload from your gallery
          </p>
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1 rounded-xl gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" /> Upload
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-card rounded-2xl overflow-hidden shadow-soft">
            <img
              src={preview}
              alt="Meal preview"
              className="w-full h-48 object-cover"
            />
          </div>

          {!result && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={reset}
                disabled={analyzing}
              >
                Retake
              </Button>
              <Button
                className="flex-1 rounded-xl gap-2"
                onClick={analyzeMeal}
                disabled={analyzing}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                  </>
                ) : (
                  "Analyze Meal 🐶"
                )}
              </Button>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-fade-in">
              {/* Overall message */}
              <div className="bg-card rounded-2xl p-4 shadow-soft">
                <h3 className="font-display font-semibold text-sm mb-2 flex items-center gap-2">
                  <span className="text-lg">🐶</span> Gini's Meal Thoughts
                </h3>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  "{result.overall_message}"
                </p>
              </div>

              {/* Detected foods */}
              <div className="bg-card rounded-2xl p-4 shadow-soft">
                <h4 className="font-display font-semibold text-xs mb-3 text-muted-foreground">
                  Detected Foods
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.detected_foods.map((food, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-muted text-xs font-medium"
                    >
                      {categoryIcons[food.category] || "🍽️"} {food.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Balance bars */}
              <div className="bg-card rounded-2xl p-4 shadow-soft">
                <h4 className="font-display font-semibold text-xs mb-3 text-muted-foreground">
                  Balance Estimate
                </h4>
                <div className="space-y-3">
                  {[
                    { label: "Carbs", icon: "🌾", value: result.balance_evaluation.carbs },
                    { label: "Protein", icon: "🥚", value: result.balance_evaluation.protein },
                    { label: "Fiber", icon: "🥦", value: result.balance_evaluation.fiber },
                    { label: "Healthy Fats", icon: "🥑", value: result.balance_evaluation.healthy_fats },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs flex items-center gap-1.5">
                          {item.icon} {item.label}
                        </span>
                        <span className="text-[10px] capitalize text-muted-foreground">
                          {item.value === "balanced" || item.value === "good"
                            ? "✔ " + (item.label === "Carbs" ? "Balanced" : "Good")
                            : item.value === "moderate"
                            ? "~ Moderate"
                            : "⚠ " + (item.label === "Carbs" ? "High" : "Low")}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${balanceColor(item.value)}`}
                          style={{ width: `${balancePercent(item.value)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div className="bg-card rounded-2xl p-4 shadow-soft">
                  <h4 className="font-display font-semibold text-xs mb-3 text-muted-foreground">
                    Gentle Suggestions
                  </h4>
                  <div className="space-y-2">
                    {result.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                        <span className="text-primary shrink-0">🌱</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Educational snippet */}
              <div className="bg-primary/5 rounded-2xl p-4">
                <p className="text-xs text-foreground/70 leading-relaxed">
                  💡 {result.educational_snippet}
                </p>
              </div>

              <p className="text-[10px] text-muted-foreground text-center">
                This is educational guidance — not medical advice.
              </p>

              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={reset}
              >
                Analyze Another Meal
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MealCheckTab;
