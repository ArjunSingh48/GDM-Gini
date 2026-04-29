import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Leaf, Heart, Sparkles } from "lucide-react";

const CuteGiniSVG = () => (
  <svg width="120" height="120" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body */}
    <ellipse cx="32" cy="46" rx="14" ry="11" fill="hsl(40, 55%, 88%)" />
    {/* Head */}
    <circle cx="32" cy="26" r="16" fill="hsl(40, 58%, 91%)" />
    {/* Floppy ears */}
    <ellipse cx="18" cy="18" rx="5.5" ry="9" fill="hsl(30, 40%, 78%)" transform="rotate(-18 18 18)" />
    <ellipse cx="46" cy="18" rx="5.5" ry="9" fill="hsl(30, 40%, 78%)" transform="rotate(18 46 18)" />
    {/* Eyes */}
    <circle cx="25" cy="24" r="4" fill="hsl(150, 10%, 15%)" />
    <circle cx="26.2" cy="22.2" r="1.5" fill="white" />
    <circle cx="24.5" cy="25" r="0.6" fill="white" />
    <circle cx="39" cy="24" r="4" fill="hsl(150, 10%, 15%)" />
    <circle cx="40.2" cy="22.2" r="1.5" fill="white" />
    <circle cx="38.5" cy="25" r="0.6" fill="white" />
    {/* Tiny nose */}
    <ellipse cx="32" cy="28.5" rx="2" ry="1.3" fill="hsl(150, 10%, 30%)" />
    {/* Smile */}
    <path d="M28 31 Q32 34.5 36 31" stroke="hsl(150, 10%, 35%)" strokeWidth="0.9" fill="none" strokeLinecap="round" />
    {/* Rosy cheeks */}
    <circle cx="21" cy="29" r="3.5" fill="hsl(350, 65%, 85%)" opacity="0.45" />
    <circle cx="43" cy="29" r="3.5" fill="hsl(350, 65%, 85%)" opacity="0.45" />
    {/* Pink bow */}
    <circle cx="47" cy="14" r="2.5" fill="hsl(340, 55%, 78%)" />
    <circle cx="45" cy="12" r="1.8" fill="hsl(340, 55%, 78%)" />
    <circle cx="49" cy="12" r="1.8" fill="hsl(340, 55%, 78%)" />
    <circle cx="47" cy="13" r="0.8" fill="hsl(340, 45%, 70%)" />
    {/* Tail */}
    <path d="M46 42 Q53 35 50 28" stroke="hsl(40, 55%, 88%)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    {/* Paws */}
    <ellipse cx="25" cy="52" rx="4.5" ry="2.5" fill="hsl(40, 50%, 86%)" />
    <ellipse cx="39" cy="52" rx="4.5" ry="2.5" fill="hsl(40, 50%, 86%)" />
  </svg>
);

const Intro = () => {
  const navigate = useNavigate();

  const features = [
    { icon: <Leaf className="w-5 h-5 text-primary" />, text: "Personalized nutrition guidance" },
    { icon: <Heart className="w-5 h-5 text-primary" />, text: "Gentle glucose tracking" },
    { icon: <Sparkles className="w-5 h-5 text-primary" />, text: "Evidence-based education" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-6 py-12"
      style={{ background: "linear-gradient(180deg, hsl(60, 20%, 95%) 0%, hsl(340, 40%, 92%) 100%)" }}
    >
      <div className="w-full max-w-sm flex-1 flex flex-col items-center justify-center">
        {/* Mascot */}
        <div className="animate-gini-float mb-6">
          <CuteGiniSVG />
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 justify-center mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === 0 ? "bg-primary w-8" : "bg-primary/20 w-4"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center animate-fade-in">
          <h1 className="text-3xl font-display font-bold mb-3 text-foreground">
            Hello, Mama. 🌿
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-[280px] mx-auto">
            I'm Gini, your gentle companion for managing gestational diabetes. Together, we'll make this journey calmer and more manageable.
          </p>

          <div className="space-y-3 mb-6">
            {features.map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-soft"
              >
                {item.icon}
                <span className="text-sm font-medium text-foreground">{item.text}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mb-6">
            Educational guidance only — not a substitute for medical care.
          </p>
        </div>
      </div>

      {/* Bottom */}
      <div className="w-full max-w-sm">
        <Button
          onClick={() => navigate("/auth")}
          className="w-full rounded-2xl h-12 font-semibold shadow-soft"
        >
          Let's Begin <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default Intro;
