import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PID_RE = /^[A-Za-z0-9]{6,40}$/;
const COMPLETION_CODE = "CSI9H44M";
const REDIRECT_URL = "https://app.prolific.com/submissions/complete?cc=CSI9H44M";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const pid = typeof body?.pid === "string" ? body.pid.trim() : "";
    if (!PID_RE.test(pid)) {
      return new Response(JSON.stringify({ error: "Invalid PID" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const now = new Date().toISOString();

    // Existing participants table
    await supabase
      .from("participants")
      .update({ completed_at: now, completion_code: COMPLETION_CODE })
      .eq("pid", pid);

    // New prolific_participants tracking
    const { data: existing } = await supabase
      .from("prolific_participants")
      .select("id")
      .eq("prolific_pid", pid)
      .maybeSingle();
    if (existing) {
      await supabase.from("prolific_participants").update({
        survey_completed: true, survey_completed_at: now, completion_code: COMPLETION_CODE,
      }).eq("prolific_pid", pid);
    } else {
      await supabase.from("prolific_participants").insert({
        prolific_pid: pid, survey_completed: true, survey_completed_at: now, completion_code: COMPLETION_CODE,
      });
    }

    return new Response(JSON.stringify({ redirectUrl: REDIRECT_URL, completionCode: COMPLETION_CODE }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("study-complete error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
