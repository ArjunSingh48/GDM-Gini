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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const pid = typeof body?.pid === "string" ? body.pid.trim() : "";
    if (!PID_RE.test(pid)) {
      return new Response(JSON.stringify({ error: "Invalid PID" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Profile: refuse to overwrite existing different PID
    const { data: prof } = await admin.from("profiles").select("id, prolific_pid").eq("user_id", userId).maybeSingle();
    if (prof?.prolific_pid && prof.prolific_pid !== pid) {
      return new Response(JSON.stringify({ error: "PID already linked to this account" }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (prof) {
      await admin.from("profiles").update({ prolific_pid: pid }).eq("user_id", userId);
    } else {
      await admin.from("profiles").insert({ user_id: userId, prolific_pid: pid });
    }

    // Participants upsert
    const { data: existingP } = await admin.from("participants").select("id, metadata").eq("pid", pid).maybeSingle();
    if (existingP) {
      const meta = { ...(existingP.metadata || {}) };
      await admin.from("participants").update({ user_id: userId, metadata: meta }).eq("pid", pid);
    } else {
      await admin.from("participants").insert({ pid, user_id: userId, metadata: {} });
    }

    // Study session (idempotent on (pid,user_id))
    await admin.from("study_sessions").upsert({
      pid, user_id: userId, consent_given: true, consent_at: new Date().toISOString(),
    }, { onConflict: "pid,user_id" });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("link-pid error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
