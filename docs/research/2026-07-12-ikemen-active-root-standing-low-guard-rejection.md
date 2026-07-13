# IKEMEN Active-root Standing Low-guard Rejection

Date: 2026-07-12

## Question

Can an explicit IKEMEN Tag active root remain in an imported standing state while holding back, receive a direct low-only `guardflag = L` contact, and resolve it as a hit rather than a guard?

## Primary Sources

- [Elecbyte CNS format: HitDef guardflag](https://www.elecbyte.com/mugendocs/cns.html): `H`, `L`, and `A` select high, low, and air guard; `M` is equivalent to `HL`.
- [Elecbyte Tutorial 4: guardflag](https://elecbyte.com/mugendocs/tutorial4.html): `MA` guards standing, crouching, or air, while `HA` excludes crouching.
- Pinned [IKEMEN-GO `char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10670-L10707): the `HF_L` branch matches crouching state only, whereas standing matches `HF_H`.
- Local `CombatResolver.guardFlagAllowsState`: S accepts `H` or `M`, while C accepts `L` or `M`.

## Local Findings

- Feature 121 proves the positive counterpart: C plus L creates a direct active-root latch and guards delayed contact.
- The same state-sensitive selection means L must not latch while P3 is S; held back alone cannot override the state requirement.
- A fixture command route into state `20` S with state-local positioning can isolate P3 from P1 before delayed contact without claiming generic active-root walking or movement support.

## Selected Boundary

Create one required four-frame Tag trace: P3 enters imported state `20` S from held back while distant low-only P4 has no latch; state `20` positions P3 away from P1 but remains S; delayed P4 overlap reaches the existing root admission and direct combat path, which must record hit rather than guard.

## Deliberate Limits

- No generic walking/crouching/air control and no complete high/low matrix.
- No claim about broad automatic-guard timing, target ranking, or movement semantics.
- No projectiles/helpers, custom state, forceguard, target precedence, pause, presentation, team lifecycle, or score widening.
- No full MUGEN/IKEMEN parity claim.

## Result

- The required four-frame artifact `synthetic-imported-ikemen-active-root-standing-low-guard-reject.json` passes with trace checksum `906e4751` and final checksum `1eaa402b`.
- P3 follows `holdback -> state 20` S, uses the fixture-local position only to separate P1/P3 geometry, and never records P4 `guardflag = L` as direct guard-distance provenance while standing.
- Delayed P4 overlap still admits only `p4 -> p3`; existing direct combat records `hit`, target id `132`, P3 life `963`, `moveType = H`, and no guarding state.
- This validates the selected S-plus-L negative route only. It does not establish generic standing motion or a complete high/low matrix.
