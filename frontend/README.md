# Sarvam Platform — frontend assignment

React + TypeScript + Vite implementation of the Sarvam AI frontend-intern brief.

- **Live:** https://sarvam-ai-five.vercel.app
- **Consolidated write-up (architecture, algorithm, accessibility, error handling, Q1 bug report):** [`Deliverables.md`](../Deliverables.md) at the project root.

## Routes

| Route | Part | What it is |
| --- | --- | --- |
| `/` | — | Landing page with quick-start cards + summaries of the two assignment routes. |
| `/inference` | **A** | Inference Playground — text / voice prompt, token-by-token streaming, live token + tokens/sec metrics, mid-stream error recovery. |
| `/diff` | **B** | Model Output Diff — side-by-side & unified comparison of two model outputs with token-level LCS diff. |
| `/playground`, `/translate`, `/vision` | — | Visual references to dashboard.sarvam.ai (used to lock the design system). Not part of the assignment. |
| `*` | — | Custom 404 page. |

## Assignment cross-reference

Every requirement maps to a file you can open directly.

### Part A — Inference Playground

| Requirement | File |
| --- | --- |
| Multi-modal input (text / audio toggle) | [`features/inference/components/PromptColumn.tsx`](src/features/inference/components/PromptColumn.tsx) |
| Audio capture (Web Speech API) | [`features/inference/hooks/useAudioRecording.ts`](src/features/inference/hooks/useAudioRecording.ts) |
| Live mic-level waveform | [`features/inference/hooks/useMicLevels.ts`](src/features/inference/hooks/useMicLevels.ts) |
| Fetch + ReadableStream loop (hand-rolled, no SDK) | [`features/inference/hooks/useStream.ts`](src/features/inference/hooks/useStream.ts) |
| Mock streaming backend (SSE-style frames) | [`features/inference/lib/mockStream.ts`](src/features/inference/lib/mockStream.ts) |
| Live token counter + tokens/sec | [`features/inference/hooks/useStreamMetrics.ts`](src/features/inference/hooks/useStreamMetrics.ts) |
| Error banner (`role="alert"`) | [`features/inference/components/ErrorBanner.tsx`](src/features/inference/components/ErrorBanner.tsx) |
| Error-demo toggle (injects `errorAt = 0.3`) | [`features/inference/components/InferenceHeader.tsx`](src/features/inference/components/InferenceHeader.tsx) |

### Part B — Diff View

| Requirement | File |
| --- | --- |
| Tokenizer (whitespace-preserving) | [`features/diff/lib/tokenize.ts`](src/features/diff/lib/tokenize.ts) |
| LCS table + backtracking diff | [`features/diff/lib/lcs.ts`](src/features/diff/lib/lcs.ts) |
| "Changes only" fold pass | [`features/diff/lib/lcs.ts`](src/features/diff/lib/lcs.ts) — `foldUnchanged()` |
| Parallel-stream helper | [`features/diff/lib/parallelStream.ts`](src/features/diff/lib/parallelStream.ts) |
| Side-by-side renderer | [`features/diff/components/SplitView.tsx`](src/features/diff/components/SplitView.tsx) |
| Unified renderer | [`features/diff/components/UnifiedView.tsx`](src/features/diff/components/UnifiedView.tsx) |
| Insert / delete chip | [`features/diff/components/TokenSpan.tsx`](src/features/diff/components/TokenSpan.tsx) |

## Getting started

```bash
npm install
npm run dev
```

Vite picks the next free port if 5173 is busy.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | `tsc -b` type-check + production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint over all `.ts` / `.tsx` files |

## Tech stack

- **Vite + React 19 + TypeScript**
- **Tailwind v4** (via `@tailwindcss/vite`) — layout / focus rings only, never for color or type
- **react-router 7** — plain `<BrowserRouter>` + `<Routes>`
- **lucide-react** icons + **@radix-ui/react-slot, @radix-ui/react-toggle-group** primitives
- **No streaming SDK** (`ai`, `useChat`, `eventsource-parser`, …) — the Fetch + `ReadableStream` reader is hand-written
- **No diff library** (`diff`, `jsdiff`, `diff-match-patch`, …) — LCS implementation is hand-written

## Project layout

```
src/
├── App.tsx, main.tsx          # router + entry
├── index.css                  # global resets + slider styling (no design tokens)
├── icons.tsx                  # custom SVG icons (sidebar toggle, home, monogram)
├── constants/                 # SOURCE OF TRUTH for design tokens
│   ├── color.ts               # cream / ink / border / accent / gradient
│   ├── fonts.ts               # FONTS / FONT_SIZE / FONT_WEIGHT / LINE_HEIGHT / RADIUS / ICON
│   ├── spacing.ts             # SPACE / SIZE
│   └── index.ts               # barrel export
├── hooks/
│   └── useIsMobile.ts         # reactive matchMedia(<768px) hook
├── components/
│   ├── layout/                # Layout, Sidebar, PageHeader, MenuButton, LayoutContext
│   └── ui/                    # generic Button, Card, Chip, Slider, Dropdown, …
├── features/
│   ├── home/
│   │   └── HomePage.tsx       # landing — Start building cards + Inference / Diff hero sections
│   ├── inference/             # Part A
│   │   ├── InferencePage.tsx
│   │   ├── config.ts          # models, defaults, "Try" example prompts
│   │   ├── hooks/             # useStream, useStreamMetrics, useAudioRecording, useMicLevels
│   │   ├── lib/mockStream.ts  # SSE-style mock backend with deliberate failure mode
│   │   └── components/        # PromptColumn, OutputColumn, ErrorBanner, SettingsSidebar, …
│   ├── diff/                  # Part B
│   │   ├── DiffPage.tsx
│   │   ├── config.ts          # canned model responses for diff demo
│   │   ├── lib/               # tokenize.ts, lcs.ts, parallelStream.ts
│   │   └── components/        # SplitView, UnifiedView, TokenSpan, DiffHeader, …
│   └── NotFoundPage.tsx       # /* catch-all
├── clones/                    # Sarvam dashboard visual references (not assignment)
└── fonts/sarvam.css           # self-hosted Matter + Season Mix declarations
```

