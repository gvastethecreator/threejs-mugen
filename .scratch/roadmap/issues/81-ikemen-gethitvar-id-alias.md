# Issue 81 — Ikemen-GO deprecated `GetHitVar(ID)` alias

Status: closed-bounded
Lane: I2
Priority: P1
Dependency: issue 80 / T506
Date: 2026-08-02

## Official contract

The current Ikemen-GO changed-trigger reference keeps the old `ID` syntax for
`GetHitVar` valid while marking it deprecated in favor of `playerid`.

Source:

- [Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)

## Implemented boundary

- Resolve case-insensitive `GetHitVar(ID)` through the T506 numeric
  `sourcePlayerId` read model.
- Preserve the same `0` fallback when no numeric hit source exists.
- Do not add a second metadata field or widen string-valued GetHitVar support.

## Evidence

- Focused `RuntimeExpressionContextSystem`: 1 file / 27 tests passed.
- Direct `runtimeHitVar(..., "ID")`, missing-source fallback, and parsed
  `GetHitVar(ID)` evaluation all return the T506 numeric identity contract.
- Existing T506 propagation coverage remains authoritative; no runtime state
  or trace shape changed in this alias-only cut.
- Browser smoke: N/A; no visible route changed.

## Claim ceiling

This issue does not claim string-valued `attr`, `hitflag` or `guardflag`,
unverified custom-state/team ownership, score movement, or full parity.
