# Issue 122 — Ikemen `ProjVar` flag comparisons

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime reads`
- Priority: `P1`

## Objective

Compare official `ProjVar` flag parameters with the projectile HitDef metadata
already stored by the port. Add bounded comparisons without exposing a general
string expression channel.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` treats `attr`, `guardflag`, and
`hitflag` as special `ProjVar` parameters. `compiler.go` requires `=` or `!=`;
for `!=` it complements the compiled bit mask. `bytecode.go` still evaluates
mask overlap against the selected projectile's HitDef metadata. Missing
projectiles return the undefined bytecode value. The source is MIT licensed.

## Implementation

- T547's dynamic ID/index selection, caller ownership, oldest-first order, and
  redirects select the projectile.
- A bounded expression rewrite recognizes static `attr`, `guardflag`, and
  `hitflag` comparisons and routes them through typed predicates. It does not
  expose general strings to the numeric expression parser.
- `!=` tests overlap with the complement of the authored filter, matching the
  official bytecode. It is intentionally not logical negation: a multi-flag
  projectile can satisfy both `= L` and `!= L`.
- M expands to H/L; grouped attribute types N/S/H/A expand to their official
  attack sets. Missing projectiles, negative indexes, malformed filters, and
  dynamic flag text fail closed.

## Port ledger

- Adapted: compiler flag parsing into balanced TypeScript expression rewrites.
- Semantics retained: mask complement for `!=`, owner-relative ID/index
  selection, typed overlap, and missing-projectile undefined behavior.
- Replaced: Go bytecode stack masks with typed runtime callbacks.
- Omitted: dynamic flag text and a general string expression channel.
- Local extension: the shared redirect context carries the same typed callback.

## Verification

- Focused: 5 files / 173 tests pass.
- Full suite: 3367/3425 tests pass; all 58 failures are the inherited retired
  roster, Studio, movement-expectation, and imported-log baseline.
- `pnpm typecheck`, `pnpm build`, `pnpm qa:trace` (686/686),
  `pnpm check:boundaries`, and `pnpm check:redirect-boundary` pass.
- No browser gate was needed because this slice does not change UI behavior.

## Claim ceiling

Do not claim a general string channel, dynamic flag expressions, palette or
presentation parameters, full Projectile state parity, or complete Ikemen
`ProjVar` parity.
