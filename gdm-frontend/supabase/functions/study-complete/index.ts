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
    if (!PID_RE.test(pid)) {
      return new Response(JSON.stringify({ error: "Invalid PID" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const completionCode = Deno.env.get("PROLIFIC_COMPLETION_CODE") || "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    await supabase
      .from("participants")
      .update({ completed_at: new Date().toISOString(), completion_code: completionCode })
      .eq("pid", pid);

    const redirectUrl = `https://app.prolific.com/submissions/complete?cc=${encodeURIComponent(completionCode)}`;

    return new Response(JSON.stringify({ redirectUrl, completionCode }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("study-complete error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
