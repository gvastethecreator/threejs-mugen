# Research: Redirect lease migration

Date: 2026-07-16
Question: What can be centralized safely after RedirectID characterization and
lease v1.1 without claiming an immutable transaction or full engine parity?

## Primary sources

- [IKEMEN-GO repository](https://github.com/ikemen-engine/Ikemen-GO) documents
  the upstream engine as a MUGEN-resource-compatible engine whose goal includes
  MUGEN 1.1 Beta backwards compatibility.
- [IKEMEN-GO releases](https://github.com/ikemen-engine/Ikemen-GO/releases)
  show that redirect behavior continues to receive compatibility fixes, so the
  migration preserves route traces and keeps the formal ADR decision separate.
- `docs/adr/0006-runtime-redirected-target-dispatch.md` defines the local
  acceptance bullets and explicitly keeps rollback/netplay outside this module.
- [Wayfinder T12 audit](2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-229.md)
  requires one revalidating owner, duplicate deletion, focused route families,
  and boundary/deletion evidence.

## Findings

1. A lease can safely own the timing of revalidation and commit callbacks even
   while concrete Target semantics remain in `TargetSystem`.
2. The mutation set must be selected before wrapper writeback. Passing every
   candidate to `commitActor` made helper ownership broader than the operation's
   observed mutation set; the migration removes that widening for target/bind.
3. Resource redirects currently use an empty candidate projection, so the
   shared helper commit owner preserves their existing destination-only scope.
4. Observation construction and telemetry identity are different ownership
   concerns. The lease module builds the route-shaped fact; the telemetry world
   assigns the sequence and stores cloned projections.
5. A deletion guard is useful here because the risky regression is architectural
   duplication, not a single controller output. The guard fails if helper loops
   or adapter-owned observation literals return.

## Decision impact

The bounded migration is implemented in `RuntimeRedirectedTargetDispatchSystem`,
`HelperSystem`, `PlayableMatchRuntime`, and the redirect boundary script. It
preserves the four route traces and adds a focused unselected-byte identity
assertion. ADR 0006 remains proposed pending the formal state-owner decision.

## Remaining uncertainty

The lease still receives state ownership from runtime adapters and does not own
the complete state-program lookup policy. A future acceptance decision must
either justify that boundary or add the registry-owned contract, with separate
evidence for helper TargetState remaining blocked.
