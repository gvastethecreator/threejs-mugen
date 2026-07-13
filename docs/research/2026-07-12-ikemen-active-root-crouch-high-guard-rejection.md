# IKEMEN Active-root Crouch High-guard Rejection

Date: 2026-07-12

## Question

Can an explicit IKEMEN Tag active root that has already reached C guard state from held back plus down correctly reject a delayed direct `guardflag = H` contact as a hit rather than guard?

## Primary Sources

- [Elecbyte CNS format: HitDef guardflag](https://www.elecbyte.com/mugendocs/cns.html): `H`, `L`, and `A` mean high, low, and air guard; `M` is equivalent to `HL`.
- [Elecbyte Tutorial 4: guardflag](https://elecbyte.com/mugendocs/tutorial4.html): `MA` allows standing, crouching, or air guard, while `HA` allows standing or jumping guard only.
- Pinned [IKEMEN-GO `char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10670-L10707): guard resolution checks `HF_H` only against standing state, `HF_L` only against crouching state, and `HF_A` only against air state.
- Local `CombatResolver.guardFlagAllowsState`: C state accepts `L` or `M`, not `H`; Feature 119 already proves the active-root C path and delayed admission order for `MA`.

## Local Findings

- `activeRootHitDefRouteBlock` currently hardcodes `guardflag = MA`, so the active-root fixture cannot presently author the high-only source needed for this evidence cut.
- `RuntimeCombatResolutionWorld` already delegates contact classification to `resolveRuntimeCombatHit`; no resolver change is indicated by the selected boundary.
- Existing imported AssertSpecial guard-deny fixtures prove a different defender-side denial route. This cut isolates attack-side guardflag selection after active-root C guard start instead.
- Probe result: P4 appears as P3 direct latch while P3 remains S; after state `120` executes `StateTypeSet` C, the high-only threat no longer appears as current `InGuardDist`. P3 still completes `120 -> 131`, and delayed contact is admitted as a C-state hit. The gate must preserve this phase distinction instead of requiring a C-state latch.

## Selected Boundary

Add one optional fixture-only `guardFlag` parameter to `activeRootHitDefRoute`, then create a required three-frame active-root trace matching Feature 119 geometry and ordering. P3 keeps held back plus down and reaches C `120 -> 131`; delayed P4 authors `H`, root admission admits exactly `p4 -> p3`, and existing direct combat must record a normal hit with C state provenance.

## Deliberate Limits

- No low-only, standing, air, or full high/low matrix.
- No claim about whether automatic guard start should suppress a nonmatching future guard flag.
- No projectiles/helpers, custom state, forceguard, target precedence, pause, presentation, team lifecycle, or score widening.
- No full MUGEN/IKEMEN parity claim.

## Result

The fixture now authors P4 `guardflag = H` through the active-root CNS route. P3 initially records direct P4 guard distance while S, then held back plus down executes imported `120` `StateTypeSet` C and enters `131`; the H threat is absent from the current C latch snapshot. Delayed P4 overlap still reaches existing root admission, which records exactly `p4 -> p3`; generic direct combat records one hit instead of guard, P4 target id `126`, P3 C state `131`, `moveType = H`, `guarding = false`, and life `963`. Required artifact `synthetic-imported-ikemen-active-root-crouch-high-guard-reject.json` passes with checksum `935e6e6d` / final checksum `20bea107`. This proves one H-versus-C route only, not complete high/low or automatic-guard parity.
