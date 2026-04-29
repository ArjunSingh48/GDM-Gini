import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Gini's meal analysis assistant for pregnant mothers with gestational diabetes (GDM).

Analyze the meal photo and provide a supportive, educational assessment.

Rules:
- Be encouraging, never critical
- Use gentle language: "You might try..." not "You should..."
- Focus on what's good about the meal first
- Approximate detection is fine — don't claim perfect accuracy
- Always include an educational snippet about nutrition`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, imageUrl } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Validate image size (reject if base64 > 4MB)
    if (imageBase64 && imageBase64.length > 5_500_000) {
      return new Response(JSON.stringify({ error: "Image is too large. Please use a smaller photo." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageContent = imageBase64
      ? { type: "image_url" as const, image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
      : { type: "image_url" as const, image_url: { url: imageUrl } };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              imageContent,
              { type: "text", text: "Analyze this meal for a pregnant mother managing gestational diabetes. Identify the foods, evaluate nutritional balance, and provide gentle suggestions." },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "meal_analysis",
              description: "Structured meal analysis result",
              parameters: {
                type: "object",
                properties: {
                  detected_foods: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        category: { type: "string", enum: ["carb", "protein", "fiber", "fat", "other"] },
                      },
                      required: ["name", "category"],
                    },
                  },
                  balance_evaluation: {
                    type: "object",
                    properties: {
                      carbs: { type: "string", enum: ["balanced", "moderate", "high"] },
                      protein: { type: "string", enum: ["good", "moderate", "low"] },
                      fiber: { type: "string", enum: ["good", "moderate", "low"] },
                      healthy_fats: { type: "string", enum: ["good", "moderate", "low"] },
                    },
                    required: ["carbs", "protein", "fiber", "healthy_fats"],
                  },
                  overall_message: { type: "string", description: "A warm, supportive summary of the meal (1-2 sentences)" },
                  suggestions: {
                    type: "array",
                    items: { type: "string" },
                    description: "1-3 gentle improvement suggestions",
                  },
                  educational_snippet: { type: "string", description: "A short educational fact about nutrition and GDM" },
                },
                required: ["detected_foods", "balance_evaluation", "overall_message", "suggestions", "educational_snippet"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "meal_analysis" } },
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("analyze-meal error:", response.status, t);
      return new Response(JSON.stringify({ error: "Analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let data;
    try {
      const responseText = await response.text();
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Failed to parse AI response:", parseErr);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      // Fallback: try to extract from text content
      const textContent = data.choices?.[0]?.message?.content;
      if (textContent) {
        try {
          const jsonMatch = textContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const fallbackAnalysis = JSON.parse(jsonMatch[0]);
            return new Response(JSON.stringify(fallbackAnalysis), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        } catch {}
      }
      console.error("No tool call in response:", JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({ error: "No analysis result" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let analysis;
    try {
      analysis = JSON.parse(toolCall.function.arguments);
    } catch (parseErr) {
      console.error("Failed to parse tool call arguments:", toolCall.function.arguments?.slice(0, 500));
      return new Response(JSON.stringify({ error: "Failed to parse analysis result" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return new Response(JSON.stringify({ error: "Analysis timed out. Please try with a smaller image." }), {
        status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("analyze-meal error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
