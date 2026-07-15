# Helper Target* RedirectID closeout

Date: 2026-07-15

## Status

Implemented and verified as a bounded IKEMEN helper ownership slice.

Runtime commit: `bc2ecbe1`.
Test and trace commit: `c845b903`.

## Delivered behavior

Helper `TargetLifeAdd`, `TargetPowerAdd`, `TargetVelSet`, `TargetVelAdd`,
`TargetFacing`, `TargetBind`, and `TargetDrop` now resolve `RedirectID` to a
live root `PlayerID` destination in the `ikemen-go` runtime. The redirected
controller runs against the destination root's target memory while preserving
the helper-authored target ID and operation payload. Invalid or unsupported
redirects fail closed before mutation and emit the existing blocked-route
telemetry.

The resolver is propagated through active helper advancement, post-fighter
interaction advancement, and hit-pause presentation advancement. Redirected
controllers and operations are attributed to the destination root's
compatibility telemetry.

## Evidence

- Focal helper/runtime/trace tests: `868/868` passed across 3 files.
- Full trace QA: `pnpm run qa:trace` passed `626/626` artifacts.
- Required/optional split: `592` required, `34` optional, `0` skipped.
- Required artifact: `synthetic-imported-helper-target-redirect`, checksum
  `5ad31141`.
- TypeScript 7 check: `pnpm run typecheck` passed.
- Production build: `pnpm run build` passed.
- Boundary audit: `pnpm run check:boundaries` passed.
- Trace runner syntax: `node --check scripts/qa_traces.cjs` passed.
- Diff hygiene: `git diff --check` passed before both feature commits.

## Audit

The closeout covers compiler-provided RedirectID expressions, helper dispatch,
destination-root PlayerID resolution, destination-owned target-memory lookup,
telemetry ownership, hit-pause propagation, invalid-route fail-closed
behavior, and the seven Target* controller families listed above. The required
trace keeps both memories visible: helper-local target `8881` remains distinct
from destination-root target `77`, so the route cannot pass by accidentally
reusing the caller's target memory.

## Official basis

- [IKEMEN RedirectID state-controller documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  defines optional PlayerID redirection and separates redirected execution
  from custom-state transfer.
- [Elecbyte Target* controller documentation](https://www.elecbyte.com/mugendocs/sctrls.html)
  defines the legacy caller target-memory operations and authored filters.

## Scope ceiling

No claim is made for helper destinations, helper State -1/global-state
controllers, helper `BindToTarget`, helper TargetState/custom-state transfer,
projectiles, teams, neutral identities, recursive redirects, exact
multi-target ordering, persistence, rollback/netplay, presentation score, or
full MUGEN/IKEMEN parity.

## Next frontier

Source-backed selection for helper `BindToTarget` RedirectID. Keep its binding
anchor/duration semantics independent from TargetState and custom-state
ownership.
