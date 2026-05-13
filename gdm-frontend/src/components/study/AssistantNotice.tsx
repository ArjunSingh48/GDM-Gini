import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";

/** Small non-intrusive notice about AI assistant availability. */
const AssistantNotice = () => {
  const { t } = useTranslation();
  return (
    <div className="mt-2 flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
      <span>{t("common.assistantNotice")}</span>
    </div>
  );
};

export default AssistantNotice;
