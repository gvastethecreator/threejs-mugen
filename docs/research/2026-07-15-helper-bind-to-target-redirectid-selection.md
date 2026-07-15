# Helper BindToTarget RedirectID selection

Date: 2026-07-15

## Question

Can a helper route `BindToTarget` through IKEMEN `RedirectID` while keeping
the authored target ID, position anchor, logical Z, and binding duration
owned by the redirected destination?

## Answer

Yes, for a bounded live-root helper state route. `RedirectID` changes the
actor that executes the controller; that destination then resolves its own
remembered target using the authored `ID`. The existing generic helper target
dispatch already supports `bindtotarget`, so this slice closes the boundary
with dedicated runtime and trace evidence rather than adding duplicate core
logic.

## Official sources

- [Elecbyte state-controller reference](https://www.elecbyte.com/mugendocs/sctrls.html)
  defines `BindToTarget` as binding the player to a specified target, with
  optional `time`, `ID`, and `pos`/`postype`; Mid and Head anchors use target
  constants and are not guaranteed to match a visual body point.
- [IKEMEN RedirectID documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  defines an optional PlayerID execution redirect for legacy and new state
  controllers, distinct from custom-state transfer. It warns that controller
  processing order can make some controllers unsuitable for redirection.

## Decision

Keep the generic helper route and prove the following narrow contract:

1. Resolve helper `RedirectID = 57` to live root `p2`.
2. Resolve helper-authored `ID = 77` against `p2`'s target memory, which
   points to `p1`.
3. Preserve `pos = 20,-8,Mid`, `posz = 6`, and `time = 4`.
4. Keep the helper's local bind state untouched.
5. Fail closed when the redirect destination is unavailable.

## Boundary

Live helper state, `ikemen-go`, root PlayerID destination, and existing
`BindToTarget` dispatch only. Helper-to-helper destinations, helper State -1,
helper TargetState/custom-state transfer, projectile/team ownership, exact
multi-target order, recursive redirects, pause-order parity, persistence,
rollback/netplay, and full MUGEN/IKEMEN parity remain outside the slice.

## Local evidence

- Valid fixture and trace: `a13746bb`.
- Invalid redirect rejection: `3e14d378`.
- Required artifact: `synthetic-imported-helper-bind-to-target-redirect`,
  checksum `f4c7b7f4`, final checksum `07898058`.
- Full trace matrix: `627/627` passed, `593` required, `34` optional,
  `0` skipped.

## Next decision

Select helper `TargetState`/custom-state ownership as a separate research
frontier. Do not combine it with binding anchors or target-memory mutation.
