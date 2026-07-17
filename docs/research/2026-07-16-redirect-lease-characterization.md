# Research: Redirect lease characterization

Date: 2026-07-16
Question: What evidence must the current bounded RedirectID routes retain
before a lease v1.1 migration can consolidate resolution, mutation, writeback,
and telemetry?

## Primary sources

- [IKEMEN-GO repository](https://github.com/ikemen-engine/Ikemen-GO) describes
  the engine as an open-source engine that supports MUGEN resources and targets
  backwards compatibility with MUGEN 1.1 Beta.
- [IKEMEN-GO releases](https://github.com/ikemen-engine/Ikemen-GO/releases)
  list redirect-related fixes and trigger-redirection additions, which is a
  reminder that RedirectID behavior is compatibility-sensitive and should be
  characterized before refactoring.
- [Wayfinder T10 audit](2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-229.md)
  defines the local acceptance boundary: caller, destination, candidates, state
  owner, selected ids, mutation/writeback, and telemetry identity, with no ADR
  acceptance at this step.

## Findings

1. `RuntimeTargetControllerDispatchWorld` already computes selected and
   operation-specific mutated ids. The missing observation was the candidate
   projection supplied to that dispatcher.
2. Root active and State -1 routes mutate the destination target world directly.
   Their characterization can therefore expose the mutation set as the direct
   writeback projection without changing execution ownership.
3. Helper routes execute against a helper/root target actor and then invoke the
   existing `commitActor` loop for the destination plus candidate wrappers. The
   trace must keep that broad set visible instead of presenting it as the exact
   mutation set.
4. A route-derived identity is too easy to duplicate when several redirects
   occur in one compatibility tick. The telemetry owner now assigns a
   monotonic per-imported-root sequence and clones all identity arrays into the
   session projection.
5. Destination revisions are recorded when the current lease supplies them,
   but generation-aware same-id invalidation remains a T11 responsibility.

## Decision impact

T10 is implemented in `RuntimeRedirectedTargetDispatchSystem` adapters,
`TargetSystem`, `HelperSystem`, `PlayableMatchRuntime`, and compatibility
telemetry. The evidence is descriptive only. It intentionally does not claim
that helper wrapper writeback is already a single authoritative commit owner.

## Remaining uncertainty

T11 must decide the typed failure result, actor generation/freshness contract,
operation class, and the exact mutation boundary for each controller family.
The helper-destination TargetState question remains separately blocked by ADR
0006 and its own source-backed decision.
