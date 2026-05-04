import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { getStoredPid } from "@/lib/study/pid";
import { callFn } from "@/lib/study/network";

type Message = { role: "user" | "assistant"; content: string };

const MIN_TURNS = 3;

const StudyChat = () => {
  const navigate = useNavigate();
  const pid = getStoredPid();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm here to answer your questions. Ask me anything you'd like — try at least 3 questions before finishing." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!pid) navigate("/study", { replace: true }); }, [pid, navigate]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const userTurns = messages.filter((m) => m.role === "user").length;
  const canFinish = userTurns >= MIN_TURNS;

  const send = async () => {
    if (!input.trim() || loading || !pid) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setInput("");
    setMessages((p) => [...p, userMsg]);
    setLoading(true);
    try {
      const data = await callFn<{ reply: string }>("study-chat", { pid, messages: [...messages, userMsg] });
      setMessages((p) => [...p, { role: "assistant", content: data.reply }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chat error");
      setMessages((p) => [...p, { role: "assistant", content: "I'm having trouble right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between bg-card">
        <div>
          <h1 className="font-display font-semibold">Chat with the assistant</h1>
          <p className="text-xs text-muted-foreground">Ask at least {MIN_TURNS} questions • {userTurns}/{MIN_TURNS}</p>
        </div>
        <Button onClick={() => navigate("/study/done")} disabled={!canFinish} variant={canFinish ? "default" : "outline"} className="rounded-xl">
          Finish study →
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                m.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
              }`}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      <footer className="border-t border-border p-3 bg-card">
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="max-w-2xl mx-auto flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question…" className="rounded-xl" />
          <Button type="submit" size="icon" disabled={!input.trim() || loading} className="rounded-xl"><Send className="w-4 h-4" /></Button>
        </form>
      </footer>
    </div>
  );
};

export default StudyChat;
