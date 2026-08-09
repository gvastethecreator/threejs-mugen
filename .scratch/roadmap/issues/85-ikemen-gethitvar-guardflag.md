# Issue 85 — Ikemen-GO `GetHitVar(guardflag)` comparison

Status: closed-bounded
Lane: I2
Priority: P1
Dependency: issue 84 / T510
Date: 2026-08-02

## Official contract

The current Ikemen-GO changed-trigger reference defines
`GetHitVar(guardflag)` as the `guardflag` of the last HitDef that hit the
player. It requires comparison with known flags, for example
`GetHitVar(guardflag) = L`. Current Ikemen-GO source copies `hd.guardflag` to
`ghv.guardflag`; its compiler expands `M` to `H|L`, and its bytecode returns
true when the stored and requested flag masks overlap.

Sources:

- [Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)
- [Ikemen-GO `compiler.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
- [Ikemen-GO `bytecode.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)
- [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Implementation boundary

- Retain the effective direct or Projectile HitDef guard flag in last-hit
  metadata, including the runtime `MA` default.
- Evaluate static `=` and `!=` filters by flag overlap, including `M = H|L`.
- Resolve the flag from the active expression actor so redirects remain valid.
- Return false when no last-hit guard flag is available.

## Required evidence

- Focused compiler, evaluator, runtime-context, direct, Projectile, and Helper
  tests.
- Full `pnpm qa:trace`, typecheck, build, boundaries, and diff hygiene.
- Browser smoke: N/A; no visible route or renderer changes.

Closed evidence: 6 focused files / 224 tests; `pnpm typecheck`; 356-module
production build; `pnpm check:boundaries`; and 682/682 trace artifacts (648
required, 34 optional). The broad suite remains at the inherited retired-roster
baseline: 14 failed / 311 passed files and 58 failed / 3277 passed tests.

## Claim ceiling

This issue covers static last-hit guard-flag comparisons only. It does not add
general string-valued GetHitVar results, dynamic filters, the wiki-nightly
`GetHitVar(hitflag)` field, `GetHitVarSet`, broader custom-state/team ownership,
or full M.U.G.E.N/Ikemen parity.
