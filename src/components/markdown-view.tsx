import { Fragment, type ReactNode } from "react";

/** Renders bold (**text**) inside a line. */
function inline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>;
  });
}

/**
 * Minimal, dependency-free renderer for the headings / bullets / bold
 * structure that our prompts request from the model.
 */
export function MarkdownView({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];

  const flushList = (key: string) => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={`ul-${key}`}>
        {list.map((item, i) => (
          <li key={`${key}-${i}`}>{inline(item, `${key}-${i}`)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  lines.forEach((raw, index) => {
    const line = raw.trimEnd();
    const key = String(index);
    if (/^\s*(?:[-*•]|\d+\.)\s+/.test(line)) {
      list.push(line.replace(/^\s*(?:[-*•]|\d+\.)\s+/, ""));
      return;
    }
    flushList(key);
    if (!line.trim()) return;
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      blocks.push(<h2 key={`h-${key}`}>{heading[2]}</h2>);
      return;
    }
    blocks.push(<p key={`p-${key}`}>{inline(line, key)}</p>);
  });
  flushList("end");

  return <div className="ai-prose text-sm text-foreground">{blocks}</div>;
}
