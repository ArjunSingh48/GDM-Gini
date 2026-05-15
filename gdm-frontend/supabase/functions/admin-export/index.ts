import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import * as XLSX from "npm:xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Canonical question order (mirrors src/lib/study/questions.ts)
const QUESTION_ORDER: { id: string; text: string }[] = [
  { id: "prolific_id", text: "Please provide your Prolific ID" },
  { id: "age", text: "How old are you?" },
  { id: "pregnancy_status", text: "Are you currently pregnant or have you been pregnant before?" },
  { id: "app_familiarity", text: "How familiar are you with pregnancy health tracking apps?" },
  { id: "first_impression", text: "What was your first impression of the app/dashboard?" },
  { id: "ease_of_understanding", text: "How easy was it to understand what the app does?" },
  { id: "liked_most", text: "What did you like the most about the app?" },
  { id: "confusing", text: "What confused you or felt unclear?" },
  { id: "daily_checklist_useful", text: "Did you find the daily checklist useful?" },
  { id: "would_follow_daily_tasks", text: "Would you realistically follow these daily tasks?" },
  { id: "recipes_appealing", text: "Do you find the recipe recommendations appealing?" },
  { id: "reminders_feel", text: "Did the reminders feel supportive or overwhelming?" },
  { id: "preferred_wellness_reminder", text: "Which type of wellness reminder did you like most?" },
  { id: "track_meals_health_daily", text: "Would you use a feature to track meals or health daily?" },
  { id: "motivation_to_track", text: "What would motivate you to track consistently?" },
  { id: "learning_materials_interesting", text: "Do you find the learning materials interesting?" },
  { id: "meal_suggestions_helpful", text: "How helpful were the meal suggestions?" },
  { id: "meals_feel", text: "Do the meals feel: (select all that apply)" },
  { id: "ingredients_easy_to_buy", text: "Do the ingredients feel easy to buy?" },
  { id: "would_use_app", text: "Would you use this app if it were available?" },
  { id: "use_frequency", text: "How often would you use it?" },
  { id: "consistent_use_motivator", text: "What would make you use it more consistently?" },
];

function toCsv(rows: Record<string, unknown>[], headers?: string[]): string {
  if (rows.length === 0) return (headers || []).join(",");
  const hdrs = headers || Object.keys(rows[0]);
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [
    hdrs.join(","),
    ...rows.map((r) => hdrs.map((h) => esc(r[h])).join(",")),
  ].join("\n");
}

