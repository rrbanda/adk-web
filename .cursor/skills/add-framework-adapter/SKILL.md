---
name: add-framework-adapter
description: >-
  Scaffold a new agent framework adapter for the agent-chat multi-framework layer.
  Use when adding support for a new agent framework like LangChain, CrewAI,
  AutoGen, OpenAI, A2A, Kagenti, or any custom framework.
---

# Add Framework Adapter

## Prerequisites

Before starting, read these files to understand the patterns:
- `src/enterprise/adapters/adapter.interface.ts` — the adapter contract
- `src/enterprise/adapters/registry.ts` — how adapters are registered
- `src/app/core/models/types.ts` — the upstream ADK Event model (target format)
- `docs/upstream-audit.md` — upstream extension points reference

## Workflow

### Step 1: Create the adapter directory

```
src/enterprise/adapters/<framework-name>/
├── <framework-name>.adapter.ts
├── <framework-name>.adapter.spec.ts
├── <framework-name>.models.ts    # Framework-specific types (if needed)
└── index.ts
```

### Step 2: Implement the AgentAdapter interface

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AgentAdapter, AgentInfo, UnifiedRunRequest, UnifiedEvent, SessionInfo } from '../adapter.interface';

@Injectable()
export class <FrameworkName>Adapter implements AgentAdapter {
  readonly frameworkId = '<framework-name>';
  readonly displayName = '<Framework Display Name>';

  constructor(private http: HttpClient) {}

  listAgents(): Observable<AgentInfo[]> {
    // Fetch agents from the framework's API and translate to AgentInfo[]
  }

  runAgent(request: UnifiedRunRequest): Observable<UnifiedEvent> {
    // Send request to framework API, translate response events to UnifiedEvent (ADK Event model)
  }

  createSession(agentId: string, userId: string): Observable<SessionInfo> {
    // Create a session/thread/conversation in the framework
  }

  getSessionHistory(sessionId: string): Observable<UnifiedEvent[]> {
    // Fetch conversation history, translate to UnifiedEvent[]
  }

  supportsStreaming(): boolean { return false; }  // Set true if framework supports SSE/streaming
  supportsTracing(): boolean { return false; }    // Set true if framework provides trace data
  supportsEval(): boolean { return false; }       // Set true if framework has eval capabilities
  supportsLiveAudio(): boolean { return false; }  // Set true if framework supports audio streaming
}
```

### Step 3: Create the index.ts

```typescript
export { <FrameworkName>Adapter } from './<framework-name>.adapter';
```

### Step 4: Register in the AdapterRegistry

In `src/enterprise/adapters/registry.ts`, add:

```typescript
import { <FrameworkName>Adapter } from './<framework-name>';

// Add to the registry map
this.adapters.set('<framework-name>', inject(<FrameworkName>Adapter));
```

### Step 5: Write tests

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { initTestBed } from '../../../app/testing/utils';
import { <FrameworkName>Adapter } from './<framework-name>.adapter';

describe('<FrameworkName>Adapter', () => {
  let adapter: <FrameworkName>Adapter;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    initTestBed();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [<FrameworkName>Adapter],
    });
    adapter = TestBed.inject(<FrameworkName>Adapter);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should list agents', () => { /* ... */ });
  it('should run agent and translate events', () => { /* ... */ });
  it('should declare capabilities honestly', () => {
    expect(adapter.frameworkId).toBe('<framework-name>');
  });
});
```

## Event Translation

The critical part: translating framework-specific responses to ADK `Event` objects.

The upstream UI expects this shape:

```typescript
interface Event {
  id: string;
  author?: string;
  content?: { role: string; parts: Part[] };
  actions?: EventActions;
  timestamp?: number;
  partial?: boolean;
  turnComplete?: boolean;
}
```

Map your framework's output to these fields. If the framework doesn't provide a field, omit it.

## Checklist

- [ ] Adapter implements all `AgentAdapter` methods
- [ ] Capability flags are honest (don't claim support you haven't implemented)
- [ ] Events are correctly translated to ADK Event model
- [ ] Registered in AdapterRegistry
- [ ] Unit tests pass
- [ ] No modifications to upstream files
