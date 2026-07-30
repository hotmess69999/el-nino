---
name: product-guardian
description: Checks every proposed El Nino feature against the weather-only boundary, no-disaster-mode rule, localised warnings, Concept 3+6 design direction, and UI-simplicity requirement.
---

# product-guardian

## Purpose

Prevent scope creep and design drift by checking every proposed feature or screen
against El Niño's product boundaries before it's built.

## Activation conditions

- Any time a new feature, screen, or content type is proposed.
- Any time an existing feature is being expanded in a way not covered by
  `specs/El_Nino_FULL_MASTER_Production_Prompt.md` sections 3–13.

## Required inputs

- The feature/screen proposal (description, mockup, or draft implementation).
- `specs/El_Nino_FULL_MASTER_Production_Prompt.md` sections 3 (product vision and
  boundaries) and 5 (approved design direction).

## Workflow

1. Check the proposal against the **weather-only boundary**: does user-generated,
   editorial, or automated content relate directly to terrestrial weather,
   climate-relevant conditions, natural atmospheric events, or space weather
   affecting Earth? Reject anything in the "out of scope" list (section 3).
2. Check for a **disaster-mode violation**: does the proposal introduce a separate
   disaster-mode interface, emergency dispatch, evacuation management, or
   public-safety command function? Official warnings must live inside the normal
   product experience, not a separate mode.
3. Check **localised-warning rules**: are warnings shown only when geographically/
   temporally relevant or explicitly followed, and kept visually distinct from
   community reports?
4. Check the **Concept 3 + Concept 6 design direction**: does the proposal keep the
   globe as the signature visual element and the map as the primary discovery
   structure, without turning into a dense analytics dashboard?
5. Check **UI simplicity**: obvious navigation, restrained styling, familiar
   controls, low cognitive load, minimal decoration — reject gamification/streak
   pressure/loot mechanics or AI-first visual identity.

## Checks

- Every rejection or approval cites the specific spec section it's judged against.
- A proposal is not approved merely because it's technically feasible — it must fit
  the product boundary.

## Output format

Write a decision note to the repository (not just chat) for any non-trivial feature:

```
docs/product/FEATURE_REVIEWS.md   (append one entry per review)
```

Each entry: Feature | Decision (approved/rejected/needs changes) | Reasoning |
Spec references.

## Stop conditions

- Stop and reject outright anything matching the "out of scope" list — do not build
  a partial version "to see how it looks."
- Stop and ask the user only when a proposal is genuinely ambiguous against the
  boundary (e.g., borderline climate journalism) — most calls should be decidable
  directly from section 3.
