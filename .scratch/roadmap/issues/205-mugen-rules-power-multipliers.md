# Issue 205 — MUGEN Rules power multipliers

- Status: `closed-bounded`
- Lane: `R2 global config and HitDef defaults`
- Priority: `P1`

## Objective

Project the official M.U.G.E.N `[Rules]` life-to-power multipliers from
`data/mugen.cfg` into runtime character constants so omitted HitDef and
Projectile `getpower` / `givepower` defaults use configured values.

## Source gate

M.U.G.E.N 1.1 HitDef and Projectile documentation defines omitted `getpower`
from `Default.Attack.LifeToPowerMul` and omitted `givepower` from
`Default.GetHit.LifeToPowerMul` in `data/mugen.cfg`. Pinned Ikemen GO commit
`149402f` initializes normal/super defaults, loads common constants, then lets
character constants override them before contact-time default calculation.

Source symbols:

- M.U.G.E.N 1.1 `sctrl.hitdef.html:233-237` and
  `sctrl.projectile.html:320-324`
- official `data/mugen.cfg` `[Rules]`
- pinned Ikemen `src/char.go:934-964`, `3915-3930`, and `4176-4181`

## Port ledger

| Source | Precedence |
| --- | --- |
| Runtime built-ins | fallback only |
| MUGEN `[Rules]` | override built-ins for normal attack/get-hit multipliers |
| Common.Const | override global rules when present |
| Character `[Constants]` | highest supported character-local precedence |

## Acceptance fixture

- Parse finite `[Rules]` attack/get-hit multipliers and reject malformed values.
- Preserve the existing raw-section representation.
- Inject configured values before common and character constant overlays.
- Prove omitted direct HitDef and Projectile hit/guard rewards use the loaded
  configured multipliers.
- Preserve explicit `getpower` / `givepower` precedence.

## Claim ceiling

Do not claim the complete `data/mugen.cfg` schema, every Ikemen Common.Const
key, dynamic config reload, team/power-owner topology, exact deferred power
timing, rollback, or full global configuration parity.

## Closeout evidence

- Config parser/loader coverage: 18/18; HitDef/Projectile defaults: 98/98.
- Full suite: 3522/3580 with the same 58 inherited retired-roster failures.
- Production build: 362 modules.
- Required trace corpus: 703/703 (669 required, 34 optional).
- `synthetic-imported-hitdef-rules-power-defaults`: checksum `6de46366`, final
  checksum `e18a32ed`, attacker power 10, defender power 16, and
  `GetHitVar(power) = 16` branch.
- Typecheck, boundary, redirect-boundary, and diff-hygiene gates pass.
