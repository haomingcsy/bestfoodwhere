# Context Management Instructions

## CRITICAL: Use Background Agents for Heavy Tasks

When dealing with large files or extensive exploration:

1. **ALWAYS spawn background agents** for file reading/exploration
2. **Keep main context light** - orchestration only
3. **Use `/compact` command** when context gets heavy

## How to Spawn Background Agents

For any task requiring heavy file reading:
```
Task(run_in_background=true, prompt="Read and analyze [files]")
```

This runs in an ISOLATED context window, returning only summaries.

## Example: Large Codebase Exploration

Instead of reading 50 files in main context:
```
[BG-1] Explore components/ folder → Own context
[BG-2] Explore lib/ folder → Own context  
[BG-3] Explore app/ folder → Own context

Main context receives: 3 compact summaries
```

## Available Skills & Agents

All from ~/.claude/ (shared across all worktrees):

**Skills:** api-builder, bfw-component, database-designer, etc.
**Agents:** code-reviewer, debugger, test-runner, etc.

## Dynamic Creation

If a task needs a skill/agent that doesn't exist:
1. Create it on-the-fly (tailored to task)
2. Store in ~/.claude/ for future reuse
3. Available to all worktrees immediately
