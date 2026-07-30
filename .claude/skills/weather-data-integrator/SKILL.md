---
name: weather-data-integrator
description: Builds and maintains El Nino's provider-neutral adapter layer for forecasts, observations, warnings, radar/satellite metadata and space-weather feeds — attribution, licensing, caching, freshness, fallback, outages.
---

# weather-data-integrator

## Purpose

Ensure no weather or space-weather data provider is hard-wired throughout the UI, and
that every integration is honest about freshness, attribution, and failure modes.

## Activation conditions

- Any time a new weather or space-weather data provider is integrated.
- Any time normalisation, caching, or ingestion logic for provider data changes.

## Required inputs

- `specs/El_Nino_FULL_MASTER_Production_Prompt.md` section 17 (weather and
  geospatial data layer) and section 13 (space weather section).
- The specific provider's API documentation, licence terms, and rate limits.

## Workflow

1. Define the provider adapter contract output: source, licence, attribution,
   permitted caching, freshness, geographic coverage, rate limits, failure
   behaviour, cost.
2. Normalise units internally while retaining the original unit and value; store
   times in UTC, display in explicit local time zones.
3. Preserve raw provider payloads/references for audit where licence and retention
   permit; keep provider terminology available alongside the common taxonomy.
4. Make ingestion idempotent — reprocessing a record must never create duplicate
   warnings/events. Deduplicate by provider identifier, update sequence, content
   hash.
5. Never infer official severity from community engagement.
6. Record source freshness and expose it to both operational monitoring and the
   relevant UI (never blend stale data with current data invisibly).
7. Build fallback behaviour for provider outages: last successful update time is
   shown, base product stays usable, no fabricated live data.
8. Write fixtures, adapter tests, and a provider runbook in the same phase the
   provider is introduced (per Appendix F).

## Checks

- Every provider integration has a documented licence and attribution before it
  ships.
- No UI component references a specific provider directly — it goes through the
  adapter/normalised model.
- A simulated provider outage still leaves the base product usable in testing.

## Output format

```
docs/WEATHER_PROVIDERS.md      (source contracts, attribution, licences, freshness, failure behaviour)
docs/RUNBOOKS/<provider>.md    (outage/replay runbook per provider)
```

## Stop conditions

- Stop and escalate if a provider's licence doesn't permit the caching or display
  behaviour the product needs.
- Stop and escalate before treating any provider feed as authoritative for official
  warnings without confirming it is genuinely an official issuing authority.
