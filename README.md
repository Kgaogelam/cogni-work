# WorkFlow AI

An AI-powered workplace productivity assistant built as a single, integrated SaaS platform. WorkFlow AI helps professionals write emails faster, summarise meetings, plan their day, research topics, and chat with a workplace-focused AI — all from one modern dashboard.

![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-FF6A5C?logo=lovable)
![TanStack Start](https://img.shields.io/badge/TanStack-Start-3E6FDB)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)

---

## Live Demo

- **Published site:** https://cogni-work.lovable.app
- **Preview site:** https://id-preview--463159f8-09b0-4e9c-b74b-7b767d0a9cc1.lovable.app

---

## Features

| Feature | What it does |
| --- | --- |
| **Dashboard** | At-a-glance overview of tasks, recent AI activity, and quick actions. |
| **Smart Email** | Generate ready-to-send workplace emails by purpose, tone, recipient, and context. |
| **Meeting Summariser** | Turn raw meeting notes into structured summaries with action items, decisions, and deadlines. Convert action items directly into planner tasks. |
| **Task Planner** | Manage tasks and let AI build realistic daily or weekly schedules from your open task list. |
| **Research Assistant** | Produce structured briefings on any workplace topic with clear separation of facts, assumptions, and next steps. |
| **AI Workplace Assistant** | General-purpose chat for productivity, communication, planning, and brainstorming. |
| **Settings** | Personalise name, role, default tone, default research depth, and AI disclaimers. |

---

## Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (full-stack React 19 with SSR/SSG and server functions)
- **Router:** TanStack Router (file-based routing)
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS v4 with custom OKLCH design tokens
- **UI Components:** Radix UI primitives + shadcn/ui patterns
- **State:** `useSyncExternalStore` + `localStorage` for client-side persistence
- **AI:** Lovable AI Gateway (Google Gemini 3.7 Flash) via server-only functions
- **Validation:** Zod
- **Language:** TypeScript

---

## Project Structure

```text
src/
├── components/          # Shared UI components (shell, output panel, markdown view, disclaimer)
├── lib/
│   ├── ai-gateway.server.ts   # Server-only AI gateway client
│   ├── ai.functions.ts        # createServerFn wrappers exposed to the client
│   ├── prompts.server.ts    # Structured prompt engineering for every feature
│   ├── store.ts             # Client-side app state (tasks, activity, saved items, settings)
│   └── utils.ts             # Tailwind / cn helpers
├── routes/              # TanStack file-based routes
│   ├── __root.tsx       # Root layout (shell, sonner, fonts)
│   ├── index.tsx        # Dashboard
│   ├── email.tsx        # Smart Email generator
│   ├── meetings.tsx     # Meeting Summariser
│   ├── planner.tsx      # Task Planner
│   ├── research.tsx     # Research Assistant (planned)
│   ├── chat.tsx         # AI Workplace Assistant (planned)
│   └── settings.tsx     # Settings (planned)
├── router.tsx           # Router configuration
├── start.ts             # Start app configuration
└── styles.css           # Global theme tokens and Tailwind imports
```

---

## Design System

WorkFlow AI uses a calm, professional palette:

- **Primary:** Teal (`oklch(0.52 0.099 195)`)
- **Surfaces:** Clean slate / ink tones
- **Typography:** Sora for display headings, Manrope for body text
- **Radius:** 0.75rem base with scaled tokens
- **Shadows:** Subtle card and pop shadows using OKLCH opacity

All colors are semantic CSS variables in `src/styles.css`. No hardcoded hex utilities are used in components, so theming and dark mode remain consistent.

---

## Responsible AI

Every AI feature follows a structured prompt-engineering template:

1. **Role** — who the AI is acting as
2. **Objective** — what the output must achieve
3. **Context** — the workplace scenario
4. **Instructions** — step-by-step generation rules
5. **Constraints** — non-negotiable responsible-AI rules
6. **Output Format** — predictable, structured results

Key responsible-AI guardrails:

- No fabricated facts, names, dates, deadlines, figures, or sources
- Missing information is labelled "Not specified"
- Assumptions are explicitly marked as assumptions
- The AI never claims to browse the web, send messages, or take real-world actions
- User content is fenced inside delimited blocks so it cannot override system instructions

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Bun](https://bun.sh/) or npm

### Install

```bash
git clone <repository-url>
cd <repository-name>
bun install
# or: npm install
```

### Development

```bash
bun run dev
# or: npm run dev
```

The dev server starts on `http://localhost:8080`.

### Build

```bash
bun run build
# or: npm run build
```

### Lint & Format

```bash
bun run lint
bun run format
```

---

## Environment Variables

The AI gateway runs on the server and reads the API key at runtime:

| Variable | Purpose |
| --- | --- |
| `LOVABLE_API_KEY` | Server-side key for the Lovable AI Gateway |

No API keys are exposed to the browser.

---

## Roadmap

- [x] Dashboard with quick actions and activity feed
- [x] Smart Email generator
- [x] Meeting Summariser with task extraction
- [x] Task Planner with AI schedule generation
- [ ] Research Assistant page
- [ ] AI Workplace Assistant chat page
- [ ] Settings page
- [ ] Cloud persistence and user accounts (Lovable Cloud)
- [ ] Export / share generated outputs

---

## License

This project is private and was built with [Lovable](https://lovable.dev).

---

## Acknowledgements

- Built with [TanStack Start](https://tanstack.com/start)
- UI powered by [Radix UI](https://www.radix-ui.com/) and [Tailwind CSS](https://tailwindcss.com/)
- AI responses generated via the Lovable AI Gateway
