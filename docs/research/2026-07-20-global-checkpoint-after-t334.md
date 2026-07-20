# Global checkpoint after T334

Date: 2026-07-20
HEAD: `4270c8d4`
Scope: FightScreen win-type cause provenance through redirected root and Helper target resources

## Closed slices

- `218ccc33` admits verified first-generation Helper direct HitDef source.
- `2d95a866` carries that identity into Helper-parented Projectile hits.
- `627a6f54` admits same-root root and Helper `LifeAdd`/`LifeSet` RedirectID causes.
- `c461d0e0` admits root active and State -1 `TargetLifeAdd` causes.
- `4270c8d4` admits first-generation Helper `TargetLifeAdd` causes to root victims.

## Global evidence

- `pnpm exec vitest run --testTimeout=30000`: passed, 238 files / 2577 tests.
- `pnpm build`: passed with TypeScript 7, Vite, and 324 transformed modules.
- `pnpm qa:trace`: passed, 633/633 artifacts; 599 required and 34 optional.
- The full test run reports the known jsdom canvas `getContext()` warning in
  canvas-dependent tests; no test failed.
- Build keeps the existing large-chunk advisory: the minified JavaScript chunk
  remains above 500 kB.
- No renderer or UI code changed in T330-T334, so browser smoke remains
  deferred to the next visual surface change.
- The unrelated dirty roadmap and research worktree changes remain unstaged.

## Compatibility report

FightScreen win-type evidence now includes live perfect/clutch facts, root
roster aggregation, direct HitDef and root-owned Projectile causes, root
self-KO, hit-state source ownership, rival attr/guard context, first-generation
Helper direct and Projectile sources, same-root redirected root/Helper resource
causes, root `TargetLifeAdd`, and first-generation Helper `TargetLifeAdd` to
root victims.

Compatibility scores and full-port claims remain unchanged. These slices prove
bounded runtime contracts over the tested corpus; they do not prove complete
MUGEN/IKEMEN parity.

## Open gates

- Helper nested ancestry and Helper-to-Helper result ownership.
- Target red-life, guard-point, and dizzy resource result semantics.
- Reversal/reflection and exact source-slot arbitration.
- Exact target-memory lifetime and multi-target ordering.
- Direct imported screenpack visual/audio proof.
- ZSS/Lua, rollback/netplay, Studio editing breadth, and full parity.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
