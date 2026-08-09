# Issue 200 — HitDef attacker getpower

- Status: `closed-bounded`
- Lane: `R2 HitDef compiler/runtime semantics`
- Priority: `P1`

## Objective

Port explicit HitDef `getpower` hit/guard values through HitDef and Projectile
creation, live root `ModifyHitDef` mutation, accepted contact, and attacker
power gain.

## Source gate

The official M.U.G.E.N HitDef reference defines `getpower = p1power,
p1gpower`: the first value rewards P1 on hit, the second on guard, and an
omitted guard value defaults to half the hit value. This is separate from
`givepower`, which belongs to P2.

Pinned Ikemen GO `develop` commit `149402f` compiles `getpower` as one or two
integer expressions, evaluates supplied components on the active HitDef, fills
omitted values from damage/constants and the half-value guard rule, and applies
the selected amount to the attacker on accepted hit or guard.

Source symbols:

- M.U.G.E.N `mugendocs/sctrls.html`: HitDef `getpower`
- `src/compiler_functions.go:1801-1805`
- `src/bytecode.go:7595-7602` and `8338-8355`
- `src/char.go:934-964` and `11317-11329`

## Port ledger

| Item | Decision |
| --- | --- |
| Typed HitDef IR | retain one or two static/dynamic integer expressions |
| Root and Helper HitDef | resolve in the active caller context |
| Projectile | resolve the same spawn-time HitDef pair |
| ModifyHitDef | replace supplied values on an active normal HitDef |
| Contact | select hit or guard value for attacker power gain |
| Separation | do not reuse existing `givepower` defender metadata |
| First slice defaults | explicit authored values only; keep legacy fallback when omitted |

## Acceptance fixture

- Prove typed static/dynamic pairs and malformed rejection.
- Prove root, Helper, Projectile, and redirected `ModifyHitDef` resolution.
- Prove hit and guard select different attacker power gains.
- Prove omission preserves the current legacy fallback for this first slice.
- Add one required imported trace with power-delta evidence.

## Claim ceiling

Do not claim exact damage/constants-derived defaults, super/profile
multipliers, `givepower` resource mutation, ModifyProjectile `getpower`, team
power topology, rollback, or full power-management parity.

## Closeout evidence

- Typed root/Helper HitDef, Projectile, and root or redirected
  `ModifyHitDef` paths preserve one- and two-component `getpower` semantics.
- Accepted hit and guard contacts apply the selected finite reward to the
  attacker; omission keeps the pre-existing 35/12 compatibility fallback.
- Focused runtime coverage passes 451/451 plus the isolated real Helper,
  redirected `ModifyHitDef`, and required trace cases.
- The full suite passes 3502/3560 with the same 58 inherited retired-character
  failures. Typecheck, the 361-module build, boundaries, redirect boundaries,
  and diff hygiene pass.
- `pnpm qa:trace` passes 699/699 (665 required, 34 optional). Required trace
  `synthetic-imported-hitdef-getpower` has checksum `2f881236` and final-frame
  checksum `90ee3934`; P1 ends with power 47.
- T627 / issue 201 owns the official damage/constants-derived omission
  defaults and replaces the temporary compatibility fallback for this field.
