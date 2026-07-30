# Migration Strategy (Phase 0)

## Status: N/A — greenfield

No existing El Niño application was found to migrate from. This repository is a
from-scratch scaffold built directly against
[`specs/El_Nino_Master_Prompt_Draft_3_Pages.md`](../specs/El_Nino_Master_Prompt_Draft_3_Pages.md).

## If an existing project is found later

Before any code changes:

1. Audit it (functionality inventory, tech stack, data model, known issues) and
   record findings in [`TECH_DEBT.md`](./TECH_DEBT.md).
2. Identify what is "mature functionality" per the master prompt's objective to
   *preserve mature functionality and improve weak areas* — do not rewrite
   working features wholesale.
3. Decide feature-by-feature: keep as-is, refactor in place, or rebuild against the
   new globe-first / vertical-feed design direction.
4. Plan data migration (if a live database/user base exists) separately from UI
   migration — these should not block each other.
5. Update this document with the concrete phased plan before Phase 1 begins.
