import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DISCLAIMER = "\n\n_Educational only — does not replace medical advice._";
const MAX_TURNS = 6; // last 3 user + 3 assistant turns

type Msg = { role: "user" | "assistant"; content: string };

function buildQuestion(messages: Msg[]): string {
  const clean = messages.filter(
    (m) => m && typeof m.content === "string" && m.content.trim().length > 0,
  );
  if (clean.length === 0) return "";

  // Last message must be the user's current question
  const last = clean[clean.length - 1];
  const currentQuestion = last.role === "user" ? last.content.trim() : "";
  const history = last.role === "user" ? clean.slice(0, -1) : clean;

  const trimmedHistory = history.slice(-MAX_TURNS);

  if (trimmedHistory.length === 0) return currentQuestion;

  const transcript = trimmedHistory
    .map((m) => (m.role === "user" ? `User: ${m.content.trim()}` : `Assistant: ${m.content.trim()}`))
    .join("\n");

  return `Previous conversation:\n${transcript}\n\nCurrent question: ${currentQuestion}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const messages: Msg[] = Array.isArray(body?.messages) ? body.messages : [];
    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const CUSTOM_LLM_URL = Deno.env.get("CUSTOM_LLM_URL");
    const CUSTOM_LLM_API_KEY = Deno.env.get("CUSTOM_LLM_API_KEY");
    if (!CUSTOM_LLM_URL) throw new Error("CUSTOM_LLM_URL is not configured");
    if (!CUSTOM_LLM_API_KEY) throw new Error("CUSTOM_LLM_API_KEY is not configured");

    const question = buildQuestion(messages);
    if (!question) {
      return new Response(JSON.stringify({ error: "No user question found in messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);

    let upstream: Response;
    try {
      upstream = await fetch(CUSTOM_LLM_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CUSTOM_LLM_API_KEY}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });
    } catch (e) {
      clearTimeout(timeout);
      const aborted = (e as Error)?.name === "AbortError";
      console.error("Upstream fetch failed:", aborted ? "timeout" : (e as Error)?.message);
      return new Response(
        JSON.stringify({
          error: aborted
            ? "The model is taking too long to respond. Please try again. 🐾"
            : "I can't reach the model right now. Please make sure your tunnel is running. 🐾",
        }),
        {
          status: aborted ? 504 : 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    clearTimeout(timeout);

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      console.error("Upstream non-OK:", upstream.status, text.slice(0, 300));
      if (upstream.status === 401 || upstream.status === 403) {
        return new Response(
          JSON.stringify({ error: "Backend rejected the API key. Check CUSTOM_LLM_API_KEY matches the server's API_SECRET." }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (upstream.status === 404) {
        return new Response(
          JSON.stringify({ error: "Backend endpoint not found. Check CUSTOM_LLM_URL ends with /chat." }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (upstream.status === 422) {
        return new Response(
          JSON.stringify({ error: "Backend rejected the request shape (expected {question: string})." }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ error: `Backend error (${upstream.status}). Please try again.` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await upstream.json().catch(() => null);
    const answer = typeof data?.answer === "string" ? data.answer.trim() : "";
    if (!answer) {
      console.error("Upstream returned no 'answer' field:", JSON.stringify(data)?.slice(0, 300));
      return new Response(JSON.stringify({ error: "Model returned an unexpected response shape." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Append disclaimer if not already present
    const lower = answer.toLowerCase();
    const hasDisclaimer =
      lower.includes("does not replace medical advice") ||
      lower.includes("consult your healthcare") ||
      lower.includes("educational only");
    const reply = hasDisclaimer ? answer : answer + DISCLAIMER;

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
