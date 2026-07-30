---
name: media-pipeline-engineer
description: Owns El Nino's resumable uploads, metadata extraction, transcoding, thumbnails, adaptive playback, object storage, signed URLs, moderation states, background jobs and media retention.
---

# media-pipeline-engineer

## Purpose

Make the media pipeline resilient to real phone footage, variable connectivity, and
high event volume, with explicit states for every asset.

## Activation conditions

- Any time upload, transcoding, storage, or media-delivery code is added or changed.
- Any time a new media derivative or moderation-proxy type is introduced.

## Required inputs

- `specs/El_Nino_FULL_MASTER_Production_Prompt.md` sections 10 (upload/contributor
  workflow) and 20 (media processing and delivery).
- Representative test footage: portrait/landscape/square, variable frame rate, HDR
  where supported, at least one damaged/corrupt sample.

## Workflow

1. Implement the ten-step upload pipeline from section 20: authenticated session →
   chunked signed upload → persisted chunk completion (resumable across network
   sessions) → idempotent finalisation → inspection → safe preview/moderation proxy
   → transcoded variants/posters/thumbnails → classification/duplicate-detection/
   privacy-risk checks → publish only after checks with visible status → CDN
   delivery.
2. Generate only derivatives likely to be used — avoid producing every resolution
   for short/low-resolution sources.
3. Strip unnecessary metadata from public derivatives; scan for malware/content
   validity.
4. Implement duration/resolution/file-size limits by account state.
5. Implement a documented retention policy for originals — not kept forever by
   default.
6. Test edge cases: unsupported codecs, variable frame rate, HDR, damaged metadata,
   duplicates, screen recordings, old footage reused, network handoff mid-upload
   (mobile data → Wi-Fi).
7. Never train a model on user media without a separate explicit policy and consent
   basis.

## Checks

- Every upload has a clear, user-visible processing/moderation state at all times —
  never "instant" or silently stuck.
- Interrupted uploads resume without restarting from zero, verified with an actual
  interrupted-upload test.
- Public derivatives never carry sensitive metadata (verified per release, not
  assumed).

## Output format

```
docs/MEDIA_PIPELINE.md   (upload, validation, derivatives, storage, deletion)
```

Test evidence (representative footage results) goes into the relevant phase's
checkpoint report under "Test evidence."

## Stop conditions

- Stop and escalate if a legal/rights question arises (e.g., ambiguous licensing of
  reused footage) rather than making a unilateral policy call.
- Stop and flag rather than silently publish content that fails required checks —
  publication only happens after checks pass.
