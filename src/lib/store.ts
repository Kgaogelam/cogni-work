import { useCallback, useSyncExternalStore } from "react";

export type TaskStatus = "Not Started" | "In Progress" | "Completed";
export type Priority = "High" | "Medium" | "Low";

export type Task = {
  id: string;
  title: string;
  deadline: string;
  duration: string;
  priority: Priority;
  status: TaskStatus;
  createdAt: number;
};

export type ActivityKind = "email" | "meeting" | "plan" | "research" | "chat";

export type Activity = {
  id: string;
  kind: ActivityKind;
  label: string;
  at: number;
};

export type SavedItem = {
  id: string;
  kind: Exclude<ActivityKind, "chat">;
  title: string;
  content: string;
  at: number;
};

export type Settings = {
  name: string;
  role: string;
  defaultTone: string;
  defaultDepth: string;
  showDisclaimers: boolean;
};

export type AppState = {
  tasks: Task[];
  activity: Activity[];
  saved: SavedItem[];
  settings: Settings;
};

const KEY = "workflow-ai-state-v1";

export const uid = () => Math.random().toString(36).slice(2, 10);

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function seed(): AppState {
  const now = Date.now();
  return {
    tasks: [
      {
        id: uid(),
        title: "Prepare quarterly marketing report",
        deadline: daysFromNow(1),
        duration: "120",
        priority: "High",
        status: "In Progress",
        createdAt: now,
      },
      {
        id: uid(),
        title: "Reply to client proposal",
        deadline: daysFromNow(0),
        duration: "30",
        priority: "High",
        status: "Not Started",
        createdAt: now,
      },
      {
        id: uid(),
        title: "Attend team meeting",
        deadline: daysFromNow(0),
        duration: "60",
        priority: "Medium",
        status: "Not Started",
        createdAt: now,
      },
      {
        id: uid(),
        title: "Complete project presentation",
        deadline: daysFromNow(3),
        duration: "90",
        priority: "Medium",
        status: "Not Started",
        createdAt: now,
      },
      {
        id: uid(),
        title: "Review campaign performance",
        deadline: daysFromNow(-1),
        duration: "45",
        priority: "Low",
        status: "Completed",
        createdAt: now,
      },
    ],
    activity: [
      { id: uid(), kind: "meeting", label: "Meeting notes summarised", at: now - 1000 * 60 * 42 },
      { id: uid(), kind: "email", label: "Email generated", at: now - 1000 * 60 * 130 },
      { id: uid(), kind: "plan", label: "Daily schedule created", at: now - 1000 * 60 * 300 },
    ],
    saved: [],
    settings: {
      name: "Kgaogelo",
      role: "Product Manager",
      defaultTone: "Professional",
      defaultDepth: "Standard",
      showDisclaimers: true,
    },
  };
}

let state: AppState = seed();
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      state = {
        tasks: parsed.tasks ?? state.tasks,
        activity: parsed.activity ?? state.activity,
        saved: parsed.saved ?? state.saved,
        settings: { ...state.settings, ...(parsed.settings ?? {}) },
      };
    } else {
      persist();
    }
  } catch {
    /* ignore corrupt state */
  }
  emit();
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function set(updater: (prev: AppState) => AppState) {
  state = updater(state);
  persist();
  emit();
}

const serverSnapshot = seed();

export function useAppState<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    useCallback(() => selector(state), [selector]),
    useCallback(() => selector(serverSnapshot), [selector]),
  );
}

export const actions = {
  addTask(task: Omit<Task, "id" | "createdAt">) {
    set((s) => ({ ...s, tasks: [{ ...task, id: uid(), createdAt: Date.now() }, ...s.tasks] }));
  },
  addTasks(tasks: Array<Omit<Task, "id" | "createdAt">>) {
    const created = tasks.map((t) => ({ ...t, id: uid(), createdAt: Date.now() }));
    set((s) => ({ ...s, tasks: [...created, ...s.tasks] }));
    return created.map((t) => t.id);
  },
  updateTask(id: string, patch: Partial<Task>) {
    set((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  },
  deleteTask(id: string) {
    set((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  },
  logActivity(kind: ActivityKind, label: string) {
    set((s) => ({
      ...s,
      activity: [{ id: uid(), kind, label, at: Date.now() }, ...s.activity].slice(0, 25),
    }));
  },
  saveItem(kind: SavedItem["kind"], title: string, content: string) {
    set((s) => ({
      ...s,
      saved: [{ id: uid(), kind, title, content, at: Date.now() }, ...s.saved].slice(0, 50),
    }));
  },
  deleteSaved(id: string) {
    set((s) => ({ ...s, saved: s.saved.filter((i) => i.id !== id) }));
  },
  updateSettings(patch: Partial<Settings>) {
    set((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  },
  clearActivity() {
    set((s) => ({ ...s, activity: [] }));
  },
  clearAll() {
    set(() => ({ tasks: [], activity: [], saved: [], settings: state.settings }));
  },
  resetDemoData() {
    set(() => seed());
  },
};

export function timeAgo(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} d ago`;
}
