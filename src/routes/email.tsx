import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Save, Sparkles } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { generateEmail } from "@/lib/ai.functions";
import { actions, useAppState } from "@/lib/store";
import { useAiTask } from "@/lib/use-ai-task";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — WorkFlow AI" },
      {
        name: "description",
        content: "Describe what you need to say and generate a clear, professional workplace email in the tone you choose.",
      },
      { property: "og:title", content: "Smart Email Generator — WorkFlow AI" },
      { property: "og:description", content: "Generate professional workplace emails in seconds." },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Professional", "Persuasive", "Apologetic"];

function EmailPage() {
  const defaultTone = useAppState((s) => s.settings.defaultTone);
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [tone, setTone] = useState(defaultTone || "Professional");
  const [context, setContext] = useState("");
  const [output, setOutput] = useState("");

  const fn = useServerFn(generateEmail);
  const { run, isLoading, error, setError } = useAiTask((data: Parameters<typeof fn>[0]["data"]) =>
    fn({ data }),
  );

  const generate = async () => {
    if (!purpose.trim()) {
      setError("Please describe what you want to communicate before generating an email.");
      toast.error("Add the email purpose first.");
      return;
    }
    const text = await run({ purpose, recipient, subject, tone, context });
    if (text) {
      setOutput(text);
      actions.logActivity("email", "Email generated");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Smart Email Generator"
        description="Describe what you want to communicate and WorkFlow AI will draft a professional, ready-to-send workplace email."
      />

      <Card className="border-border shadow-card">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="purpose">Email Purpose / Instructions</Label>
            <Textarea
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="min-h-32"
              placeholder="Describe what you want to communicate. For example: Ask my manager for two days of leave next week."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient / Audience</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. My line manager"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject (optional)</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Leave blank and AI will suggest one"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone">
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
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (optional)</Label>
            <Textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="min-h-20"
              placeholder="Dates, names, background or anything the email must reference."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={generate} disabled={isLoading} size="lg">
              <Sparkles className="size-4" aria-hidden="true" />
              {isLoading ? "Generating…" : "Generate Email"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setPurpose("");
                setRecipient("");
                setSubject("");
                setContext("");
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
        title="Generated Email"
        value={output}
        onChange={setOutput}
        onRegenerate={generate}
        onClear={() => setOutput("")}
        isLoading={isLoading}
        error={error}
        loadingLabel="Drafting your email…"
        monospaceEdit={false}
        emptyState={
          <EmptyState
            icon={Mail}
            title="Your generated email will appear here."
            description="Describe the purpose above, pick a tone and select Generate Email."
          />
        }
        extraActions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              actions.saveItem("email", subject || "Saved email draft", output);
              toast.success("Email saved to your workspace");
            }}
          >
            <Save className="size-4" aria-hidden="true" /> Save email
          </Button>
        }
      />
    </div>
  );
}
