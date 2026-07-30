---
name: release-documentation-manager
description: Maintains El Nino's README, setup scripts, architecture decisions, migration notes, environment-variable reference, runbooks, change log, production checklist and release evidence.
---

# release-documentation-manager

## Purpose

Keep documentation close to the code and current, so production operations never
depend on undocumented knowledge held only in a chat transcript.

## Activation conditions

- End of every phase checkpoint (section 27 checkpoint report).
- Any time a new external account, provider, environment variable, or architecture
  decision is introduced.

## Required inputs

- `specs/El_Nino_FULL_MASTER_Production_Prompt.md` section 28 (documentation and
  handover) for the required document list.
- The current state of `docs/` to avoid duplicating or letting docs go stale.

## Workflow

1. Verify the required documentation set exists and is current: `README.md`,
   `docs/SETUP.md`, `docs/PRODUCT.md`, `docs/DESIGN_SYSTEM.md`,
   `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `docs/API.md`,
   `docs/WEATHER_PROVIDERS.md`, `docs/MEDIA_PIPELINE.md`, `docs/TRUST_AND_SAFETY.md`,
   `docs/SECURITY.md`, `docs/DEPLOYMENT.md`, `docs/RUNBOOKS/`, `docs/ADMIN_GUIDE.md`,
   `docs/USER_GUIDE.md`, `CHANGELOG.md`, `docs/decisions/` (ADRs).
2. Write a checkpoint report (`docs/checkpoints/PHASE-N.md`) at the end of every
   phase per the ten-point format in section 27.
3. Record every new external account/key/provider/licence requirement without
   exposing secret values.
4. Record architecture decisions (library choices, Prisma-vs-Drizzle, auth-provider
   choice, etc.) as ADRs with reasoning, alternatives considered, and exit strategy.
5. Update `CHANGELOG.md` for every user-visible or API-visible change.
6. Verify a new developer could set up the project from a clean machine using only
   the documented scripts — spot-check this periodically, don't just assume it's
   true.

## Checks

- No single giant README that goes stale — documentation stays split per the
  required file list and updated alongside the code it describes.
- Every checkpoint report exists before the phase is considered done.
- No secret values ever appear in committed documentation.

## Output format

The files listed in the workflow, kept under version control in `docs/`.

## Stop conditions

- Stop and flag a phase as incomplete if its checkpoint report is missing, even if
  the code itself is done.
- Stop and ask the user for clarification before documenting an architecture
  decision that was made implicitly rather than deliberately — surface it for an
  explicit decision first.
