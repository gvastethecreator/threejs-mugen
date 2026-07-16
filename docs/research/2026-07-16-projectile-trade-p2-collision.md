# Research: projectile trade and p2 collision

Date: 2026-07-16  
Scope: IKEMEN GO compatibility slice for Wayfinder 209

## Primary sources

- [IKEMEN GO changed state controllers](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29)
  documents `p2clsncheck` (`Clsn1`, `Clsn2`, `Size`, `None`) and
  `p2clsnrequire` as a required-box precondition.
- [IKEMEN GO `src/char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/develop/src/char.go)
  initializes both options as undefined, defaults ordinary HitDef checks to
  `Clsn2`, and implements projectile collision through
  `projClsnCheckSingle`.

## Compatibility observations

1. Ordinary HitDef contact defaults to the defender's `Clsn2`; explicit
   `p2clsncheck` changes only the target box family.
2. `p2clsnrequire` is checked before overlap. An absent required box rejects
   the contact even if another selected box would overlap.
3. `ProjTypeCollision` overrides the projectile/target pair to current-frame
   `Clsn2` boxes. A missing current-frame projectile `Clsn2` therefore fails
   closed.
4. Projectile trade detection is separate from normal character contact and
   uses projectile `Clsn2` boxes. The port's existing clash priority policy is
   retained; this slice changes only admission geometry and typed options.

## Decision

Implement the selectors as a shared literal union. Keep explicit `None` as a
fail-closed selector, preserve the current default (`Clsn2` for target contact),
and evaluate `p2clsnrequire` against the target's authored/runtime box family.
Use strict current-frame `Clsn2` for projectile trades and do not fall back to a
projectile hitbox in that route.

## Remaining uncertainty

Exact IKEMEN ordering across proxies, depth, `affectteam`, same-owner projectiles,
and all cancel-time triggers remains open and must not be inferred from this
bounded slice.

## Implementation evidence

- Commit `3838fa5e` carries the typed compiler/runtime selectors and strict
  current-frame `Clsn2` projectile trade admission.
- Commit `845b8de5` aligns the two EffectActor trade fixtures with their authored
  `Clsn2` geometry.
- Focused runtime/compiler coverage: `168/168` tests passed.
- TypeScript 7 typecheck, production build, boundary check, and `qa:trace`
  (`633/633`, `599` required, `34` optional) passed.
- Full checkpoint with `--testTimeout=15000`: `2262/2263` tests passed. The
  remaining failure is the pre-existing `RuntimeMatchPostFighterSystem` expected
  call list, which omits same-owner projectile callbacks already scheduled by
  `MatchInteractionSystem`.
