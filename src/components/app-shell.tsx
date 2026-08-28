import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bot,
  CalendarClock,
  LayoutDashboard,
  Mail,
  Menu,
  NotebookPen,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Smart Email", icon: Mail },
  { to: "/meetings", label: "Meeting Summarizer", icon: NotebookPen },
  { to: "/planner", label: "Task Planner", icon: CalendarClock },
  { to: "/research", label: "Research Assistant", icon: Search },
  { to: "/assistant", label: "AI Workplace Assistant", icon: Bot },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  return (
    <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-1 px-3">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact: to === "/" }}
          className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeProps={{
            className: "bg-sidebar-accent text-sidebar-accent-foreground",
            "aria-current": "page",
          }}
        >
          <Icon className="size-4.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{label}</span>
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
        <Sparkles className="size-5" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-display text-base font-semibold text-sidebar-foreground">WorkFlow AI</span>
        <span className="text-[11px] text-sidebar-foreground/60">Productivity Assistant</span>
      </span>
    </div>
  );
}

function ProfileArea() {
  const settings = useAppState((s) => s.settings);
  const initials = settings.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="m-3 flex items-center gap-3 rounded-xl bg-sidebar-accent/60 px-3 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
        {initials || "WA"}
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-sm font-medium text-sidebar-foreground">
          {settings.name || "Your profile"}
        </span>
        <span className="block truncate text-xs text-sidebar-foreground/60">{settings.role || "Workspace member"}</span>
      </span>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  return (
    <div className="flex h-full flex-col bg-sidebar">
      <Brand />
      <NavLinks onNavigate={onNavigate} />
      <ProfileArea />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-[266px] shrink-0 border-r border-sidebar-border lg:block">
        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open navigation menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] border-sidebar-border bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="flex items-center gap-2 font-display text-base font-semibold">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            WorkFlow AI
          </span>
        </header>

        <main className={cn("mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10")}>{children}</main>
      </div>
    </div>
  );
}
