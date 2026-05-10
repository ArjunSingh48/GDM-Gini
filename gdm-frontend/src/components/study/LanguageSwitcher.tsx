import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANGUAGES } from "@/lib/i18n";

interface Props {
  className?: string;
}

const normalize = (lng?: string) => (lng || "en").split("-")[0].toLowerCase();

const LanguageSwitcher = ({ className }: Props) => {
  const { i18n } = useTranslation();
  const [lng, setLng] = useState(normalize(i18n.resolvedLanguage || i18n.language));

  useEffect(() => {
    const onChange = (l: string) => setLng(normalize(l));
    i18n.on("languageChanged", onChange);
    return () => i18n.off("languageChanged", onChange);
  }, [i18n]);

  const current = LANGUAGES.find((l) => l.code === lng) ?? LANGUAGES[0];

  const change = async (code: string) => {
    await i18n.changeLanguage(code);
    try {
      localStorage.setItem("i18nextLng", code);
    } catch {}
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-full gap-2 bg-background/80 backdrop-blur">
            <Globe className="h-4 w-4" />
            <span className="text-xs font-medium">{current.label}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="z-50 bg-popover">
          {LANGUAGES.map((l) => (
            <DropdownMenuItem
              key={l.code}
              onClick={() => change(l.code)}
              className={l.code === current.code ? "font-semibold" : ""}
            >
              {l.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LanguageSwitcher;
