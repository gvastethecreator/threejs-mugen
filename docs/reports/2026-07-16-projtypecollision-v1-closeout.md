# ProjTypeCollision v1 closeout

Date: 2026-07-16
Commit: `c068de80`
Wayfinder: ticket 208

## Task state

Completed for bounded v1. The implementation follows the official IKEMEN
`ProjTypeCollision` contract without widening the compatibility claim beyond
the routes proved in this slice.

## Delivered

- `AssertSpecial ProjTypeCollision` lowers into typed runtime capability
  `projTypeCollision`.
- `HitDef hitflag` lowers into `DemoMove.hitFlag`.
- Active projectile defense with `HitFlag = P` cancels overlapping projectiles,
  records defender projectile-cancel memory, and uses the existing removal and
  terminal-playback path without applying damage.
- Flagged projectile contact selects strict current-frame `Clsn2`; missing
  `Clsn2` fails closed instead of falling back to the authored projectile
  hitbox.
- When both players assert the flag, direct contact and priority-clash
  admission compare both actors' current-frame `Clsn2` boxes.

## Evidence

Primary sources:

- [IKEMEN-GO changed state controllers](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29)
- [IKEMEN-GO `src/char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/develop/src/char.go)
- Local research: `docs/research/2026-07-16-projtypecollision.md`

Focused proof:

- `RuntimeAssertSpecialSystem.test.ts`
- `RuntimeCompiler.test.ts`
- `HitDefSystem.test.ts`
- `ProjectileCombatSystem.test.ts`
- `RuntimeCombatResolutionSystem.test.ts`
- Result: 5 files, 110 tests passed.

Batch gates:

- `pnpm typecheck`: passed.
- `pnpm build`: passed.
- `pnpm check:boundaries`: passed.
- `pnpm qa:trace`: 633/633 artifacts passed, 599 required and 34 optional.
- `git diff --check`: passed for the feature surface.

## Quality audit

Artifact verdict: win for the bounded v1 acceptance target.

Verification state: limited for repository-wide test health. `pnpm test`
reached 2257/2259 tests; the two failures are unrelated to this diff: a
post-fighter expected-call list that predates already-scheduled self-projectile
callbacks, and a round-context test that exceeds its five-second local timeout.
No browser gate applies because this slice changes compiler/runtime collision
semantics only.

## Claim ceiling

Allowed: typed `ProjTypeCollision`, strict projectile `Clsn2` contact,
`HitFlag = P` cancellation, and paired-player `Clsn2` contact/priority
admission in the existing runtime world.

Blocked: full MUGEN/IKEMEN projectile parity, `p2clsncheck`, `p2clsnrequire`,
`affectteam`, exact projectile trade arbitration, proxy/depth/order behavior,
rollback/netplay, and score movement.

## Next frontier

Use Wayfinder 209 to characterize exact projectile trade and cancellation
ordering against the remaining `p2` collision parameters before extending the
runtime policy.
