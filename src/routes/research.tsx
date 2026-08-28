import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

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

function ResearchPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Research Assistant"
        description="Generate structured workplace research briefings with clear facts, assumptions, and actionable next steps."
      />

      <Card className="border-border shadow-card">
        <CardContent className="p-5 sm:p-6">
          <EmptyState
            icon={Search}
            title="Research Assistant coming soon."
            description="This page will let you research any workplace topic and receive a structured briefing with facts, assumptions, and next steps."
          />
        </CardContent>
      </Card>
    </div>
  );
}
