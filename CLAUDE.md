# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start both frontend (port 5173) and backend (port 3001) concurrently
npm run client     # Frontend only (Vite dev server)
npm run server     # Backend only (Express)
npm run build      # Production build → dist/
npm run preview    # Preview production build
```

No test or lint scripts are configured.

## Architecture

Full-stack app: React (Vite) frontend + Express backend, communicating via **Server-Sent Events (SSE)** for real-time streaming.

### Request flow

1. User submits input (text + optional file uploads) via `POST /api/generate-prd` (multipart form)
2. Server spawns a **Claude CLI subprocess** (`claude --print --model claude-sonnet-4-5 --system-prompt ...`) — no API key needed, uses Claude Code's built-in auth
3. Claude's stdout is piped as SSE frames (`data: {"text":"..."}`) to the browser
4. Frontend accumulates chunks into markdown, renders in real-time via a custom `renderMarkdown()` regex parser (no markdown library)
5. On completion, user can: print/save PDF, copy raw markdown, or POST to `/api/download-docx` for Word export

### Key files

| File | Purpose |
|------|---------|
| `server/index.js` | Express routes, Claude CLI spawning, SSE streaming, file upload (multer), PRD system prompt (lines 42–178) |
| `server/generateDocx.js` | Converts markdown → `.docx` using the `docx` library; handles tables, code blocks, headings, lists |
| `src/App.jsx` | Entire frontend UI — split-pane layout, SSE consumption, markdown rendering, export actions |

### Claude CLI discovery

`server/index.js` checks multiple paths at startup: `/opt/homebrew/bin/claude`, `/usr/local/bin/claude`, `~/.local/bin/claude`, `~/.npm-global/bin/claude`, `/usr/bin/claude`, then falls back to PATH.

### PRD system prompt

Defined inline in `server/index.js` (lines 42–178). It enforces a fixed PRD structure: problem alignment, competitive landscape, proposed solution, user flows (Mermaid `flowchart TD`), functional requirements (user story + acceptance criteria), and non-functional requirements. PRD writing rules in Indonesian are also in `.claude/prd-rule.md`.

### File uploads

Handled by `multer` (memory storage, 20MB limit). Text files (TXT/MD/CSV/JSON/XML/YAML) — first 10,000 chars are appended to the prompt. PDF and image files are accepted but only referenced (not parsed server-side).

### Vite proxy

`vite.config.js` proxies `/api/*` → `http://localhost:3001` and disables buffering (`x-accel-buffering: no`) for SSE responses to work correctly through the dev proxy.

## Environment

No API keys required. The only relevant env var is `PORT` (defaults to `3001`). The `@anthropic-ai/sdk` package is installed but not used — the app relies entirely on the Claude CLI.
