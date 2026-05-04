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
    const metadata = typeof body?.metadata === "object" && body.metadata !== null ? body.metadata : {};

    if (!PID_RE.test(pid)) {
      return new Response(JSON.stringify({ error: "Invalid PID format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: existing } = await supabase
      .from("participants")
      .select("id, pid, session_start, completed_at, metadata")
      .eq("pid", pid)
      .maybeSingle();

    let participant = existing;
    if (existing) {
      // Duplicate PID — flag in metadata
      const merged = { ...(existing.metadata || {}), duplicate_warning: true, last_revisit: new Date().toISOString() };
      const { data: updated } = await supabase
        .from("participants")
        .update({ metadata: merged })
        .eq("pid", pid)
        .select()
        .single();
      participant = updated || existing;
    } else {
      const { data: inserted, error } = await supabase
        .from("participants")
        .insert({ pid, metadata })
        .select()
        .single();
      if (error) throw error;
      participant = inserted;
    }

    return new Response(JSON.stringify({ participant }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("study-init error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
