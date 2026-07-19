# Round No-damage Window Closeout

Date: 2026-07-18  
Ticket: Wayfinder 279  
Implementation commits: `daf0996b`, `25137c29`

## Result

The runtime now maps imported `fight.def` `over.hittime` into the resolved
round timing contract and exposes a typed internal no-damage predicate for
KO/time-over close frames. While active, the post-fighter interaction boundary
does not admit direct HitDefs, reversals, priority outcomes, HitDef target
commits, projectile combat, or helper combat. Target/effect maintenance,
projectile cancellation, body push, bindings, clamps, and presentation still
advance.

The public playable regression starts a new imported HitDef during a time-over
close and proves the attacker reaches state `200` while the defender's life
stays at `1000`. The round snapshot shape and existing behavior checksums do
not gain a new field.

## Evidence

- `pnpm exec vitest run src/tests/RuntimeRoundSystem.test.ts src/tests/MatchInteractionSystem.test.ts src/tests/RuntimeMatchPostFighterSystem.test.ts src/tests/PlayableMatchRuntime.test.ts src/tests/MugenSystemAssetsLoader.test.ts`: passed, `5` files / `287` tests.
- Boundary-focused rerun after the final correction: `3` files / `15` selected tests passed, including the inverted interval and inclusive wait boundary.
- `pnpm typecheck`: passed with TypeScript `7.0.2` after the final boundary-only correction.
- `git diff --check`: passed for both implementation commits.
- Full `pnpm test`, production build, browser smoke, and `qa:trace` are deferred to the next grouped runtime checkpoint; no trace golden was intentionally changed by this slice.

## Ownership and risk

| Surface | Result |
| --- | --- |
| `RuntimeRoundSystem` | Owns normalized `overHitTimeFrames` and internal no-damage read model. |
| `RuntimeMatchPostFighterWorld` | Forwards the round close predicate without owning combat semantics. |
| `RuntimeMatchInteractionWorld` | Gates combat admission while preserving maintenance/presentation order. |
| Imported runtime | Uses `fight.def` timing when no explicit `roundTiming` override exists. |
| Snapshot/trace schema | Unchanged; no new checksum input or public field. |

## Claim ceiling

Allowed: bounded local source mapping and direct interaction-gate behavior for
the tested single-pair/imported time-over route. Blocked: complete resource
controller suppression, exact MUGEN/IKEMEN frame-start order, `over.forcewintime`,
skip input, fade/motif/dialogue release, Common1/ZSS ownership, score movement,
rollback/netplay, full team/Turns choreography, and full MUGEN/IKEMEN parity.

## Next frontier

The next release-ownership slice is `over.forcewintime` and resource-controller
suppression evidence, followed by exact release/fade/motif boundaries. These
remain separate contracts so this bounded combat gate does not inflate the
global compatibility score.
