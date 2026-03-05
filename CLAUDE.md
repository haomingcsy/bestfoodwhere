# BestFoodWhere — Claude Code Instructions

## Project Overview

BestFoodWhere (BFW) is a Singapore restaurant discovery platform at bestfoodwhere.sg.
- **Stack**: Next.js 14 (App Router), TypeScript, Supabase, Tailwind CSS 3
- **Hosting**: Vercel (auto-deploys from `main`), dev on port 4007
- **Data**: Supabase as primary DB, Google Sheets as legacy source (being migrated)

## Commands

```bash
npm run dev          # Dev server on port 4007
npm run build        # Production build (uses 8GB heap via NODE_OPTIONS)
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
npx supabase migration new <name>  # New DB migration
```

## Architecture

### Route Structure
- `/menu/[slug]` — Brand menu pages (730+ brands, data from `brands` table)
- `/menu/[slug]/[location]` — Per-location pages (840 locations, data from `brand_locations`)
- `/shopping-malls/[slug]` — Mall directory pages (19 malls)
- `/cuisine/[slug]` — Cuisine category pages (19 categories)
- `/api/crm/contacts` — Universal CRM handler (GHL integration)
- `/admin/*` — Admin dashboard
- `/(user)/*` — Consumer dashboard
- `/restaurant/*` — Restaurant owner dashboard

### Domain-Specific Rules

Path-scoped rules load automatically when editing files in their target directories:
- `.claude/rules/api.md` — API routes, GHL CRM integration (`app/api/**`, `lib/ghl/**`)
- `.claude/rules/seo.md` — SEO, brand/location pages (`lib/seo/**`, `app/menu/**`, `app/shopping-malls/**`, `app/cuisine/**`)
- `.claude/rules/supabase.md` — Database schema, migrations (`supabase/**`, `lib/supabase*`)
- `.claude/rules/data.md` — Legacy data sources, large files (`data/**`, `lib/google-sheets.ts`, `lib/shopping-mall-sheets.ts`)
- `.claude/rules/components.md` — UI components, dashboards (`components/**`, `app/(user)/**`, `app/admin/**`, `app/restaurant/**`)

## Forbidden Patterns

- **Never commit `.env.local`** or `client_secret*.json` files.
- **Never use `git add -A`** — stage specific files to avoid committing secrets or large binaries.

## Environment Variables

