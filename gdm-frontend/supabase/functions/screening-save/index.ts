import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PID_RE = /^[A-Za-z0-9]{6,40}$/;

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
    const yn = (v: unknown) => (v === "yes" || v === "no" ? v : null);
    const q1 = yn(body?.q1);
    const q2 = yn(body?.q2);
    const passed = q1 === "yes" && q2 === "yes";
    const study_id = typeof body?.study_id === "string" ? body.study_id.slice(0, 80) : null;
    const session_id = typeof body?.session_id === "string" ? body.session_id.slice(0, 80) : null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const now = new Date().toISOString();

    // Upsert into prolific_participants
    const { data: existing } = await supabase
      .from("prolific_participants")
      .select("id, prolific_pid")
      .eq("prolific_pid", pid)
      .maybeSingle();

    if (existing) {
      await supabase.from("prolific_participants").update({
        screening_q1: q1, screening_q2: q2, screening_passed: passed, screening_at: now,
        study_id, session_id,
      }).eq("prolific_pid", pid);
    } else {
      await supabase.from("prolific_participants").insert({
        prolific_pid: pid, study_id, session_id,
        screening_q1: q1, screening_q2: q2, screening_passed: passed, screening_at: now,
      });
    }

    return new Response(JSON.stringify({ ok: true, passed }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("screening-save error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
