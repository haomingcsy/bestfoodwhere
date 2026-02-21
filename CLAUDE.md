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

## Available Skills & Agents

All from ~/.claude/ (shared across all worktrees):

**Skills:** api-builder, bfw-component, database-designer, etc.
**Agents:** code-reviewer, debugger, test-runner, etc.

## Dynamic Creation

If a task needs a skill/agent that doesn't exist:

1. Create it on-the-fly (tailored to task)
2. Store in ~/.claude/ for future reuse
3. Available to all worktrees immediately

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
