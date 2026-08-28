import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — WorkFlow AI" },
      {
        name: "description",
        content: "Personalise your WorkFlow AI workspace: profile, default tone, research depth, and AI disclaimer preferences.",
      },
      { property: "og:title", content: "Settings — WorkFlow AI" },
      { property: "og:description", content: "Personalise your WorkFlow AI workspace." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Personalise your WorkFlow AI workspace: profile, default tone, research depth, and AI disclaimer preferences."
      />

      <Card className="border-border shadow-card">
        <CardContent className="p-5 sm:p-6">
          <EmptyState
            icon={Settings}
            title="Settings coming soon."
            description="This page will let you update your profile, default tone, research depth, and AI disclaimer preferences."
          />
        </CardContent>
      </Card>
    </div>
  );
}
