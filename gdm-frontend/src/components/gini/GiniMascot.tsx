import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import GiniChatDialog from "./GiniChatDialog";

const microMessages = [
  "You've come so far. I'm proud of you. 💚",
  "Small steps make big changes 🌱",
  "You're doing great today! 💚",
  "Progress, not perfection ✨",
  "Every balanced meal helps 🥗",
];

const GiniMascot = () => {
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % microMessages.length);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 4000);
    }, 15000);

    const initial = setTimeout(() => {
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 4000);
    }, 3000);

    return () => { clearInterval(interval); clearTimeout(initial); };
  }, []);

  return (
    <>
      <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2">
        {showMessage && (
          <div className="animate-micro-message-in bg-card shadow-card rounded-2xl rounded-br-md px-3 py-2 max-w-[200px] border border-border">
            <p className="text-xs text-foreground/80 font-medium">
              {microMessages[currentMessage]}
            </p>
          </div>
        )}

        <button
          onClick={() => setChatOpen(true)}
          className="relative animate-gini-float"
          aria-label="Talk to Gini"
        >
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-soft z-10">
            <Search className="w-3 h-3 text-primary-foreground" />
          </div>
          <CuteGiniPuppySVG />
        </button>
      </div>

      <GiniChatDialog open={chatOpen} onOpenChange={setChatOpen} />
    </>
  );
};

const CuteGiniPuppySVG = () => (
  <svg width="52" height="52" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-gini-breathe drop-shadow-md">
    <ellipse cx="32" cy="44" rx="16" ry="13" fill="hsl(40, 55%, 88%)" />
    <circle cx="32" cy="24" r="15" fill="hsl(40, 58%, 91%)" />
    <ellipse cx="19" cy="16" rx="6" ry="9" fill="hsl(30, 40%, 78%)" transform="rotate(-20 19 16)" />
    <ellipse cx="45" cy="16" rx="6" ry="9" fill="hsl(30, 40%, 78%)" transform="rotate(20 45 16)" />
    <circle cx="26" cy="22" r="3.5" fill="hsl(150, 10%, 15%)" />
    <circle cx="27" cy="20.5" r="1.2" fill="white" />
    <circle cx="25.2" cy="22.8" r="0.5" fill="white" />
    <circle cx="38" cy="22" r="3.5" fill="hsl(150, 10%, 15%)" />
    <circle cx="39" cy="20.5" r="1.2" fill="white" />
    <circle cx="37.2" cy="22.8" r="0.5" fill="white" />
    <ellipse cx="32" cy="26.5" rx="1.8" ry="1.2" fill="hsl(150, 10%, 30%)" />
    <path d="M28.5 29 Q32 32 35.5 29" stroke="hsl(150, 10%, 35%)" strokeWidth="0.9" fill="none" strokeLinecap="round" />
    <circle cx="22" cy="27" r="3" fill="hsl(350, 65%, 85%)" opacity="0.5" />
    <circle cx="42" cy="27" r="3" fill="hsl(350, 65%, 85%)" opacity="0.5" />
    <circle cx="46" cy="12" r="2.5" fill="hsl(340, 55%, 78%)" />
    <circle cx="44" cy="10" r="1.8" fill="hsl(340, 55%, 78%)" />
    <circle cx="48" cy="10" r="1.8" fill="hsl(340, 55%, 78%)" />
    <circle cx="46" cy="11" r="0.8" fill="hsl(340, 45%, 70%)" />
    <path d="M48 40 Q54 33 50 27" stroke="hsl(40, 55%, 88%)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <ellipse cx="26" cy="50" rx="4" ry="2.5" fill="hsl(40, 50%, 86%)" />
    <ellipse cx="38" cy="50" rx="4" ry="2.5" fill="hsl(40, 50%, 86%)" />
  </svg>
);

export default GiniMascot;
