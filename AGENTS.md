# AGENTS.md — AI Coding Assistant Instructions

> This file provides instructions for AI coding assistants (Cursor, Codex, Claude Code) working on the **agent-chat** project.

## Project Overview

**agent-chat** is an enterprise-grade, multi-framework agent chat UI built on top of [google/adk-web](https://github.com/google/adk-web) as an upstream dependency. It follows the **Red Hat model**: the upstream is consumed as-is and enterprise features are layered on top via Angular dependency injection — upstream code is never directly modified.

### Architecture

```
google/adk-web (upstream, in this repo root)
       │
       │  consumed via injection token overrides
       ▼
agent-chat enterprise layer (src/enterprise/)
       │
       ├── adapters/       Multi-framework agent adapters
       ├── shell/          Enterprise app shell (nav, auth, layout)
       ├── auth/           Authentication, SSO, interceptors
       ├── branding/       White-label theming
       └── shared/         Shared enterprise utilities
```

## Critical Rules

### 1. NEVER Modify Upstream Code

The upstream google/adk-web code lives in the repository root (`src/app/`, `src/main.ts`, etc.). This code is periodically rebased from the upstream repository.

**DO NOT:**
- Edit files in `src/app/components/`, `src/app/core/`, or `src/main.ts` (upstream)
- Add imports to upstream files that reference enterprise code
- Change upstream's `angular.json`, `package.json`, or `tsconfig.json`

**DO:**
- Create new files in `src/enterprise/` for all enterprise code
- Override upstream services by providing new implementations for existing injection tokens
- Extend upstream interfaces rather than modifying them

### 2. Injection Token Pattern

The upstream provides 22 injection tokens (see `docs/upstream-audit.md`). The enterprise layer overrides these in its own bootstrap. Key tokens:

- `AGENT_SERVICE` — Override to add multi-framework adapter dispatch
- `SESSION_SERVICE` — Override to add auth headers and tenant scoping
- `FEATURE_FLAG_SERVICE` — Override to control enterprise feature visibility
- `THEME_SERVICE` — Override for corporate branding
- `FEEDBACK_SERVICE` — Override to enable actual feedback collection (upstream is a no-op stub)
- `LOGO_COMPONENT` — Override for white-label branding

### 3. Multi-Framework Adapter Pattern

When adding support for a new agent framework:

1. Create a directory: `src/enterprise/adapters/<framework-name>/`
2. Implement the `AgentAdapter` interface from `src/enterprise/adapters/adapter.interface.ts`
3. Register the adapter in `src/enterprise/adapters/registry.ts`
4. Add tests following the pattern in existing adapter directories
5. Update `docs/upstream-audit.md` if the adapter reveals new upstream extension needs

```typescript
// Template for a new adapter
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

### 4. Testing Requirements

- Call `initTestBed()` from `src/app/testing/utils.ts` before `TestBed.configureTestingModule()` in every spec file (upstream compatibility requirement)
- Use mock services from `src/app/core/services/testing/` for upstream service dependencies
- Place enterprise test mocks alongside their services
- Run tests with `npm test` (Karma + Jasmine, ChromeHeadless)

### 5. Styling Rules

- Use CSS custom properties (`--mat-sys-*`) for all colors — never hardcode hex/rgb values
- Enterprise theme overrides go in `src/enterprise/styles/`
- Follow the existing Angular Material 21 theming pattern
- Support both light and dark themes

### 6. Code Conventions

- **Framework:** Angular 21 with standalone components
- **State:** Angular signals + RxJS observables (no NgRx)
- **HTTP:** `HttpClient` for REST, `fetch` for SSE, `rxjs/webSocket` for WebSocket
- **Models:** TypeScript interfaces and abstract classes
- **DI:** InjectionToken pattern for all swappable services
- **i18n:** Injectable message tokens with English defaults

## Directory Structure

```
agent-chat/
├── src/
│   ├── app/                    # UPSTREAM — do not modify
│   │   ├── components/         # Upstream UI components
│   │   ├── core/               # Upstream services, models, interfaces
│   │   └── ...
│   ├── enterprise/             # ENTERPRISE — all new code goes here
│   │   ├── adapters/           # Framework adapters (ADK, OpenAI, LangChain, etc.)
│   │   ├── shell/              # App shell wrapping upstream ChatComponent
│   │   ├── auth/               # Authentication, guards, interceptors
│   │   ├── branding/           # Custom theming, logo
│   │   └── shared/             # Shared utilities
│   ├── main.ts                 # UPSTREAM bootstrap — do not modify
│   └── enterprise-main.ts      # ENTERPRISE bootstrap — overrides DI tokens
├── docs/
│   └── upstream-audit.md       # Extension point reference (keep updated)
├── deploy/                     # Docker, Helm, K8s manifests
├── .cursor/
│   ├── rules/                  # Cursor-specific rules
│   └── skills/                 # Cursor agent skills
├── AGENTS.md                   # This file
├── CONTRIBUTING.md             # Contribution guide
└── README.md
```

## Common Tasks

### Adding a new framework adapter

1. Read `src/enterprise/adapters/adapter.interface.ts` for the contract
2. Create `src/enterprise/adapters/<name>/` with service, spec, and index
3. Register in `src/enterprise/adapters/registry.ts`
4. Implement protocol translation: framework events → ADK `Event` model

### Adding an enterprise feature

1. Create service + interface in `src/enterprise/<feature>/`
2. If replacing an upstream service, use the same injection token
3. Wire the provider in `src/enterprise-main.ts`
4. Add tests with mock dependencies

### Rebasing upstream

```bash
git subtree pull --prefix=. https://github.com/google/adk-web.git main --squash
# Resolve any conflicts in enterprise files only
# Run tests: npm test
# Update docs/upstream-audit.md if new injection tokens were added
```

## Reference

- [Upstream audit](docs/upstream-audit.md) — all injection tokens, feature flags, and extension points
- [google/adk-web](https://github.com/google/adk-web) — upstream repository
- [ADK docs](https://google.github.io/adk-docs/) — Agent Development Kit documentation