Key vars (never commit values): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_SHEETS_SPREADSHEET_ID`, `GHL_API_KEY`, `GHL_LOCATION_ID`, `STRIPE_SECRET_KEY`, `OPENAI_API_KEY`, `GOOGLE_CSE_API_KEY`

---

# Context Management Instructions

## CRITICAL: Protect Main Context Window

The #1 cause of "prompt too long" crashes is reading too many files in the main context.
Follow these rules strictly to prevent context exhaustion:

### Rule 1: NEVER read more than 2 files directly in main context

- If a task needs 3+ files read, use background agents for exploration
- For files over 300 lines, use `offset`/`limit` params to read only relevant sections
- Use Grep to find specific code instead of reading entire files

### Rule 2: Use background agents for ALL exploration

```
Task(run_in_background=true, subagent_type="Explore", prompt="...")
```

This runs in an ISOLATED context window. Main context only receives a compact summary.

### Rule 3: Use Plan mode for complex tasks

Before diving into implementation, use EnterPlanMode. The Plan agent explores in its own context, then returns a focused plan. This avoids loading everything into main context.

### Rule 4: Delegate heavy implementation to subagents

For multi-file edits, spawn a Task agent (not background) that does the reading + editing in its own context:

```
Task(subagent_type="general-purpose", prompt="Read [files], then make [changes]")
```

### Rule 5: Compact proactively

If you've done 3+ tool calls, consider whether `/compact` is needed before continuing.

## Workflow Pattern

1. User gives task
2. Spawn background Explore agent to understand scope -> get summary
3. If complex: use Plan mode
4. Make targeted edits using Grep + partial reads (offset/limit)
5. Delegate multi-file work to subagents

## Available Skills & Auto-Trigger Rules

Skills live at `.claude/skills/` (project-level). Invoke via the Skill tool. **Auto-trigger when the context matches** — don't wait to be asked.

### Core BFW Skills (project-specific)
| Skill | Auto-trigger when... |
|-------|---------------------|
| `api-builder` | Creating/modifying API routes under `app/api/` |
| `bfw-component` | Creating new UI components or page sections |
| `database-designer` | Creating tables, migrations, or RLS policies |
| `seo-generator` | Adding meta tags, JSON-LD, or structured data |
| `restaurant-researcher` | Populating restaurant data, scraping menus |
| `recipe-generator` | Creating or editing recipe content |
| `test-generator` | Writing tests for any new code |
| `marketing-hub` | Building webhook integrations, email templates, lead forms |
| `content-research-writer` | Writing blog posts, articles, or long-form content |

### Marketing & Growth Skills (installed from marketingskills repo)
| Skill | Auto-trigger when... |
|-------|---------------------|
| `product-marketing-context` | **Run FIRST** before any marketing skill — generates the foundation context doc at `.claude/skills/product-marketing-context/context.md` |
| `form-cro` | Optimizing any lead capture, contact, or application form (NOT signup) |
| `signup-flow-cro` | Optimizing consumer or restaurant owner signup flows |
| `page-cro` | Optimizing landing pages (`/advertise`, `/partnership`, `/listing`) for conversions |
| `cold-email` | Creating outreach email sequences (uses existing Resend + n8n infra) |
| `email-sequence` | Building automated drip campaigns or welcome sequences |
| `seo-audit` | Conducting systematic SEO reviews across page types |
| `programmatic-seo` | Optimizing templated pages at scale (730+ brand pages, 840 location pages) |
| `schema-markup` | Auditing/improving JSON-LD structured data |
| `ai-seo` | Optimizing for AI search engines and LLM citations |
| `analytics-tracking` | Setting up GA4 events, UTM tracking, or measurement |
| `competitor-alternatives` | Creating comparison pages (BFW vs Burpple, etc.) |

### Strategy & Growth Skills (installed from agency-agents repo)
| Skill | Auto-trigger when... |
|-------|---------------------|
| `growth-hacker` | Discussing user acquisition, viral mechanics, conversion funnels |
| `content-creator` | Planning editorial calendars, multi-platform content strategy |
| `analytics-reporter` | Building reports on traffic, leads, conversion metrics |
| `trend-researcher` | Researching Singapore F&B market, competitors, trends |

### Marketing Skill Dependency
All marketing skills check for `.claude/skills/product-marketing-context/context.md`. If it doesn't exist, run `product-marketing-context` first to generate BFW's positioning, audience, and messaging foundation.

## Context Management & Compaction Rules

### Task File as Source of Truth

Claude Code (the agent) MUST maintain a `tasks/todo.md` file that is the permanent source of truth for project state. This file lives on disk and survives any compaction or context reset. It MUST be updated after every completed task -- not at the end of a session, but IMMEDIATELY after each task is done.

The file must always contain:

- Current phase and what is being worked on
- Just completed items (checked off)
- In progress items with brief status
- Up next queue
- Blocked items with reasons
- Key architectural/design decisions made
- Recently modified files and what changed

### During Execution

Claude Code must work in a way that is resilient to compaction happening at any moment -- including mid-task:

1. **Update `tasks/todo.md` incrementally.** After finishing each sub-step of a larger task, write progress to the file. Not just at the end.
2. **Write code to files early and often.** Do not accumulate large amounts of code in conversation -- write it to disk where it's safe from compaction.
3. **Keep conversation lean.** When producing verbose output (build logs, long error traces, large diffs), summarize in conversation and write the full output to a file if needed.

### When Auto-Compact Fires Mid-Task

If compaction triggers while Claude Code is in the middle of work:

1. Claude Code reads `tasks/todo.md` to understand exactly where it was
2. Claude Code reads the most recently modified files to see what's already been done
3. Claude Code continues from the last completed sub-step -- does NOT restart the task from scratch
4. Claude Code does NOT ask the human "what were we working on?" -- the answer is in todo.md

### Manual Compaction at Breakpoints

Claude Code should proactively run `/compact` at natural breakpoints (feature complete, bug fixed, phase done) rather than waiting for auto-compact to fire at a random moment. Before compacting:

1. Update `tasks/todo.md` with current state
2. Run `/compact` with these preservation instructions:

```
/compact Preserve: current phase, all task progress, architectural decisions, active bugs, file structure, component patterns, which features are complete vs in progress, and the contents of tasks/todo.md
```

### What Must NEVER Be Lost Across Compaction

- What phase/feature is currently being built
- What files were recently created or modified and why
- Architectural decisions (e.g., "we decided to use Supabase instead of Google Sheets")
- Active bugs or known issues
- The human's preferences and feedback from this session
- Current data pipeline status and quality metrics

### Context Monitoring

Claude Code should be aware of context usage. When context exceeds 80%, Claude Code should:
1. Finish the current atomic task
2. Update `tasks/todo.md`
3. Run `/compact` with preservation instructions
4. Continue working

This is better than auto-compact firing at 95% mid-task with no preparation.

---

## Effort Level Selection

Assess effort level at the start of every task. Announce your choice briefly (e.g., "Effort: high — multi-file refactor"). Escalate mid-task if complexity increases.

- **High** — Architecture decisions, complex debugging across multiple files, database schema changes, multi-step refactors, security reviews, new integrations
- **Medium** — New component/page creation, single-file feature work, API route development, styling overhauls, writing tests
- **Low** — Single-line fixes, formatting, renaming, copy/text updates, file reads, simple config changes, answering codebase questions

---

## Compaction Preservation Checklist

When compaction fires (auto or manual), preserve ALL of the following:

1. **Modified file list** — Every file changed this session with a one-line summary of what changed
2. **Current task status** — What's done, what's in progress, what's next (mirrors tasks/todo.md)
3. **Active page/component** — Which route, page, or component is being worked on right now
4. **Test commands used** — Any test/build/lint commands run and their pass/fail status
5. **Brand data context** — If working on brand pages: which brand slug, any data issues found, menu data source (Supabase vs Sheets)
6. **Key decisions made** — Architectural choices, user preferences expressed, approaches chosen
7. **Blocked items** — Anything that's stuck and why

This list supplements the `tasks/todo.md` file. Both must be current before compaction.

---

## Session Discipline

- **Session hygiene**: After 30–45 minutes of focused work or when switching to an unrelated task, suggest `/clear` or `/compact` to the user.
- **Session naming**: Use `/rename` to give sessions descriptive names (e.g., "seo-overhaul", "ghl-integration-fix") so they're findable later.
- **Plan before building**: For any task touching 3+ files or requiring architectural decisions, suggest `/plan` mode before writing code.
- **File references**: Remind the user to use `@filepath` references instead of describing files verbally — it's faster and more precise.
- **Requirement interviews**: For larger features or unclear requirements, suggest interviewing the user about requirements before writing code. Ask 3–5 targeted questions to clarify scope, edge cases, and priorities.

---

## Agent Teams & Parallel Work

- For any task touching **3+ files or pages**, suggest spinning up agent teams with isolated worktrees.
- Especially relevant for BFW's 730+ brand pages where batch operations across multiple files are common.
- **Do NOT use agent teams** for single-file edits or simple fixes — the overhead isn't worth it.
- When using agent teams, assign clear scopes to each agent (e.g., "agent 1: update brand pages A–M", "agent 2: update brand pages N–Z").
- Use `/batch` for repetitive same-prompt-across-many-files operations instead of agent teams.
