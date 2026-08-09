# Issue 202 — HitDef givepower resource mutation

- Status: `closed-bounded`
- Lane: `R2 HitDef compiler/runtime semantics`
- Priority: `P1`

## Objective

Port static explicit and omitted HitDef `givepower` hit/guard values through
fresh direct HitDef and Projectile creation, accepted contact, and defender
power mutation. Keep the effective delta available through `GetHitVar(power)`.

## Source gate

Official M.U.G.E.N defines `givepower = p2power, p2gpower`. Omitted hit power
is authored damage multiplied by `Default.GetHit.LifeToPowerMul`; omitted
guard power is half the effective hit value. Pinned Ikemen GO commit `149402f`
uses the super multiplier for HA/HT/HP, truncates toward zero, and applies the
selected delta to the hit recipient's power owner.

Source symbols:

- M.U.G.E.N `sctrl.hitdef.html:236-237` and `sctrl.projectile.html:323-324`
- `src/char.go:934-964`, `7923-7924`, `11317-11329`, and `12049-12057`
- `src/bytecode.go:8875-8904` for Ikemen ModifyProjectile get/givepower

## Port ledger

| Item | Decision |
| --- | --- |
| Normal default | `trunc(damage * default.gethit.lifetopowermul)` |
| Super default | `trunc(damage * super.gethit.lifetopowermul)` |
| Built-in constants | normal `0.6`; super `0.6` |
| Guard default | `trunc(effectiveHitPower * 0.5)` |
| Direct/Projectile contact | mutate defender power after accepted hit/guard |
| GetHitVar | retain selected authored/default delta, not the current pool |
| ModifyProjectile givepower | existing explicit mutation feeds the new consumer |

## Acceptance fixture

- Prove static explicit, one-value, omitted normal, and omitted hyper defaults.
- Prove a fresh HitDef does not inherit `givepower` from the previous move.
- Prove Projectile defaults use authored pre-scale damage.
- Prove direct and Projectile hit/guard contacts mutate defender power and
  preserve `GetHitVar(power)` delta metadata.
- Prove existing ModifyProjectile givepower reaches later defender mutation.
- Add one required imported trace with both attacker and defender power deltas.

## Claim ceiling

Do not claim fresh dynamic `givepower`, ModifyProjectile `getpower`, exact
Ikemen deferred-frame application, real global `data/mugen.cfg` loading,
power-owner/team topology, ReversalDef, rollback, or full power parity.

## Closeout evidence

- Focused T628 runtime coverage: 326/326.
- Full suite: 3508/3566 with the same 58 inherited retired-roster failures.
- Production build: 362 modules.
- Required trace corpus: 700/700 (666 required, 34 optional).
- `synthetic-imported-hitdef-getpower-default`: checksum `d4ec2081`, final
  checksum `4b9e7e61`, attacker power 7, defender power 6.
- Typecheck, boundary, redirect-boundary, and diff-hygiene gates pass.
