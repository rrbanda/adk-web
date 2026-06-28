---
name: add-enterprise-service
description: >-
  Create a new enterprise service or override an upstream service using the injection
  token pattern. Use when adding authentication, RBAC, audit logging, branding,
  or any enterprise-specific functionality.
---

# Add Enterprise Service

## Prerequisites

Read these files first:
- `docs/upstream-audit.md` — lists all 22 upstream injection tokens
- `src/main.ts` — how upstream wires its providers
- `src/enterprise/enterprise-main.ts` — how enterprise overrides providers

## Two Patterns

### Pattern A: Override an upstream service

When you need to replace an upstream service with enterprise behavior (e.g., adding auth headers to session calls):

1. Find the injection token in `docs/upstream-audit.md`
2. Read the abstract interface in `src/app/core/services/interfaces/`
3. Create your implementation extending the abstract class
4. Wire it in `enterprise-main.ts`

```typescript
// src/enterprise/auth/enterprise-session.service.ts
import { Injectable } from '@angular/core';
import { SessionService } from '../../app/core/services/interfaces/session';

@Injectable()
export class EnterpriseSessionService extends SessionService {
  // Implement all abstract methods, adding auth headers
}
```

```typescript
// enterprise-main.ts
{ provide: SESSION_SERVICE, useClass: EnterpriseSessionService }
```

### Pattern B: Add a new enterprise-only service

When adding functionality that doesn't exist upstream:

1. Create an interface + injection token
2. Create the implementation
3. Create a mock for testing
4. Wire in `enterprise-main.ts`

```typescript
// src/enterprise/audit/audit.service.ts
import { Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export const AUDIT_SERVICE = new InjectionToken<AuditService>('AuditService');

export abstract class AuditService {
  abstract logAction(action: string, metadata: Record<string, unknown>): Observable<void>;
}

@Injectable()
export class AuditServiceImpl extends AuditService {
  logAction(action: string, metadata: Record<string, unknown>): Observable<void> {
    // Implementation
  }
}
```

## File structure

```
src/enterprise/<feature>/
├── <feature>.service.ts          # Interface + implementation
├── <feature>.service.spec.ts     # Tests
├── mock-<feature>.service.ts     # Test mock
└── index.ts                      # Public exports
```

## Checklist

- [ ] Service extends upstream abstract class (Pattern A) or defines its own interface (Pattern B)
- [ ] Injection token created or reused from upstream
- [ ] Mock service created for testing
- [ ] Tests written with `initTestBed()` called first
- [ ] Provider wired in `enterprise-main.ts`
- [ ] No modifications to upstream files
