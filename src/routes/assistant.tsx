import { createFileRoute } from "@tanstack/react-router";
import { Bot } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Workplace Assistant — WorkFlow AI" },
      {
        name: "description",
        content:
          "Chat with WorkFlow AI about productivity, communication, planning, brainstorming, and everyday workplace questions.",
      },
      { property: "og:title", content: "AI Workplace Assistant — WorkFlow AI" },
      { property: "og:description", content: "Your workplace productivity chat assistant." },
    ],
  }),
  component: AssistantPage,
});

function AssistantPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Workplace Assistant"
        description="Chat with WorkFlow AI about productivity, communication, planning, brainstorming, and everyday workplace questions."
      />

      <Card className="border-border shadow-card">
        <CardContent className="p-5 sm:p-6">
          <EmptyState
            icon={Bot}
            title="AI Assistant coming soon."
            description="This page will let you chat with WorkFlow AI about productivity, communication, planning, and more."
          />
        </CardContent>
      </Card>
    </div>
  );
}
