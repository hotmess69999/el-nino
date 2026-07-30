---
name: ui-consistency-reviewer
description: Enforces El Nino's typography, spacing, colour, icon, motion, layout and responsive rules; rejects generic AI-dashboard patterns.
---

# ui-consistency-reviewer

## Purpose

Keep every screen visually and behaviourally consistent with the approved design
system so the product never drifts into a generic AI-dashboard look.

## Activation conditions

- Any time a new screen, component, or visual change is proposed or implemented.
- Before a checkpoint report is finalised for any phase that touched UI.

## Required inputs

- The screen/component in question (code, screenshot, or description).
- `specs/El_Nino_FULL_MASTER_Production_Prompt.md` section 5 (design direction and
  tokens) and Appendix D (screen-by-screen build specification) for the relevant
  screen.
- `docs/DESIGN_SYSTEM.md` (once it exists) for the current token values.

## Workflow

1. Check token usage: colour, type, spacing, radius, motion, elevation, layout must
   come from the shared token set — flag any local one-off value.
2. Check for banned patterns: glassmorphism, neon glow, generic gradients, oversized
   hero headings, decorative blobs, floating-card overload, oversized icons,
   control-room-dashboard density.
3. Check corner radii: only used where a physical container needs definition, not on
   every section.
4. Check icon set consistency: one icon family, simple filled/outlined forms.
5. Check motion: explains movement/hierarchy/state; no bouncy/elastic/ornamental
   motion; reduced-motion mode replaces camera flight with crossfade + instant
   reposition.
6. Check responsive behaviour: mobile is single-primary-surface (no permanent
   sidebars/multi-column grids); tablet/desktop follow section 5's rules; safe-area
   insets and one-handed reach respected on mobile.
7. Check required states exist per Appendix D for the screen (loading, empty, error,
   permission-denied, etc.) and are visually consistent with the rest of the app.

## Checks

- Every flagged issue references the specific token or rule it violates.
- A screen is not approved with a "we'll fix styling later" note — styling issues
  block the checkpoint like any other defect.

## Output format

```
docs/design/UI_REVIEWS.md   (append one entry per review)
```

Each entry: Screen/component | Pass/fail | Violations found | Token/rule references |
Resolution.

## Stop conditions

- Stop and reject any screen using a banned pattern outright — no exceptions without
  a documented design-direction change approved by the user.
- Stop and escalate if a new pattern is genuinely needed that doesn't fit the current
  token set — propose a token addition rather than a one-off value.
