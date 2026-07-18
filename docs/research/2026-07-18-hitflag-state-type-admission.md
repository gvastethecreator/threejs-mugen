# HitFlag state-type admission research

## Question

What explicit HitDef state-type rule can be added after T261 without changing
the sandbox's intentionally preserved omitted-hitflag path?

## Primary source evidence

- The pinned [IKEMEN GO `hittableByChar` checks](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go#L10440-L10461)
  reject a hit when `H` is absent for standing state, `L` is absent for
  crouching state, `A` is absent for airborne state, or `D` is absent for lie
  down state. The same source treats `M` as the mid flag represented by the
  standing/crouching pair.
- The [Elecbyte HitDef reference](https://elecbyte.com/mugendocs-11b1/sctrls.html)
  documents the same compact string: `H`, `L`, `A`, `M`, and `D` select target
  state types, while the omitted value defaults to `MAF`.

## Repository boundary

`DemoMove.hitFlag` already preserves explicit authored HitDef text and all
current direct admission paths share the T261 predicate in `CombatResolver`.
`CharacterRuntimeState.stateType` is present on runtime actors and the root
admission projection can read it. Projectile runtime records still do not own
an authored direct HitDef `hitFlag` field.

## Decision for T262

Extend the existing shared predicate, without creating a second admission
path:

1. Return early for an omitted hitflag so current compatibility behavior does
   not change.
2. For `S`, require `H` or `M`; for `C`, require `L` or `M`; for `A`, require
   `A`; for `L`, require `D`.
3. Keep this check ahead of `F`, `-`, and `+`, matching the source's main
   hitflag order.
4. Apply the typed reason to root and regular direct diagnostics; preparation
   and helper paths remain fail-closed through the same pure result.

This is explicit state-type admission only. It is not default inference and
does not establish projectile or reversal parity.

## Uncertainty and non-claims

- The current importer intentionally leaves an omitted `hitflag` undefined;
  no default is synthesized by this tranche.
- Custom state-type transitions, exact Common1 state-loop ordering, and all
  projectile/reversal ownership remain outside the change.

## Implementation outcome

Implemented in `6c10303f` after planning commit `09ecb1dd`. Explicit direct
hitflags now require `H`/`M` for standing, `L`/`M` for crouching, `A` for air,
and `D` for lie-down targets before the existing T261 checks. Focused coverage
passed `4` files / `80` tests; grouped closeout evidence passes `230` files /
`2416` tests, TypeScript 7, build, boundaries, redirect boundary, trace QA,
and diff hygiene. Omitted/default flags, projectiles, reversals, and exact
runtime engine timing remain outside the claim.
