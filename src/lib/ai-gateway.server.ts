/**
 * Server-only helper for talking to the Lovable AI Gateway.
 * The API key never leaves the server.
 */

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.7-flash";

export class AiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function friendlyMessage(status: number, fallback: string) {
  if (status === 429) {
    return "The AI service is busy right now. Please wait a moment and try again.";
  }
  if (status === 402) {
    return "AI usage limit reached for this workspace. Please add credits to continue.";
  }
  if (status === 403) {
    return "AI access is currently blocked for this workspace.";
  }
  if (status === 401) {
    return "The AI service is not configured correctly. Please contact the administrator.";
  }
  if (status >= 500) {
    return "The AI service is temporarily unavailable. Please try again.";
  }
  return fallback;
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function callAi(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    throw new AiError("The AI service is not configured. Please try again later.", 401);
  }

  let response: Response;
  try {
    response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({ model: MODEL, messages }),
    });
  } catch {
    throw new AiError("Could not reach the AI service. Please check your connection and try again.", 503);
  }

  if (!response.ok) {
    let detail = "";
    try {
      const body = (await response.json()) as { error?: { message?: string }; message?: string };
      detail = body?.error?.message ?? body?.message ?? "";
    } catch {
      detail = "";
    }
    throw new AiError(
      friendlyMessage(response.status, detail || "The AI request could not be completed. Please try again."),
      response.status,
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new AiError("The AI returned an empty response. Please try again.", 502);
  }
  return text;
}
