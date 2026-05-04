import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PID_RE = /^[A-Za-z0-9]{6,40}$/;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const pid = typeof body?.pid === "string" ? body.pid.trim() : "";
    const question_id = typeof body?.question_id === "string" ? body.question_id : "";
    const question_text = typeof body?.question_text === "string" ? body.question_text : null;
    const answer = body?.answer;
    const time_spent_ms = typeof body?.time_spent_ms === "number" ? body.time_spent_ms : null;

    if (!PID_RE.test(pid)) {
      return new Response(JSON.stringify({ error: "Invalid PID" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!question_id || answer === undefined) {
      return new Response(JSON.stringify({ error: "question_id and answer required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify participant exists
    const { data: p } = await supabase.from("participants").select("pid").eq("pid", pid).maybeSingle();
    if (!p) {
      return new Response(JSON.stringify({ error: "Unknown PID" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase
      .from("survey_responses")
      .insert({ pid, question_id, question_text, answer, time_spent_ms })
      .select()
      .single();
    if (error) throw error;

    return new Response(JSON.stringify({ saved: data }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("study-survey-save error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
