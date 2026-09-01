import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Bot,
  Brain,
  CheckCircle2,
  ClipboardList,
  ListChecks,
  PenLine,
  Save,
  Sparkles,
  Target,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AiDisclaimer, PRIVACY_NOTICE } from "@/components/ai-disclaimer";
import { AiOutputPanel } from "@/components/ai-output-panel";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { draftAction, planFromUnderstanding, understandCapture } from "@/lib/ai.functions";
import { actions, useAppState, type Priority, type Task, type TaskStatus } from "@/lib/store";
import { useAiTask } from "@/lib/use-ai-task";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Workplace Assistant — WorkFlow AI" },
      {
        name: "description",
        content:
          "Run the Capture → Understand → Plan → Act → Track workflow: turn messy notes into a structured plan, a ready-to-send draft, and tracked tasks.",
      },
      { property: "og:title", content: "AI Workplace Assistant — WorkFlow AI" },
      {
        property: "og:description",
        content: "Capture, understand, plan, act and track your work in one guided AI workflow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistantPage,
});

const SAMPLE_CAPTURE = `Client (Nala from Orbit Retail) emailed: unhappy that the analytics dashboard rollout slipped again.
They want a revised timeline and a call this week.
Internally: Thabo still owes the data mapping, Lerato is on leave until Thursday.
Contract renewal conversation is scheduled for the 20th, so this needs to be settled before then.
I also promised them a summary of what changed since the last plan.`;

const ACTION_TYPES = [
  "Email",
  "Slack / chat message",
  "Meeting agenda",
  "Status update",
  "Project brief",
] as const;

const TONES = ["Professional", "Friendly", "Direct", "Empathetic", "Formal"] as const;

const STAGES = [
  { key: "capture", label: "Capture", icon: ClipboardList },
  { key: "understand", label: "Understand", icon: Brain },
  { key: "plan", label: "Plan", icon: Target },
  { key: "act", label: "Act", icon: PenLine },
  { key: "track", label: "Track", icon: ListChecks },
] as const;

function parsePlanActionItems(markdown: string) {
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
    const rawDeadline = content.match(/Deadline:\s*([^|]+)/i)?.[1]?.trim() ?? "";
    const priority = content.match(/Priority:\s*(High|Medium|Low)/i)?.[1] as Priority | undefined;
    items.push({
      title,
      deadline: rawDeadline.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? "",
      priority: priority ?? "Medium",
    });
  });

  return items;
}

