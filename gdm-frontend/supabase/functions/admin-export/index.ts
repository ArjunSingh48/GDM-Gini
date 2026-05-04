import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
  ].join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const password = typeof body?.admin_password === "string" ? body.admin_password : "";
    const format = body?.format === "xlsx" ? "xlsx" : "csv";
    const dataset = ["survey", "chat", "participants", "all"].includes(body?.dataset) ? body.dataset : "all";
    const pidFilter = typeof body?.pid === "string" && body.pid.trim() ? body.pid.trim() : null;

    const expected = Deno.env.get("ADMIN_EXPORT_PASSWORD") || "";
    if (!expected || password !== expected) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const fetchRows = async (table: string) => {
      let q = supabase.from(table).select("*").order("created_at", { ascending: true });
      if (pidFilter) q = q.eq("pid", pidFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    };

    const fetchParticipants = async () => {
      let q = supabase.from("participants").select("*").order("session_start", { ascending: true });
      if (pidFilter) q = q.eq("pid", pidFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    };

    const datasets: Record<string, Record<string, unknown>[]> = {};
    if (dataset === "survey" || dataset === "all") datasets.survey_responses = await fetchRows("survey_responses");
    if (dataset === "chat" || dataset === "all") datasets.chat_logs = await fetchRows("chat_logs");
    if (dataset === "participants" || dataset === "all") datasets.participants = await fetchParticipants();

    if (format === "csv") {
      // single dataset → CSV; multi → concatenated with section headers
      const parts: string[] = [];
      for (const [name, rows] of Object.entries(datasets)) {
        parts.push(`# ${name}`);
        parts.push(toCsv(rows));
        parts.push("");
      }
      return new Response(parts.join("\n"), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="study-export-${Date.now()}.csv"`,
        },
      });
    }

    // xlsx
    const wb = XLSX.utils.book_new();
    for (const [name, rows] of Object.entries(datasets)) {
      const flat = rows.map((r) => {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(r)) {
          out[k] = v !== null && typeof v === "object" ? JSON.stringify(v) : v;
        }
        return out;
      });
      const ws = XLSX.utils.json_to_sheet(flat.length ? flat : [{ note: "No data" }]);
      XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
    }
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    return new Response(buf, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="study-export-${Date.now()}.xlsx"`,
      },
    });
  } catch (e) {
    console.error("admin-export error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
