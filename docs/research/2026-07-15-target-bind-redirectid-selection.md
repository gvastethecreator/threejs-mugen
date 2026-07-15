# TargetBind RedirectID selection research

Date: 2026-07-15

## Question

Which Target* family should follow the TargetDrop RedirectID implementation
without widening helper identity, target actor state ownership, or team
aggregation?

## Answer

Select `TargetBind`. It already has typed target binding, duration, offset,
logical-Z, binding cleanup, pause advancement, and target-link telemetry. The
missing seam is the same bounded root PlayerID RedirectID route plus State -1
setup classification. `TargetState` is deferred because it transfers target
state ownership and custom-state lifetime, which is a separate compatibility
boundary.

## Official source basis

- [Elecbyte TargetBind documentation](https://www.elecbyte.com/mugendocs/sctrls.html)
  defines binding all or selected targets to an offset relative to the
  executing player's axis, with optional target ID and finite `time`.
- [IKEMEN RedirectID documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  defines optional PlayerID execution redirection for state controllers and
  warns that processing order can limit individual controllers.

## Repository findings

1. `TargetBind` already lowers to a typed operation with target ID, offset,
   and duration; `RuntimeTargetWorld` owns target matching and bindings.
2. Active and State -1 target dispatch already share
   `RuntimeTargetControllerDispatchWorld` and the same root redirect resolver.
3. `TargetBind` is currently excluded from the redirectable target union and
   the State -1 setup allowlist; no new target actor type is required.
4. Existing runtime behavior applies the caller's facing-relative offset and
   stores binding memory on the executing owner, so the bounded route can
   preserve caller-authored parameters while moving ownership to the live
   destination root.

## Bounded implementation

- profile: `ikemen-go`;
- owners: live root fighters only;
- paths: active CNS and imported State -1 setup;
- controller: `TargetBind`;
- destination: live root selected by PlayerID;
- payload: caller-owned target ID, offset, logical Z, and duration;
- memory: destination target list and binding records only;
- missing RedirectID: preserve local behavior;
- invalid, negative, unavailable, disabled, destroyed, malformed, and legacy
  redirects: fail closed before mutation;
- no helpers, projectiles, teams, target actor custom-state transfer,
  cross-localcoord scaling, presentation, persistence, rollback/netplay, or
  full-parity claim.

## Evidence plan

Use paired required imported traces. Active routing must establish reciprocal
target memories, then prove the redirected destination binds its remembered
target while the caller's target memory remains independently owned. State -1
routing must repeat this after both links exist. Assert binding offset,
remaining lifetime, link telemetry, and invalid RedirectID non-mutation.

## Remaining uncertainty

The official RedirectID page leaves its incompatible-controller list
unfinished. Exact multi-target binding order, pause-phase ordering, helper and
team ownership, and cross-localcoord behavior remain outside this slice.
