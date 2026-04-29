import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a supportive metabolic health advisor for pregnant mothers with gestational diabetes.

Analyze the provided health data and generate:
1. Pattern insights — correlations between meals, activities, and glucose readings
2. Glucose predictions — gentle, uncertain predictions about future glucose tendencies
3. Daily focus suggestions — 3 actionable, simple daily tips

Rules:
- Always use uncertainty language: "may", "tends to", "might", "based on patterns"
- NEVER make definitive medical statements
- Keep suggestions simple and actionable
- Be warm and encouraging
- Focus on positive patterns first`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { glucoseLogs, mealAnalyses, activities, profile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const dataContext = `
User Profile: Week ${profile?.pregnancy_week || 'unknown'}, Risk: ${profile?.risk_level || 'unknown'}

Recent Glucose Logs (last 7 days):
${JSON.stringify(glucoseLogs?.slice(0, 14) || [], null, 2)}

Recent Meal Analyses:
${JSON.stringify(mealAnalyses?.slice(0, 5) || [], null, 2)}

Recent Activities:
${JSON.stringify(activities?.slice(0, 10) || [], null, 2)}
`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Analyze this health data and provide metabolic insights:\n\n${dataContext}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "metabolic_insights",
              description: "Structured metabolic insights result",
              parameters: {
                type: "object",
                properties: {
                  patterns: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        icon: { type: "string" },
                        insight: { type: "string" },
                      },
                      required: ["icon", "insight"],
                    },
                    description: "2-4 pattern insights",
                  },
                  prediction: {
                    type: "string",
                    description: "A gentle glucose prediction with uncertainty language",
                  },
                  daily_focus: {
                    type: "array",
                    items: { type: "string" },
                    description: "Exactly 3 personalized daily focus suggestions",
                  },
                },
                required: ["patterns", "prediction", "daily_focus"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "metabolic_insights" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("metabolic-insights error:", response.status, t);
      return new Response(JSON.stringify({ error: "Insights generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No insights generated" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const insights = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("metabolic-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
