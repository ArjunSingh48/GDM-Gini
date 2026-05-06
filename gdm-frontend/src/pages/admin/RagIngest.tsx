import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, FileText, X } from "lucide-react";

const INGEST_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rag-ingest`;

const RagIngest = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ added: number; total: number } | null>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []).filter((f) => f.name.endsWith(".md"));
    if (picked.length !== (e.target.files?.length ?? 0)) {
      toast.warning("Only .md files are accepted");
    }
    setFiles((prev) => [...prev, ...picked]);
    e.target.value = "";
  };

  const remove = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const upload = async () => {
    if (files.length === 0) return toast.error("Pick at least one .md file");
    setBusy(true);
    setResult(null);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f, f.name));
      const resp = await fetch(INGEST_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: fd,
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error((data as { error?: string }).error || `HTTP ${resp.status}`);
      setResult(data as { added: number; total: number });
      toast.success(`Indexed ${data.added} new chunks (total: ${data.total})`);
      setFiles([]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-10 flex items-start justify-center">
      <div className="w-full max-w-xl space-y-6">
        <header>
          <h1 className="text-2xl font-display font-bold">RAG Knowledge Upload</h1>
          <p className="text-sm text-muted-foreground">
            Upload .md files. They'll be chunked, embedded, and indexed in the backend.
            Re-uploading a file with the same name replaces its previous chunks.
          </p>
        </header>

        <div className="bg-card rounded-2xl shadow-soft p-6 space-y-4">
          <div>
            <Label htmlFor="files">Markdown files</Label>
            <label
              htmlFor="files"
              className="mt-1 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-6 cursor-pointer hover:bg-muted/40 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm">Click to select .md files</span>
            </label>
            <input
              id="files"
              type="file"
              accept=".md,text/markdown"
              multiple
              className="hidden"
              onChange={onPick}
            />
          </div>

          {files.length > 0 && (
            <ul className="space-y-2">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center justify-between bg-muted/40 rounded-xl px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="truncate">{f.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      ({Math.ceil(f.size / 1024)} KB)
                    </span>
                  </span>
                  <button
                    onClick={() => remove(i)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Button onClick={upload} disabled={busy} className="w-full rounded-xl">
            {busy ? "Indexing…" : `Upload & Index ${files.length || ""}`.trim()}
          </Button>

          {result && (
            <div className="text-sm text-muted-foreground bg-muted/40 rounded-xl p-3">
              Added <strong>{result.added}</strong> new chunks. Index now contains{" "}
              <strong>{result.total}</strong> chunks total.
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Backend endpoint: <code>/ingest</code> on your FastAPI server (derived from CUSTOM_LLM_URL).
        </p>
      </div>
    </div>
  );
};

export default RagIngest;
