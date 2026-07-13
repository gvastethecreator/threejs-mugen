# IKEMEN Active-root Standing High Guard Contact

Date: 2026-07-12

## Question

Can an explicit IKEMEN Tag active root remain in an imported standing state while holding back, receive a direct high-only `guardflag = H` contact, and resolve it as a guard?

## Primary Sources

- [Elecbyte CNS format: HitDef guardflag](https://www.elecbyte.com/mugendocs/cns.html): `H`, `L`, and `A` select high, low, and air guard; `M` is equivalent to `HL`.
- [Elecbyte Tutorial 4: guardflag](https://elecbyte.com/mugendocs/tutorial4.html): `HA` applies to standing and air guarding, excluding crouching.
- Pinned [IKEMEN-GO `char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10670-L10707): its `HF_H` branch matches standing `ST_S`, while `HF_L` matches crouching `ST_C` and `HF_A` matches air `ST_A`.
- Local `CombatResolver.guardFlagAllowsState`: S accepts `H` or `M`, while C accepts `L` or `M`.

## Local Findings

- Feature 122 proves the negative counterpart: S plus L does not become direct guard-distance provenance and delayed contact hits.
- A command route into state `20` S plus state-local positioning can isolate P3 from P1 while preserving existing active-root guard-distance, automatic guard, root admission, and direct combat ownership.
- Existing imported standing guard-start and default guard-hit fixtures already provide `120 -> 130` and state `150` without a new generic runtime route.

## Selected Boundary

Create one required four-frame Tag trace: P3 enters imported state `20` S from held back while distant high-only P4 has no latch; state `20` positions only P3; P4 becomes the direct H latch; existing `120 -> 130` completes before delayed P4 overlap, which must resolve as a zero-chip guard.

## Result

- The required artifact `synthetic-imported-ikemen-active-root-standing-high-guard.json` passes with trace checksum `bec58061` and final checksum `3faaf48b`.
- P3 enters state `20` S at x = `-220`, moves to x = `-100`, observes only P4 as direct H provenance, then enters `120 -> 130` before delayed contact.
- Existing admission records exact `p4 -> p3`; existing direct combat records `guard`, P4 target id `134`, P3 S state `150`, `guarding = true`, and life `1000`.
- This validates the selected S-plus-H positive route only. It does not establish generic standing motion, air guard, or a complete high/low matrix.
