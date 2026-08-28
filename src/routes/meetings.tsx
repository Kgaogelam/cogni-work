import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ListChecks, NotebookPen, Save, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AiDisclaimer, PRIVACY_NOTICE } from "@/components/ai-disclaimer";
import { AiOutputPanel } from "@/components/ai-output-panel";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { summariseMeeting } from "@/lib/ai.functions";
import { actions, type Priority } from "@/lib/store";
import { useAiTask } from "@/lib/use-ai-task";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — WorkFlow AI" },
      {
        name: "description",
        content:
          "Turn raw meeting notes into a structured summary with decisions, action items, owners and deadlines — nothing invented.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — WorkFlow AI" },
      { property: "og:description", content: "Structured meeting summaries with decisions and action items." },
    ],
  }),
  component: MeetingsPage,
});

const SAMPLE_NOTES = `Weekly marketing sync - 12 attendees, 45 min.
Thabo presented Q3 campaign results: leads up 18%, cost per lead down slightly.
Agreed to move the product launch email to the 14th because creative is not signed off.
Lerato will finalise the launch creative by Friday.
Decision: we will not run paid ads on LinkedIn this quarter, budget goes to search.
Someone needs to update the reporting dashboard - not assigned yet.
Next sync same time next week. Budget sign-off deadline is the 20th.`;

function parseActionItems(markdown: string) {
  const section = markdown.split(/##\s*Action Items/i)[1];
  if (!section) return [];
  const body = section.split(/\n##\s/)[0] ?? "";
  const items: Array<{ title: string; deadline: string; priority: Priority }> = [];

  body.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!/^[-*•]|^\d+\./.test(trimmed)) return;
    const content = trimmed.replace(/^[-*•]\s*|^\d+\.\s*/, "");
    if (!content) return;
    const titleMatch = content.match(/\*\*(.+?)\*\*/);
    const rawTitle = titleMatch?.[1]?.trim() ?? content.split(/—|\||-\s/)[0] ?? "";
    const title = rawTitle.trim();
    if (!title || /^not specified$/i.test(title)) return;
    const deadlineMatch = content.match(/Deadline:\s*([^|]+)/i);
    const priorityMatch = content.match(/Priority:\s*(High|Medium|Low)/i);
    const rawDeadline = deadlineMatch?.[1]?.trim() ?? "";
    const isoDeadline = rawDeadline.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? "";
    items.push({
      title,
      deadline: isoDeadline,
      priority: (priorityMatch?.[1] as Priority) ?? "Medium",
    });
  });

  return items;
}

function MeetingsPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");

  const fn = useServerFn(summariseMeeting);
  const { run, isLoading, error, setError } = useAiTask((data: { title: string; notes: string }) => fn({ data }));

  const summarise = async () => {
    if (!notes.trim()) {
      setError("Please paste your meeting notes before summarising.");
      toast.error("Meeting notes are required.");
      return;
    }
    const text = await run({ title, notes });
    if (text) {
      setOutput(text);
      actions.logActivity("meeting", "Meeting notes summarised");
    }
  };

  const createTasks = () => {
    const items = parseActionItems(output);
    if (items.length === 0) {
      toast.error("No action items were found in this summary.");
      return;
    }
    actions.addTasks(
      items.map((item) => ({
        title: item.title,
        deadline: item.deadline,
        duration: "",
        priority: item.priority,
        status: "Not Started" as const,
      })),
    );
    toast.success(`${items.length} task${items.length === 1 ? "" : "s"} added to your planner`);
    navigate({ to: "/planner" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meeting Notes Summarizer"
        description="Paste raw meeting notes and get a structured summary with decisions, action items, owners and deadlines."
      />

      <Card className="border-border shadow-card">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="meeting-title">Meeting Title (optional)</Label>
            <Input
              id="meeting-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekly marketing sync"
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="notes">Meeting Notes</Label>
              <Button variant="ghost" size="sm" onClick={() => setNotes(SAMPLE_NOTES)}>
                Use sample notes
              </Button>
            </div>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-56"
              placeholder="Paste your meeting notes here..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={summarise} disabled={isLoading}>
              <Sparkles className="size-4" aria-hidden="true" />
              {isLoading ? "Summarising…" : "Summarise Meeting"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setNotes("");
                setTitle("");
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

      <AiOutputPanel
        title="Meeting Summary"
        value={output}
        onChange={setOutput}
        onRegenerate={summarise}
        onClear={() => setOutput("")}
        isLoading={isLoading}
        error={error}
        loadingLabel="Analysing your meeting notes…"
        emptyState={
          <EmptyState
            icon={NotebookPen}
            title="Paste your meeting notes above to generate a structured summary."
            description="Owners and deadlines that are not stated in your notes are marked “Not specified” — never invented."
          />
        }
        extraActions={
          <>
            <Button size="sm" onClick={createTasks}>
              <ListChecks className="size-4" aria-hidden="true" /> Create Tasks from Action Items
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                actions.saveItem("meeting", title || "Meeting summary", output);
                toast.success("Summary saved to your workspace");
              }}
            >
              <Save className="size-4" aria-hidden="true" /> Save summary
            </Button>
          </>
        }
      />
    </div>
  );
}
