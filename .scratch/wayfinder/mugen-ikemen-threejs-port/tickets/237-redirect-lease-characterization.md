# Characterize redirected-target dispatch traces

Date: 2026-07-16
Type: task
Status: resolved
Blocked by: None

Implementation commits: `f2e9521f`, `5088f6b8`, `e894c10e`

## Question

Can the current bounded RedirectID routes expose enough identity to audit
caller, destination, candidates, state ownership, mutation, wrapper writeback,
and telemetry without changing runtime behavior?

## Answer

Yes, at characterization scope. The existing target dispatch result now carries
the candidate actor projection. The compatibility observation adds destination
revision, a per-imported-actor telemetry identity, exact mutation ids, and a
writeback projection. Root routes classify writeback as direct runtime state;
helper routes classify the existing post-dispatch wrapper commit set.

## Contract

- Routes: `root-active`, `root-state-minus-one`, `helper-to-root`, and
  `helper-to-helper`.
- Identity: `redirect:<imported-root-id>:<monotonic-sequence>` is assigned by
  `RuntimeCompatibilityTelemetryWorld`, not by route adapters.
- Candidates: `candidateTargetIds` is the deduplicated candidate projection
  passed to the target dispatcher.
- Mutation: `mutatedActorIds` remains the operation-specific TargetSystem
  result.
- Writeback: `writebackActorIds` records the direct mutation set for root
  routes and the existing wrapper commit set for helper routes;
  `writebackMode` distinguishes those meanings.
- Ownership: `callerId`, `destinationId`, `stateOwnerId`, and optional
  `destinationRevision` remain visible in every recorded redirected dispatch.
- Ordering: helper telemetry is emitted after the existing wrapper commit has
  completed, so the observation describes the commit boundary it reports.

## Boundaries

This is a no-score characterization cut. It does not select a lease v1.1
failure union, actor generation model, single commit owner, recursive
redirect support, rollback, or helper-destination TargetState support. ADR 0006
remains proposed until T11 and the later migration/deletion evidence.

## Evidence target

- Runtime route tests must pin all four route names and the required identity
  fields.
- TargetSystem tests must show candidates are not widened into selected or
  mutated actors.
- Telemetry tests must show identities are unique and projections are cloned
  into the compatibility session.
