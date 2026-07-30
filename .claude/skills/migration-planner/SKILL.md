---
name: migration-planner
description: Turns a codebase-auditor audit into a staged keep/refactor/replace/defer/remove plan with evidence, for El Nino.
---

# migration-planner

## Purpose

Convert audit findings into a concrete, staged preservation and migration plan so the
redesign never discards working functionality without a documented reason.

## Activation conditions

- After `codebase-auditor` has produced current `docs/audit/` artefacts.
- Before Phase 1 (design system) or any phase that touches a subsystem without an
  existing keep/refactor/replace decision.

## Required inputs

- `docs/audit/REPOSITORY_MAP.md`, `SCREEN_INVENTORY.md`, `DEPENDENCIES.md`,
  `SECURITY_RISKS.md`, `PERFORMANCE_BASELINE.md`, `DATA_AND_MIGRATION.md`.
- The product boundary and design direction (`specs/El_Nino_FULL_MASTER_Production_Prompt.md`
  sections 3 and 5) to judge what redesign target each subsystem should move toward.

## Workflow

1. For every major subsystem/component in the repository map, assign one decision:
   **keep, refactor, replace, remove, or defer**.
2. For each decision, record: evidence (from the audit), user impact, migration
   strategy, rollback plan, estimated risk (low/medium/high).
3. Sequence decisions into delivery phases (see spec section 27) — don't schedule
   more than one phase's worth of migration work at a time.
4. Flag any decision that would delete or migrate real user data — these require an
   explicit written migration + rollback plan before proceeding, never a silent
   default.
5. Flag any decision that keeps a component conflicting with the approved design
   direction or product boundary — hand off to `product-guardian` before finalising.

## Checks

- Every row has evidence, not opinion.
- No "replace" decision is recorded for a subsystem that migration would clearly cost
  less to refactor, per the master prompt's non-negotiable rule (rewrite only when
  audit shows replacement is cheaper/safer than migration).
- Data-destructive decisions are never marked complete without a rollback plan.

## Output format

```
docs/audit/KEEP_REFACTOR_REPLACE_MATRIX.md
```

One row per subsystem/component: Subsystem | Decision | Evidence | User impact |
Migration strategy | Rollback plan | Risk.

## Stop conditions

- Stop and escalate to the user if a subsystem's correct decision is ambiguous even
  with full audit evidence (e.g., two equally valid strategies with materially
  different cost) — do not guess on high-risk calls.
- Major redesign work must not begin until this matrix exists and is committed to the
  repository.
