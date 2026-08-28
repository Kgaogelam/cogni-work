import { AlertTriangle, Check, Copy, Eraser, Pencil, RefreshCw, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { AiDisclaimer } from "@/components/ai-disclaimer";
import { MarkdownView } from "@/components/markdown-view";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

export function AiLoading({ label = "Generating with AI…" }: { label?: string }) {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="size-4 animate-pulse text-primary" aria-hidden="true" />
        {label}
      </p>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function AiErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="flex items-start gap-2 text-sm text-foreground">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
        <span>{message}</span>
      </p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" /> Try again
        </Button>
      ) : null}
    </div>
  );
}

export function AiOutputPanel({
  title,
  value,
  onChange,
  onRegenerate,
  onClear,
  isLoading,
  error,
  emptyState,
  extraActions,
  loadingLabel,
  monospaceEdit,
}: {
  title: string;
  value: string;
  onChange: (next: string) => void;
  onRegenerate?: () => void;
  onClear?: () => void;
  isLoading?: boolean;
  error?: string | null;
  emptyState: ReactNode;
  extraActions?: ReactNode;
  loadingLabel?: string;
  monospaceEdit?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy. Please select the text and copy manually.");
    }
  };

  const hasContent = value.trim().length > 0;

  return (
    <section
      aria-label={title}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-ai-surface px-4 py-3 sm:px-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex size-6 items-center justify-center rounded-md bg-ai text-ai-foreground">
            <Sparkles className="size-3.5" aria-hidden="true" />
          </span>
          {title}
          <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            AI generated
          </span>
        </h2>
        {hasContent && !isLoading ? (
          <div className="flex flex-wrap gap-2">
            <Button variant={editing ? "default" : "outline"} size="sm" onClick={() => setEditing((e) => !e)}>
              <Pencil className="size-4" aria-hidden="true" />
              {editing ? "Done editing" : "Edit"}
            </Button>
            <Button variant="outline" size="sm" onClick={copy}>
              {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
              Copy
            </Button>
            {onRegenerate ? (
              <Button variant="outline" size="sm" onClick={onRegenerate}>
                <RefreshCw className="size-4" aria-hidden="true" /> Regenerate
              </Button>
            ) : null}
            {onClear ? (
              <Button variant="ghost" size="sm" onClick={onClear}>
                <Eraser className="size-4" aria-hidden="true" /> Clear
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="space-y-4 px-4 py-5 sm:px-5">
        {isLoading ? (
          <AiLoading label={loadingLabel ?? undefined} />
        ) : error ? (
          <AiErrorMessage message={error} onRetry={onRegenerate ?? undefined} />
        ) : hasContent ? (
          <>
            {editing ? (
              <Textarea
                aria-label={`${title} (editable)`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={monospaceEdit ? "min-h-80 font-mono text-sm" : "min-h-80 text-sm"}
              />
            ) : (
              <div className="max-w-full overflow-x-auto break-words">
                <MarkdownView content={value} />
              </div>
            )}
            {extraActions ? <div className="flex flex-wrap gap-2 border-t border-border pt-4">{extraActions}</div> : null}
            <AiDisclaimer />
          </>
        ) : (
          emptyState
        )}
      </div>
    </section>
  );
}
