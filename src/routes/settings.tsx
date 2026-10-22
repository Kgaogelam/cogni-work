import { createFileRoute } from "@tanstack/react-router";
import {
  Palette,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  User,
  Download,
  Eraser,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PRIVACY_NOTICE } from "@/components/ai-disclaimer";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  getState,
  actions,
  useAppState,
  type ThemePreference,
} from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — WorkFlow AI" },
      {
        name: "description",
        content:
          "Personalise your WorkFlow AI workspace: profile, appearance, AI preferences, and data & privacy controls.",
      },
      { property: "og:title", content: "Settings — WorkFlow AI" },
      { property: "og:description", content: "Personalise your WorkFlow AI workspace." },
    ],
  }),
  component: SettingsPage,
});

const TONES = ["Formal", "Friendly", "Professional", "Persuasive", "Apologetic"];
const DEPTHS = ["Quick Overview", "Standard", "Detailed"] as const;
const THEMES: Array<{ value: ThemePreference; label: string }> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Match system" },
];

function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Personalise your WorkFlow AI workspace: profile, appearance, AI preferences, and data & privacy controls."
      />
      <ProfileCard />
      <AppearanceCard />
      <AiPreferencesCard />
      <DataPrivacyCard />
    </div>
  );
}

function ProfileCard() {
  const settings = useAppState((s) => s.settings);
  const [name, setName] = useState(settings.name);
  const [role, setRole] = useState(settings.role);

  useEffect(() => {
    setName(settings.name);
    setRole(settings.role);
  }, [settings.name, settings.role]);

  const dirty = name !== settings.name || role !== settings.role;

  function save() {
    actions.updateSettings({ name: name.trim(), role: role.trim() });
    toast.success("Profile updated", {
      description: "Your name and role now appear across the workspace.",
    });
  }

  return (
    <Card className="border-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="size-4.5 text-primary" aria-hidden="true" />
          Profile
        </CardTitle>
        <CardDescription>
          Your name and role appear on the sidebar and help the AI address you correctly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="settings-name">Name</Label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kgaogelo M"
              maxLength={60}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-role">Role</Label>
            <Input
              id="settings-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Product Manager"
              maxLength={60}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={save} disabled={!dirty || !name.trim()}>
            Save profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AppearanceCard() {
  const theme = useAppState((s) => s.settings.theme);

  return (
    <Card className="border-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="size-4.5 text-primary" aria-hidden="true" />
          Appearance
        </CardTitle>
        <CardDescription>Choose how WorkFlow AI looks on this device.</CardDescription>
      </CardHeader>
      <CardContent className="max-w-xs space-y-2">
        <Label htmlFor="settings-theme">Colour theme</Label>
        <Select
          value={theme}
          onValueChange={(value: ThemePreference) => {
            actions.updateSettings({ theme: value });
            toast.success(`Theme set to ${THEMES.find((t) => t.value === value)?.label}`);
          }}
        >
          <SelectTrigger id="settings-theme">
            <SelectValue placeholder="Select a theme" />
          </SelectTrigger>
          <SelectContent>
            {THEMES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          "Match system" follows your device's light or dark mode automatically.
        </p>
      </CardContent>
    </Card>
  );
}

function AiPreferencesCard() {
  const settings = useAppState((s) => s.settings);

  return (
    <Card className="border-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="size-4.5 text-primary" aria-hidden="true" />
          AI Preferences
        </CardTitle>
        <CardDescription>
          Defaults applied to Smart Email, research briefings and the workplace assistant.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="settings-tone">Default tone</Label>
            <Select
              value={settings.defaultTone}
              onValueChange={(value) => {
                actions.updateSettings({ defaultTone: value });
                toast.success(`Default tone set to ${value}`);
              }}
            >
              <SelectTrigger id="settings-tone">
                <SelectValue placeholder="Select a tone" />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Used when drafting emails and messages.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-depth">Default research depth</Label>
            <Select
              value={settings.defaultDepth}
              onValueChange={(value) => {
                actions.updateSettings({ defaultDepth: value });
                toast.success(`Default depth set to ${value}`);
              }}
            >
              <SelectTrigger id="settings-depth">
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
            <p className="text-xs text-muted-foreground">How detailed research briefings should be.</p>
          </div>
        </div>

        <Separator />

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="settings-disclaimers">Show AI disclaimers</Label>
            <p className="text-xs text-muted-foreground">
              Display responsible-AI reminders next to AI-generated output.
            </p>
          </div>
          <Switch
            id="settings-disclaimers"
            checked={settings.showDisclaimers}
            onCheckedChange={(checked) => {
              actions.updateSettings({ showDisclaimers: checked });
              toast.success(checked ? "AI disclaimers shown" : "AI disclaimers hidden");
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function DataPrivacyCard() {
  const taskCount = useAppState((s) => s.tasks.length);
  const savedCount = useAppState((s) => s.saved.length);

  function exportData() {
    const data = getState();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-ai-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported", { description: "A JSON copy of your workspace has downloaded." });
  }

  return (
    <Card className="border-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4.5 text-primary" aria-hidden="true" />
          Data & Privacy
        </CardTitle>
        <CardDescription>
          Your workspace data is stored locally in this browser — nothing is uploaded to a server.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          {PRIVACY_NOTICE}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{taskCount} tasks</Badge>
          <Badge variant="secondary">{savedCount} saved items</Badge>
        </div>

        <Separator />

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="size-4" aria-hidden="true" />
            Export my data
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              actions.clearActivity();
              toast.success("Activity log cleared");
            }}
          >
            <Eraser className="size-4" aria-hidden="true" />
            Clear activity log
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              actions.resetDemoData();
              toast.success("Workspace reset to the sample data");
            }}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset to sample data
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="size-4" aria-hidden="true" />
                Clear all data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all workspace data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes all tasks, saved items and your activity log from this
                  browser. Your profile and preferences are kept. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    actions.clearAll();
                    toast.success("All workspace data cleared");
                  }}
                >
                  Clear everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
