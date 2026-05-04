import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { callFnRaw } from "@/lib/study/network";

type Dataset = "all" | "survey" | "chat" | "participants";
type Format = "csv" | "xlsx";

const AdminExport = () => {
  const [password, setPassword] = useState("");
  const [pidFilter, setPidFilter] = useState("");
  const [busy, setBusy] = useState(false);

  const download = async (dataset: Dataset, format: Format) => {
    if (!password) { toast.error("Enter the admin password"); return; }
    setBusy(true);
    try {
      const resp = await callFnRaw("admin-export", {
        admin_password: password,
        dataset,
        format,
        pid: pidFilter.trim() || undefined,
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || `HTTP ${resp.status}`);
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `study-${dataset}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-10 flex items-start justify-center">
      <div className="w-full max-w-xl space-y-6">
        <header>
          <h1 className="text-2xl font-display font-bold">Study Data Export</h1>
          <p className="text-sm text-muted-foreground">Download participant survey responses, chat logs, and metadata.</p>
        </header>

        <div className="bg-card rounded-2xl shadow-soft p-6 space-y-4">
          <div>
            <Label htmlFor="pwd">Admin password</Label>
            <Input id="pwd" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl mt-1" />
          </div>
          <div>
            <Label htmlFor="pid">Filter by PID (optional)</Label>
            <Input id="pid" value={pidFilter} onChange={(e) => setPidFilter(e.target.value)} placeholder="Leave blank for all participants" className="rounded-xl mt-1" />
          </div>
        </div>

        <Section title="All data (participants + survey + chat)">
          <Button onClick={() => download("all", "csv")} disabled={busy} className="rounded-xl">CSV</Button>
          <Button onClick={() => download("all", "xlsx")} disabled={busy} className="rounded-xl">Excel</Button>
        </Section>
        <Section title="Survey responses">
          <Button onClick={() => download("survey", "csv")} disabled={busy} variant="outline" className="rounded-xl">CSV</Button>
          <Button onClick={() => download("survey", "xlsx")} disabled={busy} variant="outline" className="rounded-xl">Excel</Button>
        </Section>
        <Section title="Chat logs">
          <Button onClick={() => download("chat", "csv")} disabled={busy} variant="outline" className="rounded-xl">CSV</Button>
          <Button onClick={() => download("chat", "xlsx")} disabled={busy} variant="outline" className="rounded-xl">Excel</Button>
        </Section>
        <Section title="Participants only">
          <Button onClick={() => download("participants", "csv")} disabled={busy} variant="outline" className="rounded-xl">CSV</Button>
          <Button onClick={() => download("participants", "xlsx")} disabled={busy} variant="outline" className="rounded-xl">Excel</Button>
        </Section>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-card rounded-2xl shadow-soft p-4 flex items-center justify-between">
    <span className="text-sm font-medium">{title}</span>
    <div className="flex gap-2">{children}</div>
  </div>
);

export default AdminExport;
