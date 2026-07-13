# IKEMEN Active-root Crouch Guard Contact

Date: 2026-07-12

## Question

Can the existing active-root admission and generic direct-combat path resolve one delayed P4 -> P3 direct contact as a crouch guard after P3 receives the prior direct guard-distance latch and holds back plus down?

## Primary Sources

- [Elecbyte MUGEN Tutorial 4: guardflag](https://elecbyte.com/mugendocs/tutorial4.html): `guardflag = MA` permits guarding while holding back when standing, crouching, or airborne.
- [Elecbyte CNS format: HitDef guardflag](https://www.elecbyte.com/mugendocs/cns.html): `M` means high plus low, so a crouching defender can guard an `MA` HitDef while holding back.
- [Elecbyte AIR standard reserved actions](https://www.elecbyte.com/mugendocs-11b1/air.html): actions `120`, `121`, `130`, `131`, `150`, `151`, and `152` distinguish standing, crouching, and air guard presentation.
- Local official MUGEN 1.1 `data/common1.cns` at `.scratch/external/mugen-1.1b1/data/common1.cns`: state `120` keeps state type, moves held-down defenders to C, then selects state `131`; state `152` is the crouch guard-hit state and transitions through `153` to `131`.
- [Pinned IKEMEN-GO hitResultCheck](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10670-L10707): upstream checks guard capability and matching guard flag before choosing guard contact.

## Local Findings

- `RuntimeGuardWorld.defaultGuardStartStateNo` selects imported state `120`; `RuntimeAutoGuardStartWorld` keeps current state type and schedules the state before root admission.
- `RuntimeGuardWorld.defaultGuardHitStateNo` already selects state `152` for a crouching defender when that state exists.
- `RuntimeCombatResolutionWorld.resolveDirect` already delegates held-back guard classification to `resolveRuntimeCombatHit`, which accepts `M` for C state type.
- Feature 118 proves the ordering and direct root contact for standing guard. It intentionally uses only stand guard states `120`, `130`, and `150`.

## Selected Boundary

Add a fixture-only imported Common1-style crouch guard-start block and a required active-root trace. P3 receives held-back plus held-down input, moves through `120 -> 131`, and P4 enters overlap on the delayed third tick. Reuse existing root admission, generic direct combat, target/contact memory, and crouch default guard-hit selection.

## Deliberate Limits

- No high-only or low-only rejection matrix.
- No air guard, guard velocity, slide-stop, or guard-end timing proof.
- No projectile/helper, custom state, forceguard, target precedence, pause, presentation, or team lifecycle widening.
- No score movement or full MUGEN/IKEMEN parity claim.

## Result

The selected fixture executes held back plus down through P3 imported state `120`, emits typed `StateTypeSet` C evidence, completes `120 -> 131`, and only then admits P4's delayed direct overlap. Existing generic root admission records exactly `p4 -> p3`; existing direct combat accepts the `MA` guard flag for P3 C state and selects default crouch guard-hit state `152`. The required artifact `synthetic-imported-ikemen-active-root-crouch-guard.json` passes with checksum `9aac9d7d` / final checksum `82f0d463`, P4 target id `123`, P3 life `1000`, and `guarding = true`. The evidence proves the selected route only; it does not establish high/low rejection, air guard, or broader guard parity.
