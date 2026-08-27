import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock, ClipboardList, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AiDisclaimer } from "@/components/ai-disclaimer";
import { AiOutputPanel } from "@/components/ai-output-panel";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generatePlan } from "@/lib/ai.functions";
import { actions, useAppState, type Priority, type Task, type TaskStatus } from "@/lib/store";
import { useAiTask } from "@/lib/use-ai-task";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — WorkFlow AI" },
      {
        name: "description",
        content:
          "Add your tasks, deadlines and available hours, and let AI build a realistic prioritised daily or weekly schedule.",
      },
      { property: "og:title", content: "AI Task Planner — WorkFlow AI" },
      { property: "og:description", content: "Realistic, prioritised daily and weekly schedules built by AI." },
    ],
  }),
  component: PlannerPage,
});

const PRIORITIES: Priority[] = ["High", "Medium", "Low"];
const STATUSES: TaskStatus[] = ["Not Started", "In Progress", "Completed"];

function statusBadge(status: TaskStatus) {
  if (status === "Completed") return <Badge className="bg-success text-success-foreground">Completed</Badge>;
  if (status === "In Progress") return <Badge className="bg-info text-info-foreground">In Progress</Badge>;
  return <Badge variant="outline">Not Started</Badge>;
}

function priorityBadge(priority: Priority) {
  if (priority === "High") return <Badge className="bg-destructive text-destructive-foreground">High</Badge>;
  if (priority === "Medium") return <Badge className="bg-warning text-warning-foreground">Medium</Badge>;
  return <Badge variant="secondary">Low</Badge>;
}

function TaskRow({ task }: { task: Task }) {
  const [editing, setEditing] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const overdue = task.deadline && task.deadline < today && task.status !== "Completed";

  return (
    <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="grid gap-2 sm:grid-cols-3">
            <Input
              aria-label="Task name"
              value={task.title}
              onChange={(e) => actions.updateTask(task.id, { title: e.target.value })}
            />
            <Input
              aria-label="Deadline"
              type="date"
              value={task.deadline}
              onChange={(e) => actions.updateTask(task.id, { deadline: e.target.value })}
            />
            <Input
              aria-label="Estimated duration in minutes"
              type="number"
              min={0}
              value={task.duration}
              onChange={(e) => actions.updateTask(task.id, { duration: e.target.value })}
            />
          </div>
        ) : (
          <>
            <p className={`truncate text-sm font-medium ${task.status === "Completed" ? "line-through opacity-60" : ""}`}>
              {task.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {task.deadline ? `Due ${task.deadline}` : "No deadline"}
              {task.duration ? ` · ${task.duration} min` : ""}
              {overdue ? " · overdue" : ""}
            </p>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {priorityBadge(task.priority)}
        {statusBadge(task.status)}
        <Select value={task.status} onValueChange={(v) => actions.updateTask(task.id, { status: v as TaskStatus })}>
          <SelectTrigger className="h-9 w-[150px]" aria-label={`Status for ${task.title}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => setEditing((e) => !e)}>
          {editing ? "Done" : "Edit"}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Delete ${task.title}`}
          onClick={() => actions.deleteTask(task.id)}
        >
          <Trash2 className="size-4 text-destructive" aria-hidden="true" />
        </Button>
      </div>
    </li>
  );
}

function PlannerPage() {
  const tasks = useAppState((s) => s.tasks);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [duration, setDuration] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [hours, setHours] = useState("8");
  const [planDate, setPlanDate] = useState(new Date().toISOString().slice(0, 10));
  const [planType, setPlanType] = useState("Daily Plan");
  const [output, setOutput] = useState("");

  const fn = useServerFn(generatePlan);
  const { run, isLoading, error, setError } = useAiTask(
    (data: { tasks: string; availableHours: string; planningDate: string; planType: string }) => fn({ data }),
  );

  const addTask = () => {
    if (!title.trim()) {
      toast.error("Add a task name first.");
      return;
    }
    actions.addTask({ title: title.trim(), deadline, duration, priority, status: "Not Started" });
    setTitle("");
    setDeadline("");
    setDuration("");
    setPriority("Medium");
    toast.success("Task added");
  };

  const generate = async () => {
    const open = tasks.filter((t) => t.status !== "Completed");
    if (open.length === 0) {
      setError("Add at least one open task before generating a plan.");
      toast.error("No open tasks to plan.");
      return;
    }
    const list = open
      .map(
        (t) =>
          `- Task: ${t.title} | Deadline: ${t.deadline || "Not specified"} | Estimated duration: ${
            t.duration ? `${t.duration} minutes` : "Not specified"
          } | Importance: ${t.priority} | Current status: ${t.status}`,
      )
      .join("\n");
    const text = await run({
      tasks: list,
      availableHours: hours ? `${hours} hours` : "",
      planningDate: planDate,
      planType,
    });
    if (text) {
      setOutput(text);
      actions.logActivity("plan", planType === "Daily Plan" ? "Daily schedule created" : "Weekly schedule created");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Task Planner"
        description="Capture your tasks, set your available hours and generate a realistic, prioritised schedule you can actually follow."
      />

      <Card className="border-border shadow-card">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Add a task</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2 xl:col-span-2">
              <Label htmlFor="task-title">Task</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Prepare quarterly marketing report"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-deadline">Deadline</Label>
              <Input id="task-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-duration">Estimated Duration (min)</Label>
              <Input
                id="task-duration"
                type="number"
                min={0}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-priority">Importance</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger id="task-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={addTask} className="w-full sm:w-auto">
                <Plus className="size-4" aria-hidden="true" /> Add task
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="your-tasks">
        <h2 id="your-tasks" className="mb-3 text-lg font-semibold">
          Your tasks
        </h2>
        {tasks.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No tasks yet." description="Add your first task to start planning your day." />
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-card">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </ul>
        )}
      </section>

      <Card className="border-border shadow-card">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Planning preferences</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="hours">Available Working Hours</Label>
              <Input id="hours" type="number" min={1} max={16} value={hours} onChange={(e) => setHours(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-date">Planning Date</Label>
              <Input id="plan-date" type="date" value={planDate} onChange={(e) => setPlanDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-type">Plan Type</Label>
              <Select value={planType} onValueChange={setPlanType}>
                <SelectTrigger id="plan-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily Plan">Daily Plan</SelectItem>
                  <SelectItem value="Weekly Plan">Weekly Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button size="lg" onClick={generate} disabled={isLoading}>
            <Sparkles className="size-4" aria-hidden="true" />
            {isLoading ? "Building your plan…" : "Generate My Plan"}
          </Button>
          <AiDisclaimer />
        </CardContent>
      </Card>

      <AiOutputPanel
        title="Your Schedule"
        value={output}
        onChange={setOutput}
        onRegenerate={generate}
        onClear={() => setOutput("")}
        isLoading={isLoading}
        error={error}
        loadingLabel="Prioritising your tasks…"
        emptyState={
          <EmptyState
            icon={CalendarClock}
            title="Your AI schedule will appear here."
            description="Add tasks above, set your available hours and select Generate My Plan."
          />
        }
        extraActions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              actions.saveItem("plan", `${planType} — ${planDate}`, output);
              toast.success("Plan saved to your workspace");
            }}
          >
            <Save className="size-4" aria-hidden="true" /> Save plan
          </Button>
        }
      />
    </div>
  );
}
