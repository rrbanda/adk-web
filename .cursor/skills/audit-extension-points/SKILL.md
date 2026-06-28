---
name: audit-extension-points
description: >-
  Scan upstream google/adk-web for all injection tokens, swappable components,
  feature flags, and i18n tokens. Use when auditing extension points or after
  an upstream rebase to detect new extension points.
---

# Audit Extension Points

## Workflow

### Step 1: Scan for injection tokens

Search for all `InjectionToken` definitions in upstream code:

```bash
grep -rn "new InjectionToken" src/app/core/services/interfaces/
grep -rn "new InjectionToken" src/app/injection_tokens.ts
grep -rn "new InjectionToken" src/app/components/
```

### Step 2: Scan for abstract service classes

```bash
grep -rn "abstract class.*Service" src/app/core/services/interfaces/
```

### Step 3: Scan for i18n message tokens

```bash
grep -rn "InjectionToken.*Messages" src/app/components/
```

### Step 4: Scan for feature flags

Read `src/app/core/services/interfaces/feature-flag.ts` and compare with the audit doc.

### Step 5: Check component tokens

Look for swappable component tokens:

```bash
grep -rn "InjectionToken.*Component" src/app/
```

### Step 6: Compare with docs/upstream-audit.md

Open `docs/upstream-audit.md` and compare the current scan results against the documented extension points.

For each new extension point found:
1. Document the token name, interface, and default implementation
2. Describe the enterprise use case
3. Add it to the appropriate section in the audit doc

### Step 7: Update the audit document

Update `docs/upstream-audit.md` with:
- New injection tokens
- Changed interfaces (new methods, changed signatures)
- New feature flags
- New i18n message tokens
- Updated "last audited" date

## Output format

When reporting findings, use this format:

```
NEW: <token name> — <interface> — <enterprise use case>
CHANGED: <token name> — <what changed>
REMOVED: <token name> — <impact on enterprise layer>
```
