# Issue 71 — Ikemen-GO `GetHitVar(zvel)` readback

- **Status:** closed-bounded
- **Priority:** I2
- **Lane:** runtime / expression context
- **Dependency:** Issue 66 / T481

## Scope

Expose the optional third component already selected by the active HitDef or
Projectile velocity as Ikemen-GO `GetHitVar(zvel)`. The read returns the
current `hitVelocity.z` and falls back to `0` when the active hit has no depth
component. M.U.G.E.N's legacy `GetHitVar` list remains unchanged; this is an
Ikemen-only read-model extension.

## Authority

- [Elecbyte M.U.G.E.N 1.1 trigger reference](https://www.elecbyte.com/mugendocs-11b1/trigger.html)
- [Ikemen-GO `char.go` GetHitVar fields and hit assignment](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Evidence

- `src/mugen/runtime/RuntimeHitVarSystem.ts` returns `hitVelocity.z` for the
  `zvel` key with an omitted-depth zero fallback.
- `src/tests/RuntimeExpressionContextSystem.test.ts` covers direct readback,
  omitted fallback and the shared expression-context path.
- Focused runtime context gate: 27 tests passed.
- Final gates: `pnpm test` 324 files / 3321 tests, `pnpm typecheck`,
  `pnpm build`, `pnpm check:boundaries`, `pnpm qa:trace` 682/682 and
  `git diff --check` pass.

## Claim ceiling

This issue does not claim M.U.G.E.N `zvel` compatibility, depth physics,
localcoord scaling, fall Z velocity, or broader Ikemen GetHitVar extensions.
