# IKEMEN `hittmp` Materialization Research

## Question

Which part of IKEMEN's get-hit phase can the local runtime materialize before
attempting the separate `acttmp`, `stchtmp`, and pause lifecycle work?

## Answer

The bounded slice is the typed `hittmp` state used by hit flags, direct
air-juggle admission, and Projectile air-juggle admission. The runtime now
stores `0` for idle, `1` for getting hit, `2` for falling, and `-1` for an
accepted ReversalDef marker. Normal root fighters sync the value after their
frame mutation hooks and before post-fighter combat. Static and handcrafted
paths keep the prior `moveType`/`hitFall` projection when the field is absent.

## Pinned source

- Repository: `ikemen-engine/Ikemen-GO`
- Commit: `4aa0ba38f851c52549ba182310e9e53361cd472a`
- [`hittmp` and `acttmp` fields](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L3183-L3191)
- [`HitFlag` F, minus, and plus predicates](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L9950-L9988)
- [`hittmp` update from get-hit/fall state](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11574-L11623)
- [Direct player `hittmp < 2` juggle gate](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L12645-L12658)
- [ReversalDef `hittmp = -1` marker](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L12684-L12746)
- [Projectile `hittmp < 2` juggle gate](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L12908-L12920)

## Findings

1. The source comment defines `hittmp` as `0` idle, `1` being hit, `2`
   falling, and `-1` ReversalDef.
2. The `F`, `-`, and `+` HitFlag branches read `hittmp` directly. A falling
   target requires `F`; minus rejects a target with a positive value; plus
   requires a positive value and rejects guard states.
3. Direct player admission and Projectile admission both allow the contact
   while `hittmp < 2`, then apply their separate juggle-budget predicates.
4. The source marks the reversed actor with `-1` only when its current value is
   zero. The local ReversalDef path now preserves that condition.

## Local implementation contract

- `RuntimeHitTmpWorld` owns ordinary root synchronization.
- `runtimeHitTmpValue` gives explicit state precedence and preserves older
  unit fixtures that only provide `moveType` and `hitFall`.
- `CombatResolver` consumes explicit `hitTmp` for HitFlag decisions.
- IKEMEN direct and Projectile air-juggle admission use `hitTmp < 2` before
  checking the remaining budget.
- MUGEN and unknown profiles keep their existing air-juggle behavior.
- The current slice covers normal root fighters and the shared direct/projectile
  admission functions. It does not add a new required trace artifact.

## Implementation result

Commit `9d58730c` adds:

- `src/mugen/runtime/RuntimeHitTmpSystem.ts`
- optional `hitTmp` state on `CharacterRuntimeState`
- root fighter advance synchronization
- ReversalDef `-1` marking
- HitFlag and air-juggle consumers
- focused unit coverage for state transitions, fallback, reversal, direct and
  Projectile admission, combat resolution, and fighter advance order

## Evidence

- Focused closure: 7 files / 105 tests passed.
- `node --check scripts/qa_traces.cjs` passed.
- `git diff --check` passed.
- `pnpm typecheck` reaches only the unrelated pre-existing unused
  `advanced` at `src/mugen/da32/ClauseAdjudicationSample.ts:149`.

## Claim ceiling

This evidence supports materialized `hittmp` for normal root timing and the
named local admission predicates. It does not establish exact source update
ordering, `acttmp`, `stchtmp`, pause or hitpause persistence, state-entry reset
rules, custom-state or active Helper motion, MUGEN parity, teams/clashes,
target-list transfer, global checkpoints, score parity, or full
MUGEN/IKEMEN compatibility.
