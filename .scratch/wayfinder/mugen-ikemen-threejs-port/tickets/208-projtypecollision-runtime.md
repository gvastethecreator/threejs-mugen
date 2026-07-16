# Implement ProjTypeCollision runtime collision policy/v1

Type: task
Status: completed
Blocked by: None

## Question

What bounded runtime contract should the port implement for IKEMEN's `ProjTypeCollision` flag before widening projectile collision parity?

## Answer

Implement one typed v1 policy across the existing runtime collision seams:

- A normalized `AssertSpecial` flag sets actor capability `projTypeCollision`.
- A projectile defender with an active `HitDef` containing `HitFlag = P` cancels overlapping projectiles instead of receiving projectile damage.
- When the flag is active on the defender, projectile contact uses the projectile frame's `Clsn2` boxes. Missing `Clsn2` remains fail-closed for this mode.
- When both players have the flag, direct player contact uses both actors' `Clsn2` boxes for the bounded clash/contact decision.

Keep existing ownership, target memory, guard, priority, and projectile removal seams. Do not infer full parity from this slice.

## Source boundary

- Official changed-controller reference: <https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29>
- Official runtime source: <https://github.com/ikemen-engine/Ikemen-GO/blob/develop/src/char.go>
- `Char.projClsnCheckSingle` forces projectile/character box selection to `Clsn2` when `ASF_projtypecollision` is active.
- `CharList.hitDetectionProjectile` handles `HitFlag = P` projectile cancellation before normal projectile contact.
- `Char.clsnCheckSingle` uses `Clsn2` for the player pair when both actors carry the flag.

## Scope

In scope:

- compiler/runtime representation of `ProjTypeCollision` and `HitFlag`;
- projectile Clsn2 contact mode;
- projectile cancellation against an active projectile-capable HitDef;
- direct player Clsn2 contact when both flags are active;
- focused tests, research note, and closeout evidence.

Out of scope:

- `p2clsncheck`, `p2clsnrequire`, `affectteam`, projectile proxy/depth ordering, exact trade arbitration, rollback/netplay, and full MUGEN/IKEMEN parity;
- score movement without a new required trace or broader acceptance gate.

## Acceptance

- malformed or missing optional inputs fail closed;
- flag-off behavior remains unchanged;
- cancellation removes the projectile through the existing terminal/removal path and does not apply damage;
- Clsn2 mode is observable in focused runtime tests;
- compiler/runtime TypeScript 7 checks pass for the affected surface;
- docs state allowed and blocked compatibility claims.

## Verification plan

- `pnpm exec vitest run src/mugen/runtime/RuntimeAssertSpecialSystem.test.ts src/mugen/runtime/ProjectileCombatSystem.test.ts src/mugen/runtime/RuntimeCombatResolutionSystem.test.ts src/mugen/compiler/RuntimeCompiler.test.ts`
- `pnpm exec tsc -p tsconfig.json --noEmit`
- `git diff --check`

## Outcome

Implemented in `c068de80`. `AssertSpecial ProjTypeCollision` now exposes a typed
actor capability; active `HitFlag = P` cancels overlapping projectiles through
the existing terminal/removal path; flagged projectile contact uses strict
current-frame `Clsn2`; paired flagged players use their current-frame `Clsn2`
for direct and priority admission. Flag-off behavior keeps the existing
HitDef/Clsn1 route.

## Verification

- Focal runtime/compiler batch: 5 files, 110 tests passed.
- `pnpm typecheck`: passed.
- `pnpm build`: passed; Vite emitted only the existing large-chunk warning.
- `pnpm check:boundaries`: passed.
- `pnpm qa:trace`: 633/633 artifacts passed, 599 required and 34 optional.
- `git diff --check`: passed for the feature surface.

The full `pnpm test` batch reached 2257/2259 tests. Two unrelated pre-existing
failures remain: the post-fighter expectation omits already-scheduled self
projectile callbacks, and one round-context test exceeds its five-second local
timeout. They do not touch this feature's files or trace artifacts.

## Closeout

Allowed claim: bounded runtime `ProjTypeCollision` behavior for the four routes
above, backed by focused tests and the existing trace corpus.

Blocked claim: full MUGEN/IKEMEN projectile parity, `p2clsncheck`,
`p2clsnrequire`, `affectteam`, exact trade arbitration, depth/order parity,
rollback/netplay, and score movement.
