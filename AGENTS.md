# AGENTS.md - Project Rules for OpenAI Codex

## Project Overview
**Name:** BestFoodWhere.sg
**Type:** Singapore food directory website
**Migration:** WordPress → Next.js 14 + Supabase
**Reference:** https://bestfoodwhere.sg

---

## Agent Instructions

### Primary Directive
Replicate the existing WordPress site exactly using modern tech stack. Every visual element, interaction, and layout must match the current live site.

### Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Database | Supabase PostgreSQL |
| Hosting | Vercel |
| DNS | Cloudflare |

---

## Task Execution Protocol

### Step 1: Analyze
- Read existing codebase files relevant to task
- Understand current implementation
- Identify dependencies and impacts

### Step 2: Plan
- Create task plan in `tasks/todo.md`
- Break into atomic checklist items
- Estimate complexity

### Step 3: Verify
- Present plan to user for approval
- Wait for confirmation before proceeding
- Clarify any ambiguities

### Step 4: Execute
- Complete one checklist item at a time
- Commit after each logical unit
- Document changes inline

### Step 5: Review
- Run type checks (`npm run type-check`)
- Test in browser
- Update `tasks/todo.md` with completion notes

---

## Code Conventions

### File Structure
```
/app          → Pages and routes
/components   → Reusable UI components
/lib          → Utilities and clients
/types        → TypeScript interfaces
/hooks        → Custom React hooks
/public       → Static assets
```

### Naming
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Constants: `SCREAMING_SNAKE_CASE`

### TypeScript
- Strict mode enabled
- No `any` type
- Export interfaces from `/types`

### Components
- Server Components default
- Client Components only for interactivity
- Props interface above component
- Single responsibility

### Styling
- Tailwind utility classes only
- No inline styles
- No CSS modules
- Use `cn()` helper for conditionals

---

## Design Tokens

### Colors
```typescript
const colors = {
  primary: {
    orange: '#ef5f2a',
    red: '#E53935',
  },
  accent: {
    teal: '#00B4D8',
    yellow: '#FFD166',
  },
  text: {
    dark: '#1a1a1a',
    gray: '#666666',
  },
  background: {
    white: '#ffffff',
    warm: '#fff9f6',
  },
}
```

### Typography
```typescript
const fonts = {
  heading: 'Montserrat',
  body: 'Atkinson Hyperlegible, Inter, sans-serif',
}
```

### Breakpoints
```typescript
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
}
```

---

## Prohibited Actions
- Do not delete files without explicit permission
- Do not refactor unrelated code
- Do not add dependencies without approval
- Do not skip TypeScript types
- Do not ignore error handling

---

## Quality Checklist
Before marking any task complete:
- [ ] TypeScript compiles without errors
- [ ] No ESLint warnings
- [ ] Responsive on all breakpoints
- [ ] Matches live site design
- [ ] Loading states implemented
- [ ] Error boundaries in place
- [ ] Accessibility basics covered

