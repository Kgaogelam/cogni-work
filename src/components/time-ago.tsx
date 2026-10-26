import { useEffect, useState } from "react";

import { timeAgo } from "@/lib/store";

/** Renders relative time only after hydration to avoid server/client clock mismatches. */
export function TimeAgo({ at }: { at: number }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    setText(timeAgo(at));
    const id = setInterval(() => setText(timeAgo(at)), 60_000);
    return () => clearInterval(id);
  }, [at]);
  return <span suppressHydrationWarning>{text ?? "\u00a0"}</span>;
}
