import { useCallback, useState } from "react";

const GENERIC_ERROR = "The AI service is temporarily unavailable. Please try again.";

function toMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : "";
  if (!raw) return GENERIC_ERROR;
  // Never surface technical/internal details to the user.
  if (/fetch|network|failed to|json|undefined|token|stack|<html/i.test(raw)) return GENERIC_ERROR;
  if (raw.length > 200) return GENERIC_ERROR;
  return raw;
}

export function useAiTask<TArgs extends unknown[]>(fn: (...args: TArgs) => Promise<{ text: string }>) {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (...args: TArgs): Promise<string | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn(...args);
        return result.text;
      } catch (err) {
        setError(toMessage(err));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fn],
  );

  return { run, isLoading, error, setError };
}
