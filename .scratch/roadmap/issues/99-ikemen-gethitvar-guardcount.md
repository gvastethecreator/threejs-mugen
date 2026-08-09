# Issue 99 — Ikemen-GO `GetHitVar(guardcount)` readback

Status: closed-bounded
Lane: I2
Priority: P1
Dependency: issue 98 / T524
Date: 2026-08-02

## Official contract

The current Ikemen-GO changed-trigger documentation and `develop` compiler
expose `GetHitVar(guardcount)` as the guard-count value retained by the last
get-hit record. This is not the boolean `GetHitVar(guarded)`, the authored
HitDef `guardpoints`, or the defender's mutable guard resource.

Sources to verify before implementation:

- [Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)
- [Ikemen-GO `compiler.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
- [Ikemen-GO `bytecode.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)
- [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Official-source verification — 2026-08-02

The current wiki defines `GetHitVar(guardcount)` as the integer number of hits
the player has guarded without a chance to fight back. `compiler.go` maps the
reader to `OC_ex_gethitvar_guardcount`, and `bytecode.go` reads
`c.ghv.guardcount`; the same bytecode file also exposes `GetHitVarSet` writes,
which remain outside this bounded cut.

`char.go` makes the lifetime explicit:

1. `GetHitVar.guardcount` is an `int32` field initialized to zero by
   `GetHitVar.reset`.
2. The normal guard branch (`hitResult == 2`) increments it once per guarded
   HitDef contact after `selectiveReset` preserves stackable fields.
3. `selectiveReset` saves/restores it across successive contacts, so a normal
   hit does not erase the accumulated guard count.
4. When the actor is no longer in `MT_H`, the idle cleanup explicitly sets
   `ghv.guardcount = 0`; the source comment contrasts this with `hitcount`, which
   intentionally does not reset there.

The local bounded contract therefore uses an optional `RuntimeGetHitVars.guardCount`
field: direct and Projectile guard contacts increment it, non-guard contacts
carry it forward, and the runtime clears it when the actor returns to idle. It
does not implement `GetHitVarSet`, ReversalDef ownership, or a separate
"chance to fight back" scheduler.

## Implementation boundary

- Keep the verified cumulative guard counter and idle reset order explicit.
- Add only the typed direct/Projectile contact metadata needed by the reader;
  do not add mutable controller writes in this slice.
- Cover direct and Projectile guard contacts at the smallest shared seam;
  avoid conflating it with `guarded`, `guardpoints`, or current guard resource.
- Leave dynamic guard-count writes, redirects, teams, and full get-hit VM parity
  outside the first cut.

## Required evidence

- Official-source notes with the exact write, read, and reset locations.
- Focused compiler/runtime/direct/projectile tests for explicit, repeated, and
  missing/default paths as applicable.
- `pnpm qa:trace`, typecheck, build, boundaries, diff hygiene, and a full-suite
  baseline capture.
- Browser: N/A unless the contract adds visible debug telemetry.

## Claim ceiling

This issue covers bounded cumulative `GetHitVar(guardcount)` readback for direct
and player-owned Projectile guard contacts while the defender remains in the
local get-hit state. It does not claim `GetHitVarSet`, ReversalDef, an exact
upstream "chance to fight back" scheduler, redirects/teams, or full
M.U.G.E.N/Ikemen parity.

## Closeout evidence

- Official source notes above pin the compiler opcode, bytecode read, guard
  increment, selective persistence, and idle reset locations.
- Focused Vitest: 6 files / 220 tests passed (`RuntimeCompiler`,
  `RuntimeExpressionContextSystem`, `RuntimeHitEligibilitySystem`,
  `RuntimeStunSystem`, `DirectCombatSystem`, `ProjectileCombatSystem`).
- `pnpm typecheck`: passed.
- `pnpm qa:trace`, production build, boundaries, diff hygiene, and the
  full-suite baseline are recorded in the continuation closeout; the broad
  smoke remains unknown because its 180-second attempt timed out.
