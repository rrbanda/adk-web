# Contributing to agent-chat

Thank you for contributing. This guide covers the architecture, conventions, and common contribution workflows.

## Architecture Overview

**agent-chat** is built on top of [google/adk-web](https://github.com/google/adk-web) following the Red Hat model: upstream code is consumed as-is, and enterprise features are layered on top through Angular dependency injection.

```
Upstream (src/app/)          Enterprise (src/enterprise/)
┌─────────────────┐         ┌──────────────────────────┐
│ ChatComponent    │◄────────│ AppShellComponent        │
│ Services         │  DI     │ Enterprise services      │
│ Injection tokens │  tokens │ Framework adapters       │
│ Models           │         │ Auth / branding / audit  │
└─────────────────┘         └──────────────────────────┘
```

**The golden rule:** never modify files under `src/app/` or `src/main.ts`. These are upstream code. All enterprise work goes in `src/enterprise/`.

## Getting Started

### Prerequisites

- Node.js (LTS)
- npm
- Angular CLI (`npm install -g @angular/cli`)

### Setup

```bash
git clone <repo-url>
cd agent-chat
npm install
```

### Development

```bash
# Run with a local ADK API server
npm run serve --backend=http://localhost:8000

# Run tests
npm test

# Build for production
npm run build
```

## Key References

| Document | Purpose |
|----------|---------|
| `AGENTS.md` | AI coding assistant instructions (Cursor, Codex, Claude Code) |
| `docs/upstream-audit.md` | All upstream extension points mapped |
| `.cursor/rules/` | Cursor-specific rules |
| `.cursor/skills/` | Cursor agent skills for common tasks |

## How to Add a Framework Adapter

This is the most common contribution. Each adapter enables agent-chat to work with a different agent framework.

### 1. Create the adapter directory

```
src/enterprise/adapters/<framework-name>/
├── <framework-name>.adapter.ts
├── <framework-name>.adapter.spec.ts
├── <framework-name>.models.ts      # Optional: framework-specific types
└── index.ts
```

### 2. Implement the AgentAdapter interface

Your adapter must implement the `AgentAdapter` interface from `src/enterprise/adapters/adapter.interface.ts`. The key responsibility is translating between the framework's native protocol and the ADK `Event` model that the upstream UI expects.

```typescript
@Injectable()
export class MyFrameworkAdapter implements AgentAdapter {
  readonly frameworkId = 'my-framework';
  readonly displayName = 'My Framework';

  listAgents(): Observable<AgentInfo[]> { /* ... */ }
  runAgent(request: UnifiedRunRequest): Observable<UnifiedEvent> { /* ... */ }
  createSession(agentId: string, userId: string): Observable<SessionInfo> { /* ... */ }
  getSessionHistory(sessionId: string): Observable<UnifiedEvent[]> { /* ... */ }

  supportsStreaming(): boolean { return false; }
  supportsTracing(): boolean { return false; }
  supportsEval(): boolean { return false; }
  supportsLiveAudio(): boolean { return false; }
}
```

### 3. Register and test

- Register in `src/enterprise/adapters/registry.ts`
- Write tests with mock HTTP responses
- Call `initTestBed()` before `TestBed.configureTestingModule()`

If you're using Cursor, run the `add-framework-adapter` skill for step-by-step scaffolding.

## How to Add an Enterprise Feature

### Overriding an upstream service

1. Find the injection token in `docs/upstream-audit.md`
2. Read the abstract interface in `src/app/core/services/interfaces/`
3. Create your implementation in `src/enterprise/<feature>/`
4. Wire the provider in `src/enterprise/enterprise-main.ts`

### Adding new enterprise-only functionality

1. Create service + interface + injection token in `src/enterprise/<feature>/`
2. Create a mock for testing
3. Wire in `enterprise-main.ts`

If you're using Cursor, run the `add-enterprise-service` skill for scaffolding.

## How to Rebase Upstream

When google/adk-web releases updates:

```bash
# Ensure clean working tree
git status

# Pull upstream
git remote add upstream https://github.com/google/adk-web.git  # first time only
git fetch upstream
git merge upstream/main --allow-unrelated-histories

# Resolve conflicts (enterprise files only — keep upstream as-is)
# Build and test
npm ci
npm run build
npm test

# Audit for new extension points
# Update docs/upstream-audit.md
```

If you're using Cursor, run the `rebase-upstream` skill for guided steps.

## Code Conventions

- **Angular 21** standalone components
- **State management:** Angular signals + RxJS (no NgRx)
- **Styling:** CSS custom properties only (`--mat-sys-*`), support both light/dark themes
- **Testing:** `initTestBed()` required before `TestBed.configureTestingModule()`
- **DI:** InjectionToken pattern for all swappable services

## AI Coding Tools

This project is designed for AI-assisted development. Contributors can use:

- **Cursor** — Rules in `.cursor/rules/`, skills in `.cursor/skills/`
- **Claude Code** — Instructions in `AGENTS.md`
- **Codex** — Instructions in `AGENTS.md`

The `AGENTS.md` file contains the project context that any AI coding tool needs. The Cursor rules and skills provide additional guidance for Cursor-specific workflows.

## Pull Request Guidelines

1. Enterprise code only — no changes to upstream files
2. Tests passing (`npm test`)
3. Build passing (`npm run build`)
4. New adapters include tests with mock HTTP responses
5. New services include mock implementations for testing
6. Styling uses CSS variables, not hardcoded colors
