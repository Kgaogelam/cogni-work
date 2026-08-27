import { ShieldAlert } from "lucide-react";

import { useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";

export const AI_DISCLAIMER =
  "AI-generated content may contain errors or omissions. Always review and verify AI-generated information before using it for important workplace, business, legal or financial decisions.";

export const PRIVACY_NOTICE =
  "Do not enter confidential, sensitive, personal, financial or proprietary information into the application unless appropriate safeguards are in place.";

export function AiDisclaimer({ text = AI_DISCLAIMER, className }: { text?: string; className?: string }) {
  const show = useAppState((s) => s.settings.showDisclaimers);
  if (!show) return null;
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      <ShieldAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span>{text}</span>
    </p>
  );
}