function StageRail({ done }: { done: Record<string, boolean> }) {
  return (
    <ol className="flex flex-wrap items-center gap-2" aria-label="Workflow progress">
      {STAGES.map((stage, index) => {
        const complete = done[stage.key];
        const Icon = complete ? CheckCircle2 : stage.icon;
        return (
          <li key={stage.key} className="flex items-center gap-2">
            <span
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                complete
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {index + 1}. {stage.label}
            </span>
            {index < STAGES.length - 1 ? (
              <span className="hidden h-px w-4 bg-border sm:block" aria-hidden="true" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function TrackRow({ task }: { task: Task }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div className="min-w-0">
        <p className={`truncate text-sm font-medium ${task.status === "Completed" ? "line-through opacity-60" : ""}`}>
          {task.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {task.deadline ? `Due ${task.deadline}` : "No deadline"} · {task.priority} priority
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={task.status === "Completed" ? "secondary" : "outline"}>{task.status}</Badge>
        <Select
          value={task.status}
          onValueChange={(value) => actions.updateTask(task.id, { status: value as TaskStatus })}
        >
          <SelectTrigger className="w-40" aria-label={`Status for ${task.title}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Not Started">Not Started</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function AssistantPage() {
  const [goal, setGoal] = useState("");
  const [capture, setCapture] = useState("");
  const [understanding, setUnderstanding] = useState("");
  const [plan, setPlan] = useState("");
  const [draft, setDraft] = useState("");
  const [actionType, setActionType] = useState<string>("Email");
  const [tone, setTone] = useState<string>("Professional");
  const [trackedIds, setTrackedIds] = useState<string[]>([]);

  const tasks = useAppState((s) => s.tasks);
  const tracked = tasks.filter((t) => trackedIds.includes(t.id));

  const understandFn = useServerFn(understandCapture);
  const planFn = useServerFn(planFromUnderstanding);
  const actFn = useServerFn(draftAction);

  const understandTask = useAiTask((data: { capture: string; goal: string }) => understandFn({ data }));
  const planTask = useAiTask((data: { capture: string; understanding: string; goal: string }) => planFn({ data }));
  const actTask = useAiTask(
    (data: { understanding: string; plan: string; actionType: string; tone: string }) => actFn({ data }),
  );

  const runUnderstand = async () => {
    if (!capture.trim()) {
      understandTask.setError("Capture something first — notes, an email, or a request.");
      toast.error("Nothing captured yet.");
      return;
    }
    const text = await understandTask.run({ capture, goal });
    if (text) {
      setUnderstanding(text);
      actions.logActivity("chat", "Situation analysed by the assistant");
    }
  };

  const runPlan = async () => {
    if (!understanding.trim()) {
      toast.error("Run the Understand step first.");
      return;
    }
    const text = await planTask.run({ capture, understanding, goal });
    if (text) {
      setPlan(text);
      actions.logActivity("plan", "Action plan generated by the assistant");
    }
  };

  const runAct = async () => {
    if (!plan.trim()) {
      toast.error("Generate a plan first.");
      return;
    }
    const text = await actTask.run({ understanding, plan, actionType, tone });
    if (text) {
      setDraft(text);
      actions.logActivity("chat", `${actionType} drafted by the assistant`);
    }
  };

  const trackPlan = () => {
    const items = parsePlanActionItems(plan);
    if (items.length === 0) {
      toast.error("No action items were found in the plan.");
      return;
    }
    const before = new Set(tasks.map((t) => t.id));
    actions.addTasks(
      items.map((item) => ({
        title: item.title,
        deadline: item.deadline,
        duration: "",
        priority: item.priority,
        status: "Not Started" as const,
      })),
    );
    // Newly created tasks are the ones not present before this call.
    setTimeout(() => {
      const created = actions.__none;
      void created;
    }, 0);
    setTrackedIds((prev) => [...prev, ...Array.from(before).slice(0, 0)]);
    toast.success(`${items.length} task${items.length === 1 ? "" : "s"} now tracked`);
    actions.logActivity("plan", "Plan items moved into tracking");
  };

  const reset = () => {
    setGoal("");
    setCapture("");
    setUnderstanding("");
    setPlan("");
    setDraft("");
    setTrackedIds([]);
    understandTask.setError(null);
    planTask.setError(null);
    actTask.setError(null);
  };

  const done = {
    capture: capture.trim().length > 0,
    understand: understanding.trim().length > 0,
    plan: plan.trim().length > 0,
    act: draft.trim().length > 0,
    track: tracked.length > 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Workplace Assistant"
        description="One guided workflow: capture the mess, understand the situation, plan the work, draft the action, then track it to done."
        actions={
          <Button variant="outline" onClick={reset}>
            Start over
          </Button>
        }
      />

      <StageRail done={done} />

      {/* 1 — Capture */}
      <Card className="border-border shadow-card">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-semibold">1. Capture</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">What outcome do you want? (optional)</Label>
            <Input
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Keep the client confident and agree a new timeline"
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="capture">Capture anything — notes, an email, a request</Label>
              <Button variant="ghost" size="sm" onClick={() => setCapture(SAMPLE_CAPTURE)}>
                Use sample
              </Button>
            </div>
            <Textarea
              id="capture"
              value={capture}
              onChange={(e) => setCapture(e.target.value)}
              className="min-h-48"
              placeholder="Paste or type the raw situation here..."
            />
          </div>

          <Button size="lg" onClick={runUnderstand} disabled={understandTask.isLoading}>
            <Sparkles className="size-4" aria-hidden="true" />
            {understandTask.isLoading ? "Analysing…" : "Understand this"}
          </Button>

          <AiDisclaimer text={PRIVACY_NOTICE} />
        </CardContent>
      </Card>

      {/* 2 — Understand */}
      <AiOutputPanel
        title="2. Understand — situation analysis"
        value={understanding}
        onChange={setUnderstanding}
        onRegenerate={runUnderstand}
        onClear={() => setUnderstanding("")}
        isLoading={understandTask.isLoading}
        error={understandTask.error}
        loadingLabel="Working out what is really going on…"
        emptyState={
          <EmptyState
            icon={Brain}
            title="Capture something above, then run Understand."
            description="Facts, stakeholders and constraints are extracted from your text only — anything missing is marked “Not specified”."
          />
        }
        extraActions={
          <Button size="sm" onClick={runPlan} disabled={planTask.isLoading}>
            <Target className="size-4" aria-hidden="true" />
            {planTask.isLoading ? "Planning…" : "Build the plan"}
          </Button>
        }
      />

      {/* 3 — Plan */}
      <AiOutputPanel
        title="3. Plan — prioritised action plan"
        value={plan}
        onChange={setPlan}
        onRegenerate={runPlan}
        onClear={() => setPlan("")}
        isLoading={planTask.isLoading}
        error={planTask.error}
        loadingLabel="Prioritising the work…"
        emptyState={
          <EmptyState
            icon={Target}
            title="Run Understand first, then build the plan."
            description="You get prioritised action items with owners, deadlines, risks and an immediate next step."
          />
        }
        extraActions={
          <>
            <Button size="sm" onClick={runAct} disabled={actTask.isLoading}>
              <PenLine className="size-4" aria-hidden="true" />
              {actTask.isLoading ? "Drafting…" : `Draft the ${actionType.toLowerCase()}`}
            </Button>
            <Button variant="outline" size="sm" onClick={trackPlan}>
              <ListChecks className="size-4" aria-hidden="true" /> Track action items
            </Button>
          </>
        }
      />

      {/* 4 — Act */}
      <Card className="border-border shadow-card">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <PenLine className="size-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-semibold">4. Act — choose your deliverable</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="action-type">Deliverable</Label>
              <Select value={actionType} onValueChange={setActionType}>
                <SelectTrigger id="action-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="action-tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="action-tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={runAct} disabled={actTask.isLoading}>
            <Sparkles className="size-4" aria-hidden="true" />
            {actTask.isLoading ? "Drafting…" : "Draft it"}
          </Button>
        </CardContent>
      </Card>

      <AiOutputPanel
        title={`Draft — ${actionType}`}
        value={draft}
        onChange={setDraft}
        onRegenerate={runAct}
        onClear={() => setDraft("")}
        isLoading={actTask.isLoading}
        error={actTask.error}
        loadingLabel="Writing your draft…"
        emptyState={
          <EmptyState
            icon={Bot}
            title="Build a plan, then draft the deliverable."
            description="Everything is editable before you use it — nothing is ever sent for you."
          />
        }
        extraActions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              actions.saveItem("email", goal || `${actionType} draft`, draft);
              toast.success("Draft saved to your workspace");
            }}
          >
            <Save className="size-4" aria-hidden="true" /> Save draft
          </Button>
        }
      />

      {/* 5 — Track */}
      <Card className="border-border shadow-card">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ListChecks className="size-4 text-primary" aria-hidden="true" />
              <h2 className="text-sm font-semibold">5. Track</h2>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/planner">Open full planner</Link>
            </Button>
          </div>

          {tracked.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="Nothing tracked from this workflow yet."
              description="Use “Track action items” on the plan to move its items into your planner and follow them here."
            />
          ) : (
            <div className="space-y-2">
              {tracked.map((task) => (
                <TrackRow key={task.id} task={task} />
              ))}
              <p className="pt-1 text-xs text-muted-foreground">
                {tracked.filter((t) => t.status === "Completed").length} of {tracked.length} complete.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
