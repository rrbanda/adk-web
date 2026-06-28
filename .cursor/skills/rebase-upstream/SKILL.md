---
name: rebase-upstream
description: >-
  Rebase the upstream google/adk-web code to the latest version. Use when the user
  asks to update, sync, rebase, or pull the upstream adk-web changes.
---

# Rebase Upstream

## Workflow

### Step 1: Check current state

```bash
git status
git log --oneline -5
```

Ensure the working tree is clean before rebasing.

### Step 2: Pull upstream changes

```bash
git subtree pull --prefix=. https://github.com/google/adk-web.git main --squash
```

If this is the first time and git subtree was not previously set up, see the note below.

### Step 3: Resolve conflicts

Conflicts should only occur in enterprise files (anything under `src/enterprise/`). If upstream files conflict, it means the upstream boundary was violated — fix by keeping the upstream version.

Priority order for conflict resolution:
1. Keep upstream code as-is for all files in `src/app/`, `src/main.ts`
2. Adapt enterprise code to work with the new upstream
3. Update `enterprise-main.ts` if injection token signatures changed

### Step 4: Verify the build

```bash
npm ci
npm run build
npm test
```

### Step 5: Audit for new extension points

Check if upstream added new injection tokens or changed interfaces:

```bash
# Look for new InjectionToken definitions
grep -r "new InjectionToken" src/app/core/services/interfaces/
grep -r "new InjectionToken" src/app/
```

Compare against `docs/upstream-audit.md` and update if new tokens were found.

### Step 6: Update the audit document

If new extension points were found, update `docs/upstream-audit.md` with the new tokens, their interfaces, and enterprise use cases.

## Note: First-time setup

If the repo was not originally set up with git subtree (i.e., the upstream code was cloned directly), the subtree pull will fail. In that case, the upstream code is already in the repo root and you should track upstream via:

```bash
git remote add upstream https://github.com/google/adk-web.git
git fetch upstream
git merge upstream/main --allow-unrelated-histories
```

## Checklist

- [ ] Working tree was clean before starting
- [ ] Upstream changes pulled successfully
- [ ] Conflicts resolved (enterprise files only)
- [ ] Build passes
- [ ] Tests pass
- [ ] `docs/upstream-audit.md` updated if new extension points found
