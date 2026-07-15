# Helper Target* RedirectID selection

Date: 2026-07-15

## Question

Can an IKEMEN helper route its Target* controllers through a live
`RedirectID` destination without reusing the helper caller's target memory?

## Answer

Yes, for a bounded first-generation helper state route. Resolve the authored
`RedirectID` to a live root `PlayerID`, then execute the helper's Target*
operation against that root's target memory. Preserve the helper-authored
`ID` and operation payload. Reject unavailable or unsupported destinations
before mutation.

## Official sources

- [Elecbyte state-controller reference](https://www.elecbyte.com/mugendocs/sctrls.html)
  describes `TargetLifeAdd`, `TargetPowerAdd`, `TargetVelAdd`, `TargetVelSet`,
  `TargetFacing`, `TargetBind`, and `TargetDrop` as operations over the
  caller's remembered targets and their authored filters/payloads. The legacy
  reference does not define IKEMEN `RedirectID`.
- [IKEMEN state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  defines `RedirectID` as an optional `PlayerID` execution redirect available
  to state controllers. It also distinguishes redirected execution from
  transferring the caller into another player's state list.
- [IKEMEN releases](https://github.com/ikemen-engine/Ikemen-GO/releases)
  provide the upstream release record used as a secondary sanity check for
  the breadth of RedirectID support; exact helper semantics remain bounded by
  the wiki contract and local traces.

## Findings

1. Legacy Target* semantics are caller-owned target-memory semantics. A
   RedirectID route must switch ownership before resolving the target filter;
   applying the filter to the helper's local memory would be a false positive.
2. The runtime needs propagation through active helper advancement, the
   post-fighter helper pass, and IKEMEN hit-pause presentation advancement.
   Losing the callback at any one boundary silently turns a valid redirect into
   a helper-local mutation or a blocked controller.
3. The bounded route now covers helper `TargetLifeAdd`, `TargetPowerAdd`,
   `TargetVelSet`, `TargetVelAdd`, `TargetFacing`, `TargetBind`, and
   `TargetDrop`. Redirected controller and operation telemetry is recorded on
   the destination root.

## Boundary

- Profile: `ikemen-go`.
- Caller: live helper state controller.
- Destination: live root fighter resolved by `PlayerID`.
- Target selection: destination root target memory, preserving authored `ID`.
- Failure behavior: invalid, missing, non-root, unavailable, or unsupported
  destinations fail closed before mutation.

Helpers targeting another helper, helper State -1/global-state execution,
projectile-owned target memories, team/neutral identities, recursive redirect
chains, exact multi-target ordering, and full MUGEN/IKEMEN parity remain open.

## Local evidence

- Runtime ownership path: `bc2ecbe1`.
- Fixture, trace registration, and tests: `c845b903`.
- Required trace: `synthetic-imported-helper-target-redirect`, checksum
  `5ad31141`.
- Batch trace matrix: `626/626` passed, `592` required, `34` optional,
  `0` skipped.

## Next decision

Select helper `BindToTarget` RedirectID as the next independent helper-owned
binding boundary only after its source semantics are documented. Keep helper
TargetState/custom-state transfer separate from binding ownership.