function fmtAnswer(a: unknown): string {
  if (a === null || a === undefined) return "";
  if (Array.isArray(a)) return a.join("; ");
  if (typeof a === "object") return JSON.stringify(a);
  return String(a);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const format = body?.format === "xlsx" ? "xlsx" : "csv";
    const dataset = ["survey", "chat", "participants", "prolific", "all"].includes(body?.dataset) ? body.dataset : "all";
    const pidFilter = typeof body?.pid === "string" && body.pid.trim() ? body.pid.trim() : null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const fetchByPid = async (table: string, orderCol = "created_at") => {
      let q = supabase.from(table).select("*").order(orderCol, { ascending: true });
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

    const fetchProlific = async () => {
      let q = supabase.from("prolific_participants").select("*").order("created_at", { ascending: true });
      if (pidFilter) q = q.eq("prolific_pid", pidFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    };

    // Build the wide pivoted "everything" sheet for `all`
    const buildWide = async () => {
      const [participants, prolific, survey, chats] = await Promise.all([
        fetchParticipants(),
        fetchProlific(),
        fetchByPid("survey_responses"),
        fetchByPid("chat_logs"),
      ]);

      const pidSet = new Set<string>();
      for (const r of participants) pidSet.add((r as any).pid);
      for (const r of prolific) pidSet.add((r as any).prolific_pid);
      for (const r of survey) pidSet.add((r as any).pid);
      for (const r of chats) pidSet.add((r as any).pid);

      const partByPid = new Map(participants.map((r: any) => [r.pid, r]));
      const prolByPid = new Map(prolific.map((r: any) => [r.prolific_pid, r]));
      const chatCount = new Map<string, number>();
      for (const c of chats) chatCount.set((c as any).pid, (chatCount.get((c as any).pid) || 0) + 1);

      // group answers by pid -> question_id -> latest answer
      const answersByPid = new Map<string, Map<string, unknown>>();
      const extraQuestions = new Map<string, string>(); // id -> text (for any unknown ids)
      for (const r of survey as any[]) {
        if (!answersByPid.has(r.pid)) answersByPid.set(r.pid, new Map());
        answersByPid.get(r.pid)!.set(r.question_id, r.answer);
        if (!QUESTION_ORDER.find((q) => q.id === r.question_id)) {
          extraQuestions.set(r.question_id, r.question_text || r.question_id);
        }
      }

      const baseCols = [
        "pid",
        "session_start",
        "completed_at",
        "completion_code",
        "prolific_study_id",
        "prolific_session_id",
        "consented",
        "consent_at",
        "screening_passed",
        "screening_q1",
        "screening_q2",
        "survey_completed",
        "survey_completed_at",
        "chat_message_count",
      ];
      const qCols = [
        ...QUESTION_ORDER.map((q) => q.id),
        ...Array.from(extraQuestions.keys()),
      ];
      const headers = [...baseCols, ...qCols];

      const headerLabelRow: Record<string, unknown> = {};
      for (const c of baseCols) headerLabelRow[c] = c;
      for (const q of QUESTION_ORDER) headerLabelRow[q.id] = q.text;
      for (const [id, text] of extraQuestions) headerLabelRow[id] = text;

      const rows: Record<string, unknown>[] = [];
      // Row 0 = human-readable question text
      rows.push(headerLabelRow);

      const sortedPids = Array.from(pidSet).filter(Boolean).sort();
      for (const pid of sortedPids) {
        const p: any = partByPid.get(pid) || {};
        const pr: any = prolByPid.get(pid) || {};
        const ans = answersByPid.get(pid) || new Map();
        const row: Record<string, unknown> = {
          pid,
          session_start: p.session_start ?? "",
          completed_at: p.completed_at ?? "",
          completion_code: p.completion_code ?? pr.completion_code ?? "",
          prolific_study_id: p.study_id ?? pr.study_id ?? "",
          prolific_session_id: p.session_id ?? pr.session_id ?? "",
          consented: pr.consented ?? "",
          consent_at: pr.consent_at ?? "",
          screening_passed: pr.screening_passed ?? "",
          screening_q1: pr.screening_q1 ?? "",
          screening_q2: pr.screening_q2 ?? "",
          survey_completed: pr.survey_completed ?? "",
          survey_completed_at: pr.survey_completed_at ?? "",
          chat_message_count: chatCount.get(pid) || 0,
        };
        for (const qid of qCols) {
          row[qid] = fmtAnswer(ans.get(qid));
        }
        rows.push(row);
      }
      return { headers, rows, raw: { participants, prolific, survey, chats } };
    };

    if (dataset === "all") {
      const { headers, rows, raw } = await buildWide();

      if (format === "csv") {
        const csv = toCsv(rows, headers);
        return new Response(csv, {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="study-all-wide-${Date.now()}.csv"`,
          },
        });
      }

      // xlsx: wide sheet first, then raw sheets for completeness
      const wb = XLSX.utils.book_new();
      const wsWide = XLSX.utils.json_to_sheet(rows, { header: headers });
      XLSX.utils.book_append_sheet(wb, wsWide, "all_responses_wide");

      const addRaw = (name: string, data: Record<string, unknown>[]) => {
        const flat = data.map((r) => {
          const out: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(r)) {
            out[k] = v !== null && typeof v === "object" ? JSON.stringify(v) : v;
          }
          return out;
        });
        const ws = XLSX.utils.json_to_sheet(flat.length ? flat : [{ note: "No data" }]);
        XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
      };
      addRaw("participants", raw.participants);
      addRaw("prolific_participants", raw.prolific);
      addRaw("survey_responses_long", raw.survey);
      addRaw("chat_logs", raw.chats);

      const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
      return new Response(buf, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="study-all-${Date.now()}.xlsx"`,
        },
      });
    }

    // Other datasets: original behavior (single dataset)
    const datasets: Record<string, Record<string, unknown>[]> = {};
    if (dataset === "survey") datasets.survey_responses = await fetchByPid("survey_responses");
    if (dataset === "chat") datasets.chat_logs = await fetchByPid("chat_logs");
    if (dataset === "participants") datasets.participants = await fetchParticipants();
    if (dataset === "prolific") datasets.prolific_participants = await fetchProlific();

    if (format === "csv") {
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
