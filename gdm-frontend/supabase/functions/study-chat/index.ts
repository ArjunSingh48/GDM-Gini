import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PID_RE = /^[A-Za-z0-9]{6,40}$/;
const MAX_TURNS = 6;

type Msg = { role: "user" | "assistant"; content: string };

function buildQuestion(messages: Msg[]): string {
  const clean = messages.filter((m) => m && typeof m.content === "string" && m.content.trim().length > 0);
  if (clean.length === 0) return "";
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
    const pid = typeof body?.pid === "string" ? body.pid.trim() : "";
    const userId = typeof body?.user_id === "string" ? body.user_id : null;
    const messages: Msg[] = Array.isArray(body?.messages) ? body.messages : [];
    if (!PID_RE.test(pid)) {
      return new Response(JSON.stringify({ error: "Invalid PID" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const last = messages[messages.length - 1];
    const userQuery = last?.role === "user" ? last.content.trim() : "";

    const CUSTOM_LLM_URL = Deno.env.get("CUSTOM_LLM_URL");
    const CUSTOM_LLM_API_KEY = Deno.env.get("CUSTOM_LLM_API_KEY");

    let reply = "";
    let errorMsg = "";

    try {
      if (!CUSTOM_LLM_URL || !CUSTOM_LLM_API_KEY) throw new Error("LLM not configured");
      const question = buildQuestion(messages);
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 25000);
      const upstream = await fetch(CUSTOM_LLM_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CUSTOM_LLM_API_KEY}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });
      clearTimeout(t);
      if (!upstream.ok) throw new Error(`Upstream ${upstream.status}`);
      const data = await upstream.json().catch(() => null);
      reply = typeof data?.answer === "string" ? data.answer.trim() : "";
      if (!reply) throw new Error("Empty response");
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : "unknown";
      reply = "I'm having trouble connecting right now. Please try again in a moment.";
    }

    // Always log
    try {
      await supabase.from("chat_logs").insert({
        pid,
        user_id: userId,
        user_query: userQuery,
        bot_response: errorMsg ? `[error: ${errorMsg}] ${reply}` : reply,
      });
    } catch (logErr) {
      console.error("chat log insert failed:", logErr);
    }

    return new Response(JSON.stringify({ reply }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("study-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
