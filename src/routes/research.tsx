import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Save, Search, ShieldAlert, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AiDisclaimer, PRIVACY_NOTICE } from "@/components/ai-disclaimer";
import { AiOutputPanel } from "@/components/ai-output-panel";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { runResearch } from "@/lib/ai.functions";
import { actions, useAppState } from "@/lib/store";
import { useAiTask } from "@/lib/use-ai-task";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Assistant — WorkFlow AI" },
      {
        name: "description",
        content:
          "Generate structured workplace research briefings with clear facts, assumptions, and actionable next steps.",
      },
      { property: "og:title", content: "Research Assistant — WorkFlow AI" },
      { property: "og:description", content: "Structured workplace research briefings with next steps." },
    ],
  }),
  component: ResearchPage,
});

const DEPTHS = ["Quick Overview", "Standard", "Detailed"];

const VERIFICATION_WARNING =
  "This briefing is generated from the AI's general knowledge only — it has no live internet access. Verify every figure, name, date, source and recommendation independently before relying on it for a workplace decision.";

type Verification = { kind: "Likely" | "Assumption" | "Not specified" | "Verify"; detail: string };

function extractVerificationItems(output: string): Verification[] {
  const items: Verification[] = [];
  const lines = output.split("\n");
  for (const rawLine of lines) {
    const line = rawLine.replace(/^[-*\d.)\s]+/, "").trim();
    if (!line) continue;
    if (/^assumption:/i.test(line)) items.push({ kind: "Assumption", detail: line.replace(/^assumption:\s*/i, "") });
    else if (/^likely:/i.test(line)) items.push({ kind: "Likely", detail: line.replace(/^likely:\s*/i, "") });
    else if (/not specified/i.test(line)) items.push({ kind: "Not specified", detail: line });
    else if (/^(verify|look up|confirm)\b/i.test(line))
      items.push({ kind: "Verify", detail: line.replace(/^verify:\s*/i, "") });
  }
  return items.slice(0, 12);
}

const KIND_STYLE: Record<Verification["kind"], string> = {
  Assumption: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Likely: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "Not specified": "border-border bg-muted/50 text-muted-foreground",
  Verify: "border-destructive/30 bg-destructive/10 text-destructive",
};

function ResearchPage() {
  const defaultDepth = useAppState((s) => s.settings.defaultDepth);
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [depth, setDepth] = useState(defaultDepth || "Standard");
  const [output, setOutput] = useState("");

  const fn = useServerFn(runResearch);
  const { run, isLoading, error, setError } = useAiTask(
    (data: { topic: string; context: string; depth: string }) => fn({ data }),
  );

  const generate = async () => {
    if (!topic.trim()) {
      setError("Please enter a research topic before generating a briefing.");
      toast.error("Add a research topic first.");
      return;
    }
    const text = await run({ topic, context, depth });
    if (text) {
      setOutput(text);
      actions.logActivity("research", "Research briefing generated");
    }
  };

  const verification = useMemo(() => (output ? extractVerificationItems(output) : []), [output]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Research Assistant"
        description="Generate structured workplace research briefings with clear facts, assumptions, and actionable next steps."
      />

      <Card className="border-border shadow-card">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="topic">Research Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Choosing between hybrid and fully remote work for our support team"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <div className="space-y-2">
              <Label htmlFor="context">Additional Context (optional)</Label>
              <Textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="min-h-20"
                placeholder="Your goal, constraints, industry or anything that should shape the briefing."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depth">Depth</Label>
              <Select value={depth} onValueChange={setDepth}>
                <SelectTrigger id="depth">
                  <SelectValue placeholder="Select a depth" />
                </SelectTrigger>
                <SelectContent>
                  {DEPTHS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={generate} disabled={isLoading} size="lg">
              <Sparkles className="size-4" aria-hidden="true" />
              {isLoading ? "Researching…" : "Generate Briefing"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setTopic("");
                setContext("");
                setOutput("");
                setError(null);
              }}
            >
              Clear form
            </Button>
          </div>

          <AiDisclaimer text={PRIVACY_NOTICE} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {verification.length > 0 && !isLoading ? (
          <div
            role="alert"
            className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4 sm:p-5"
          >
            <p className="flex items-start gap-2 text-sm font-medium text-foreground">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <span>Verification needed — {verification.length} item{verification.length === 1 ? "" : "s"} in this briefing should be checked before use.</span>
            </p>
            <p className="mt-1 pl-6 text-xs text-muted-foreground">{VERIFICATION_WARNING}</p>
            <ul className="mt-3 space-y-1.5 pl-6">
              {verification.map((v, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span
                    className={`mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${KIND_STYLE[v.kind]}`}
                  >
                    {v.kind}
                  </span>
                  <span className="text-muted-foreground">{v.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <AiOutputPanel
          title="Research Briefing"
          value={output}
          onChange={setOutput}
          onRegenerate={generate}
          onClear={() => setOutput("")}
          isLoading={isLoading}
          error={error}
          loadingLabel="Preparing your research briefing…"
          monospaceEdit={false}
          emptyState={
            <EmptyState
              icon={Search}
              title="Your research briefing will appear here."
              description="Enter a topic above, choose a depth and select Generate Briefing."
            />
          }
          extraActions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                actions.saveItem("research", topic || "Saved research briefing", output);
                toast.success("Briefing saved to your workspace");
              }}
            >
              <Save className="size-4" aria-hidden="true" /> Save briefing
            </Button>
          }
        />
      </div>
    </div>
  );
}
