# Research: Red-life LifeShare

## Question

What is the smallest source-backed route for importing IKEMEN `TeamLifeShare`
without conflating red-life with the existing life/power team bank or claiming
helper/projectile parity?

## Official sources

- IKEMEN `main.go` reads the configured `TeamLifeShare` option and passes the
  resulting flag into the match system:
  [main.go](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/main.go?plain=1).
- IKEMEN `system.go` owns the per-side `lifeShare` flags and initializes them
  from configuration:
  [system.go](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1).
- IKEMEN `char.go` keeps `lifeAdd` separate from red-life mutation, clears
  red-life when life reaches zero, and clamps positive `redLifeSet` values
  between current life and life max when the round is still active:
  [char.go](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/char.go?plain=1).
- The common defaults and character-feature surface are documented by
  [common.const](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/master/data/common.const)
  and [Character features](https://github.com/ikemen-engine/Ikemen-GO/wiki/Character-features).

## Decision

Add `RuntimeRedLifeShareSystem/v0` as a separate root-only adapter. It owns a
team red-life bank only for explicit IKEMEN shared matches, keeps local mode
actor-owned, uses per-actor baselines to reconcile mutation deltas, preserves
zero as the no-red-life sentinel, applies the current-life/life-max clamp, and
clears a KO side. The existing `RuntimeTeamResourceBank/v1` remains limited to
life and power. Helpers stay local and are routed through their existing
controller path; Projectiles and Explods are not admitted.

## Evidence

Required traces prove shared roots mirror the team bank, local roots do not
mirror, and a Helper can mutate red-life locally under a shared root topology:
`synthetic-imported-team-red-life-share`,
`synthetic-imported-team-red-life-local`, and
`synthetic-imported-team-red-life-helper`. The focal suite passes 611/611
tests. Full corpus regeneration, TypeScript 7, build, and repository gates are
batched for the next accumulated checkpoint.

## Blocked

Native `RedLife` trigger expressions, projectile/Explod/team-helper sharing,
round reset/persistence, HUD red-life bars, rollback/netplay, exact round
semantics, and full MUGEN/IKEMEN parity remain separate gates.
