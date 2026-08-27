import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity as ActivityIcon,
  AlertTriangle,
  Bot,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Mail,
  NotebookPen,
  Search,
  Sparkles,
} from "lucide-react";

import { AiDisclaimer } from "@/components/ai-disclaimer";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { timeAgo, useAppState, type Task } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — WorkFlow AI" },
      {
        name: "description",
        content:
          "Your workplace productivity dashboard: pending tasks, priorities, quick AI actions and recent AI activity in one place.",
      },
      { property: "og:title", content: "Dashboard — WorkFlow AI" },
      { property: "og:description", content: "Track tasks, priorities and AI activity in one workspace." },
    ],
  }),
  component: Dashboard,
});

const QUICK_ACTIONS = [
  { to: "/email", label: "Generate an Email", icon: Mail, hint: "Draft professional emails in seconds" },
  { to: "/meetings", label: "Summarise Meeting Notes", icon: NotebookPen, hint: "Decisions, actions and deadlines" },
  { to: "/planner", label: "Plan My Day", icon: CalendarClock, hint: "A realistic, prioritised schedule" },
  { to: "/research", label: "Research a Topic", icon: Search, hint: "Structured briefings for decisions" },
  { to: "/assistant", label: "Ask AI", icon: Bot, hint: "Your workplace productivity chat" },
] as const;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Mail;
  tone: "primary" | "success" | "warning" | "info";
}) {
  const toneClass = {
    primary: "bg-accent text-accent-foreground",
    success: "bg-success/12 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    info: "bg-info/12 text-info",
  }[tone];

  return (
    <Card className="border-border shadow-card">
      <CardContent className="flex items-center gap-4 p-5">
        <span className={`flex size-11 items-center justify-center rounded-xl ${toneClass}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-2xl font-semibold tabular-nums">{value}</span>
          <span className="block text-sm text-muted-foreground">{label}</span>
        </span>
      </CardContent>
    </Card>
  );
}

function priorityBadge(task: Task) {
  if (task.priority === "High") return <Badge className="bg-destructive text-destructive-foreground">High</Badge>;
  if (task.priority === "Medium") return <Badge className="bg-warning text-warning-foreground">Medium</Badge>;
  return <Badge variant="secondary">Low</Badge>;
}

function Dashboard() {
  const tasks = useAppState((s) => s.tasks);
  const activity = useAppState((s) => s.activity);
  const settings = useAppState((s) => s.settings);

  const pending = tasks.filter((t) => t.status !== "Completed");
  const completed = tasks.filter((t) => t.status === "Completed");
  const highPriority = pending.filter((t) => t.priority === "High");
  const today = new Date().toISOString().slice(0, 10);

  const priorities = [...pending]
    .sort((a, b) => {
      const rank = { High: 0, Medium: 1, Low: 2 } as const;
      if (rank[a.priority] !== rank[b.priority]) return rank[a.priority] - rank[b.priority];
      return (a.deadline || "9999").localeCompare(b.deadline || "9999");
    })
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-primary">{greeting()}{settings.name ? `, ${settings.name}` : ""}!</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Let's get your work organised.</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Use AI to manage workplace communication, meetings, tasks, research and everyday productivity.
        </p>
      </header>

      <section aria-label="Productivity overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's Tasks" value={pending.length} icon={ClipboardList} tone="primary" />
        <StatCard label="Completed" value={completed.length} icon={CheckCircle2} tone="success" />
        <StatCard label="High Priority" value={highPriority.length} icon={AlertTriangle} tone="warning" />
        <StatCard label="AI Actions" value={activity.length} icon={Sparkles} tone="info" />
      </section>

      <section aria-labelledby="quick-actions">
        <h2 id="quick-actions" className="mb-3 text-lg font-semibold">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {QUICK_ACTIONS.map(({ to, label, icon: Icon, hint }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-card transition-colors hover:border-primary/40 hover:bg-accent/50"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4.5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{label}</span>
                <span className="block text-xs text-muted-foreground">{hint}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <section aria-labelledby="priorities" className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="priorities" className="text-lg font-semibold">
              Today's Priorities
            </h2>
            <Link to="/planner" className="text-sm font-medium text-primary hover:underline">
              Open planner
            </Link>
          </div>
          {priorities.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No tasks yet."
              description="Add your first task to start planning your day."
            />
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-card">
              {priorities.map((task) => (
                <li key={task.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{task.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {task.deadline
                        ? `Due ${task.deadline}${task.deadline < today ? " · overdue" : task.deadline === today ? " · today" : ""}`
                        : "No deadline"}
                      {task.duration ? ` · ${task.duration} min` : ""}
                    </span>
                  </span>
                  {priorityBadge(task)}
                  <Badge variant="outline" className="text-muted-foreground">
                    {task.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="recent-activity" className="lg:col-span-2">
          <h2 id="recent-activity" className="mb-3 text-lg font-semibold">
            Recent AI Activity
          </h2>
          {activity.length === 0 ? (
            <EmptyState icon={ActivityIcon} title="No recent AI activity." description="Your AI actions will appear here." />
          ) : (
            <ul className="space-y-2.5 rounded-xl border border-border bg-card p-4 shadow-card">
              {activity.slice(0, 6).map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{item.label}</span>
                    <span className="block text-xs text-muted-foreground">{timeAgo(item.at)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <AiDisclaimer />
    </div>
  );
}
