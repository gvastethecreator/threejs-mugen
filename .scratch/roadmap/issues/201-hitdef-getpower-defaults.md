# Issue 201 — HitDef getpower defaults

- Status: `closed-bounded`
- Lane: `R2 HitDef compiler/runtime semantics`
- Priority: `P1`

## Objective

Port the official omitted HitDef `getpower` defaults for direct HitDef and
Projectile creation. Derive the attacker hit reward from authored damage and
the normal or super `attack.lifetopowermul` constant, then derive guard reward
as half of the hit reward.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` fills omitted `hitgetpower` from
`default.attack.lifetopowermul` or `super.attack.lifetopowermul`, selected by
the HitDef attack attribute. It converts the product to an integer and fills
omitted `guardgetpower` with half of the effective hit reward.

Source symbols:

- M.U.G.E.N `mugendocs/sctrls.html`: HitDef `getpower`
- `src/char.go:934-964`
- `src/char.go:7921-7924`

## Port ledger

| Item | Decision |
| --- | --- |
| Normal default | `trunc(damage * default.attack.lifetopowermul)` |
| Super default | `trunc(damage * super.attack.lifetopowermul)` |
| Built-in constants | normal `0.7`; super `0` |
| Guard default | `trunc(effectiveHitPower * 0.5)` |
| Direct HitDef | use root or Helper definition constants at activation |
| Projectile | use owner constants and authored pre-scale HitDef damage at spawn |
| Explicit values | preserve T626 component and `ModifyHitDef` semantics |

## Acceptance fixture

- Prove normal and hyper omitted defaults with built-in and authored constants.
- Prove one authored component still derives guard from the authored hit value.
- Prove root/Helper direct HitDef and Projectile creation use the owner profile.
- Prove accepted direct and Projectile contacts replace the old 35/12 fallback.
- Promote one required trace only if existing power-delta evidence cannot cover
  the derived branch without duplication.

## Claim ceiling

Do not claim `givepower` defaults or defender power mutation, power-set/team
topology, ModifyProjectile `getpower`, attack-profile damage scaling, rollback,
or full power-management parity.

## Closeout evidence

- Fresh direct HitDef and Projectile creation derive omitted normal rewards
  with multiplier `0.7`, exact HA/HT/HP rewards with multiplier `0`, and guard
  reward from half the effective hit value.
- Root/Helper direct HitDef and root/Helper Projectile paths use the current
  owner constants projection. Projectile defaults use authored damage before
  runtime attack scaling.
- Core focused coverage passes 166/166 plus targeted contact, redirect,
  compatibility-journey, and required trace cases.
- The full suite passes 3505/3563 with the same 58 inherited retired-character
  failures. Typecheck, the 362-module build, boundaries, redirect boundaries,
  and diff hygiene pass.
- `pnpm qa:trace` passes 700/700 (666 required, 34 optional). Required trace
  `synthetic-imported-hitdef-getpower-default` has checksum `fa12664b` and
  final-frame checksum `f18ad68f`; damage 10 ends with P1 power 7.
- T628 / issue 202 owns `givepower` defaults and defender power mutation.
