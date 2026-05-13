import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const pid = typeof body?.pid === "string" ? body.pid.trim().slice(0, 64) : null;
    const consent_given = !!body?.consent_given;
    const study_id = typeof body?.study_id === "string" ? body.study_id.slice(0, 80) : null;
    const session_id = typeof body?.session_id === "string" ? body.session_id.slice(0, 80) : null;
    const ua = req.headers.get("user-agent")?.slice(0, 500) || null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Audit log (existing)
    await supabase.from("consent_events").insert({ pid, consent_given, user_agent: ua });

    // Track on prolific_participants
    if (pid) {
      const now = new Date().toISOString();
      const { data: existing } = await supabase
        .from("prolific_participants")
        .select("id")
        .eq("prolific_pid", pid)
        .maybeSingle();
      if (existing) {
        await supabase.from("prolific_participants").update({
          consented: consent_given, consent_at: now,
          ...(study_id ? { study_id } : {}),
          ...(session_id ? { session_id } : {}),
        }).eq("prolific_pid", pid);
      } else {
        await supabase.from("prolific_participants").insert({
          prolific_pid: pid, consented: consent_given, consent_at: now, study_id, session_id,
        });
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("consent-log error:", e);
    return new Response(JSON.stringify({ ok: false }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
