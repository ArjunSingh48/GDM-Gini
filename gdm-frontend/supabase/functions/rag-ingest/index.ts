import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const CUSTOM_LLM_URL = Deno.env.get("CUSTOM_LLM_URL"); // e.g. https://xxxx.ngrok-free.app/chat
    const CUSTOM_LLM_API_KEY = Deno.env.get("CUSTOM_LLM_API_KEY");

    if (!CUSTOM_LLM_URL || !CUSTOM_LLM_API_KEY) {
      return new Response(JSON.stringify({ error: "Backend not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Derive /ingest URL from CUSTOM_LLM_URL (which points at /chat)
    const ingestUrl = CUSTOM_LLM_URL.replace(/\/chat\/?$/, "") + "/ingest";

    // Forward the multipart body straight through to FastAPI
    const upstream = await fetch(ingestUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CUSTOM_LLM_API_KEY}`,
        "ngrok-skip-browser-warning": "true",
        "Content-Type": req.headers.get("content-type") ?? "multipart/form-data",
      },
      body: req.body,
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
    });
  } catch (e) {
    console.error("rag-ingest error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
