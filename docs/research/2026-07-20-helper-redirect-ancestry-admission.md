# Helper RedirectID ancestry admission

Date: 2026-07-20
Ticket: T341
Status: implemented at bounded stale-caller scope

## Question

Should Helper `RedirectID` target and resource controllers require the caller's
live parent chain to reach its declared root before dispatch?

## Answer

Yes for `ikemen-go`. The pinned runtime resolves PlayerID targets from live
character identity, so a valid destination does not make a stale or corrupted
Helper caller valid. The production entry point now reuses
`PlayableMatchRuntime.verifiedRootForHelper` before target or resource dispatch.

## Findings

The prior path checked PlayerID destination identity and dispatch leases, then
allowed the controller to proceed without validating the caller Helper's
parent/root links. A caller whose parent link changed after registration could
therefore reach a valid destination while its source identity was stale.

The new guard runs before target projection, so it covers `Target*` and
`BindToTarget` routes. Resource redirects reuse the same resolver. Telemetry
also resolves the caller root through the strict verifier in `ikemen-go`; the
legacy fallback stays scoped to profiles that do not use the IKEMEN identity
registry.

## Evidence

- Existing nested valid RedirectID coverage remains green.
- New Playable integration test mutates a live Helper parent link to a missing
  actor and verifies destination PowerSet does not run and the redirect is
  logged as blocked.
- Playable focal: 1 file / 281 tests passed.
- TypeScript 7 typecheck passed.
- Diff hygiene passed.

## Uncertainty and limits

This proves stale caller admission and existing valid routes. It does not
prove recursive dispatch lease behavior, Helper-victim cause attribution,
reversal/reflection source rules, exact timing, screenpack rendering, or full
MUGEN/IKEMEN compatibility.

## Decision

Keep RedirectID caller admission behind the same live ancestry verifier used
by combat source and TargetLifeAdd cause paths. Next ownership work must use a
separate focused source question rather than widening this guard implicitly.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- `.scratch/external/Ikemen-GO/src/bytecode.go`
- `.scratch/external/Ikemen-GO/src/char.go`
