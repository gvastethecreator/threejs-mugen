# Issue 84 — Ikemen-GO `GetHitVar(attr)` comparison

Status: closed-bounded
Lane: I2
Priority: P1
Dependency: issue 83 / T509
Date: 2026-08-02

## Official contract

The current Ikemen-GO changed-trigger reference defines `GetHitVar(attr)` as
the last HitDef attribute assignment and requires comparison against known
attribute flags, such as `GetHitVar(attr) = SCA, HA`. Current Ikemen-GO source
retains the HitDef `attr` value in get-hit variables.

Sources:

- [Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)
- [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Implemented boundary

- Compile static state and attack attribute literals used by current Ikemen.
- Evaluate `=` and `!=` against the defender's existing `sourceAttr` metadata.
- Preserve redirected actor evaluation by resolving the attribute from the
  active expression context.
- Return false when no last-hit attribute is available.

## Required evidence

- Focused compiler, shared evaluator, and runtime-context slice:
  3 files / 118 tests passed.
- Full `pnpm qa:trace`: 682/682 artifacts passed, 648 required and 34 optional.
- TypeScript, 356-module production build, boundaries, and diff hygiene pass.
- Browser smoke: N/A; no visible route or renderer changes.

## Claim ceiling

This issue covers static equality and inequality filters only. It does not add
general string-valued GetHitVar results, dynamic filter construction,
`guardflag`, `hitflag`, score fields, or full M.U.G.E.N/Ikemen parity.
