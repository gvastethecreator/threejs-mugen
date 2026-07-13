# IKEMEN Active-root Crouch Low-guard Contact

Date: 2026-07-12

## Question

Can an explicit IKEMEN Tag active root enter a command-driven C state from held back plus down, then receive a direct low-only `guardflag = L` threat and resolve delayed P4 contact as a crouch guard?

## Primary Sources

- [Elecbyte CNS format: HitDef guardflag](https://www.elecbyte.com/mugendocs/cns.html): `H`, `L`, and `A` select high, low, and air guard; `M` is equivalent to `HL`.
- [Elecbyte Tutorial 4: guardflag](https://elecbyte.com/mugendocs/tutorial4.html): `MA` can be guarded while standing, crouching, or airborne, while `HA` excludes crouching.
- Pinned [IKEMEN-GO `char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10670-L10707): the `HF_L` guard-flag branch matches only crouching state.
- Local `CombatResolver.guardFlagAllowsState`: C accepts `L` or `M`; Feature 120 proves the complementary C-versus-H rejection and the active-root fixture can now author `L`.

## Local Findings

- Feature 120 demonstrates the guard-distance selection is state-sensitive: H latches P3 while S, then disappears after `StateTypeSet` C.
- Therefore a low-only trace must establish P3 C before P4 can become a valid direct guard-distance source; reusing the three-frame `MA` geometry would not prove this ordering.
- `activeRootHitDefRoute.guardFlag` already emits an authored CNS value and defaults to `MA`; no resolver or admission change is indicated.
- Active roots do not gain a generic default crouch-motion path from this cut. The required fixture instead routes the held-down command through imported state `10` C, then uses an explicit state-local `PosSet` only to isolate P3 geometry from P1 before the low-only latch.

## Selected Boundary

Create one required four-frame active-root trace: imported `holddown` sends P3 from S to state `10` C while distant P4 low-only remains non-latched; state `10` then positions P3 into isolated direct guard distance, P3 enters imported `120 -> 131`, and P4 moves into delayed overlap. Existing root admission and generic direct combat must produce a C guard state `152` with zero chip damage.

## Result

- Required `synthetic-imported-ikemen-active-root-crouch-low-guard.json` passes with checksum `748679c8` and final checksum `acec0c58`.
- Tick 1 proves P3 state `10` C at x = `-220` with no P4 low-only latch. Tick 2 executes P3 state-`10` `PosSet` to x = `-100` and records P4 as the sole direct latch. Tick 3 executes `120` `StateTypeSet` C, and tick 4 completes `120 -> 131`, delayed P4 overlap, exact `p4 -> p3` admission, target id `129`, and guard state `152` with life `1000`.
- The result is low-only C guard evidence only. It is not generic active-root crouch motion or a complete high/low matrix.

## Deliberate Limits

- No standing or air counterpart and no exhaustive high/low matrix.
- No claim about full automatic-guard timing or target ranking.
- No projectiles/helpers, custom state, forceguard, target precedence, pause, presentation, team lifecycle, or score widening.
- No full MUGEN/IKEMEN parity claim.
