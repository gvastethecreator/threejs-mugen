# Official juggle matrix (Ikemen pins + Elecbyte)

Date: 2026-07-26
Type: primary-source research
Status: closed for DA26-02 / T406 pin era
Pins: `05b7d98a`, `4aa0ba38` (juggle-related lines equal across both)
Local refs: `.scratch/refs/Ikemen-GO/src/{char.go,compiler.go,bytecode.go,compiler_functions.go}`

## Claim allowed

Rules below are the pin-era direct character juggle model used by T406. Wiki
text that disagrees with these pins is recorded as blocked semantic drift, not
as runtime truth.

## Claim blocked

- Projectile `air.juggle` spend path
- Helper / nested helper ownership and generation keys
- ModifyHitDef `air.juggle`
- Target drop / round death ledger cleanup
- Full tick-order parity with Ikemen frame loop
- Promoting current wiki non-A reset wording over pins

## Matrix

| Topic | Rule at pins | Evidence |
| --- | --- | --- |
| StateDef `juggle` present | On state entry bytecode sets `c.juggle` to the authored value | `bytecode.go` `stateDef_juggle` |
| StateDef `juggle` omitted | Attack state inherits prior `c.juggle`; no automatic clear | Elecbyte CNS docs; no bytecode write when omitted |
| HitDef `air.juggle` omitted | Field defaults to `0` after setup; does **not** update `c.juggle` | `char.go` HitDef setup: `air_juggle == IErr` → field 0 only |
| HitDef `air.juggle` explicit | Non-projectile IKEMEN character sets `c.juggle = air_juggle` | `char.go` ~999-1005 |
| Profile gate for HitDef arm | Only when character wiki version is Ikemen (`ikemenver` non-zero) | same block |
| Direct admission cost | Uses `c.juggle`, not the raw HitDef field | `char.go` ~13229-13233 |
| Falling contact spend | Subtracts `c.juggle` from target points unless `NoJuggleCheck` | `char.go` ~11434-11443 |
| Post-contact reset | After falling contact, non-projectile `c.juggle = 0` even with `NoJuggleCheck` | `char.go` ~11445-11449 |
| Non-A periodic reset | While `moveType != A`, Ikemen characters set `c.juggle = 0` | `char.go` ~11914-11919 |
| Wiki conflict | Current wiki says non-A reset is unconditional; pins still require `ikemenver` | wiki + pins both cited in DA26 audit |

## Local port mapping (T406)

| Pin concept | Local field / API |
| --- | --- |
| `c.juggle` | `CharacterRuntimeState.juggle` + `juggleOrigin` |
| StateDef apply | `applyRuntimeStateDefJuggle` on state entry |
| HitDef arm | `applyRuntimeHitDefJuggle` from `HitDefSystem` when field present and profile `ikemen-go` |
| Direct cost | `runtimeDirectAirJuggleCost` prefers armed `juggle`, falls back to static move for never-armed demo paths |
| Target points | `airJugglePoints[attackerId]` with budget `data.airjuggle` default 15 |
| Trace | `buildRuntimeJuggleTrace` + snapshot `juggle` / `juggleOrigin` / `airJugglePoints` |

## Hashes / pins

- Research-era Ikemen pin used by T389-T405 family: `4aa0ba38`
- SourceAuthority normative pin still recorded as `05b7d98a`
- Text equality for juggle-bearing lines across those two pins was verified in the
  2026-07-26 daily audit; this matrix does not re-promote `4aa0ba38` as the
  global normative epoch.
