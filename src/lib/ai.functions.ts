import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const EmailInput = z.object({
  purpose: z.string().min(1),
  recipient: z.string().default(""),
  subject: z.string().default(""),
  tone: z.string().default("Professional"),
  context: z.string().default(""),
});

const MeetingInput = z.object({
  title: z.string().default(""),
  notes: z.string().min(1),
});

const PlannerInput = z.object({
  tasks: z.string().min(1),
  availableHours: z.string().default(""),
  planningDate: z.string().default(""),
  planType: z.string().default("Daily Plan"),
});

const ResearchInput = z.object({
  topic: z.string().min(1),
  context: z.string().default(""),
  depth: z.string().default("Standard"),
});

const ChatInput = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      }),
    )
    .min(1)
    .max(40),
});

async function run(build: () => Promise<{ system: string; user: string }>) {
  const { callAi } = await import("./ai-gateway.server");
  const { system, user } = await build();
  return { text: await callAi([{ role: "system", content: system }, { role: "user", content: user }]) };
}

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => EmailInput.parse(data))
  .handler(async ({ data }) => {
    const { emailPrompt } = await import("./prompts.server");
    return run(async () => emailPrompt(data));
  });

export const summariseMeeting = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => MeetingInput.parse(data))
  .handler(async ({ data }) => {
    const { meetingPrompt } = await import("./prompts.server");
    return run(async () => meetingPrompt(data));
  });

export const generatePlan = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => PlannerInput.parse(data))
  .handler(async ({ data }) => {
    const { plannerPrompt } = await import("./prompts.server");
    return run(async () => plannerPrompt(data));
  });

export const runResearch = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ResearchInput.parse(data))
  .handler(async ({ data }) => {
    const { researchPrompt } = await import("./prompts.server");
    return run(async () => researchPrompt(data));
  });

export const chatWithAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ChatInput.parse(data))
  .handler(async ({ data }) => {
    const { ASSISTANT_SYSTEM_PROMPT } = await import("./prompts.server");
    const { callAi } = await import("./ai-gateway.server");
    const text = await callAi([
      { role: "system", content: ASSISTANT_SYSTEM_PROMPT },
      ...data.messages,
    ]);
    return { text };
  });