**Why feature folders.** Each assignment task owns its hooks, libs, components, and config. Changing the diff renderer doesn't touch the inference page; the LCS implementation lives next to the only page that consumes it.

**Why `components/ui/` is intentionally small.** Only genuinely cross-feature primitives live there (Button, Card, Slider, Dropdown). Anything specific to one page stays under that feature's folder.

## Design system

All tokens live in [`src/constants/`](src/constants/) and are imported by every component. **Never hardcode a hex or font stack** — import from `COLORS`, `FONTS`, `FONT_SIZE`, `FONT_WEIGHT`, `SPACE`, `RADIUS`, `ICON`, `SIZE`.

```ts
import { COLORS, FONTS, FONT_SIZE, RADIUS, SPACE } from '../../constants';
```

Fonts (Matter + Season Mix) are self-hosted under [`public/fonts/`](public/fonts/) and registered in [`src/fonts/sarvam.css`](src/fonts/sarvam.css). The two regular weights are `<link rel="preload">`-ed from `index.html` so the type lands on the first paint.

## Streaming

The inference playground writes the Fetch + `ReadableStream` loop by hand — see [`useStream.ts`](src/features/inference/hooks/useStream.ts):

```ts
const response = await fetch(url, { signal: controller.signal });
const reader = response.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // parse SSE "data: {...}" frames out of decoder.decode(value, { stream: true })
}
```

The mock backend in [`mockStream.ts`](src/features/inference/lib/mockStream.ts) returns a real `Response` whose `body` is a `ReadableStream<Uint8Array>` emitting the same wire format real LLM APIs use — so swapping in OpenAI / Anthropic / a Sarvam endpoint is a one-line change to the `fetch()` URL.

An `errorAt` (0–1) parameter triggers `controller.error(...)` mid-stream so the error-handling demo can be exercised live via the **Error demo** toggle in the header.

## Diff algorithm

LCS dynamic-programming table with backtracking, in [`lcs.ts`](src/features/diff/lib/lcs.ts). Shared prefix and suffix are trimmed first so the DP only runs on the changed middle. Time and space complexity are O(n·m); for chat-style outputs (~500 tokens each) a full re-diff finishes consistently under 1 ms in Chrome.

Full algorithm write-up (LCS table, backtracking moves, why over Myers / Patience / naive, trade-offs accepted) lives in [`Deliverables.md` §3](../Deliverables.md).

## Mobile responsiveness

Breakpoint: `<768px` is "mobile" (matches Tailwind's default `md`). Driven by [`hooks/useIsMobile.ts`](src/hooks/useIsMobile.ts), which subscribes to a `matchMedia` change listener so state updates on orientation flips.

Patterns applied:

- **Sidebar** → off-canvas drawer; opens via a hamburger button in each page header (`MenuButton`), closes on backdrop tap, on route change, or on toggle.
- **Inference page** → text input docks at the bottom as a fixed-height bar, output area fills the rest above (`flex-col-reverse md:flex-row`).
- **Diff page** → page-level scroll (vs. inner-box scroll on desktop), prompt panel sticky at the viewport bottom, headers compacted.
- **Settings drawer** → right-edge overlay sheet (88vw, max 360px) instead of an inline 340px column.
- **HomePage starter cards** → 3-up row on desktop, stacked column on mobile.

## Error handling

Append-only output contract: failures never clear the partial response. See [`useStream.ts`](src/features/inference/hooks/useStream.ts) for the `try/catch` shape; full strategy in [`Deliverables.md` §6](../Deliverables.md).

Three failure paths are covered: network drop (fetch rejects), mid-stream interruption (reader rejects), and timeout/manual abort (`AbortError` — treated as `done` not `error`).

## Accessibility

WCAG AA. Keyboard-first: every interactive element shows a focus ring via `focus-visible:ring-2`; ⌘/Ctrl+Enter submits, Esc stops; the streamed output is wrapped in `role="log"` + `aria-live="polite"`; diff chips use semantic `<mark>` with `aria-label`. Full audit in [`Deliverables.md` §5](../Deliverables.md).

## Deployment

- [`vercel.json`](vercel.json) — SPA rewrite for client-side routing + 1-year immutable `Cache-Control` on `/fonts` and `/assets`.
- Production bundle: ~353 KB JS / 17 KB CSS (gzip ~103 KB / 4 KB), plus four self-hosted woff2 fonts (~264 KB).

## License

This project is an interview submission and is not licensed for redistribution.
