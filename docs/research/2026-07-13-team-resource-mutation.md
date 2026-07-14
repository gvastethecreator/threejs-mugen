# Research - RuntimeTeamResourceBank/v1 mutation boundary

Date: 2026-07-13
Status: source-backed policy boundary with explicit local uncertainty

## Question

After explicit team resource ownership, what is the smallest safe mutation
boundary for shared LifeShare and PowerShare in the playable IKEMEN route?

## Primary evidence

- The official [IKEMEN-GO screenpack features
  reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/Screenpack-features)
  lists `teamlifeshare` and `teampowershare` as separate options. The runtime
  must keep life and power policy independent.
- The official [IKEMEN-GO lifebar features
  reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/Lifebar-features)
  documents player-scoped life and power value elements. Visible active-root
  selection is not sufficient evidence for team-bank ownership.
- The official [IKEMEN-GO miscellaneous
  reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info)
  documents per-player life/power inputs and team-mode configuration. Actor
  runtime values and team policy therefore remain separate inputs.

## Decision

`RuntimeTeamResourceBankRuntime/v1` adds a deliberately bounded mutation
policy:

1. Resource values are sampled from root actor runtime state after each runtime
   tick, including combat, controller, target, and Pause/SuperPause paths that
   already mutate root resources.
2. Shared banks apply the sum of member deltas to one side-owned value, clamp to
   the bank maximum, then mirror that value to every root member. Life and power
   remain independent.
3. Non-shared banks only update their actor-local value. Standby and active
   transitions do not change bank ids or `resourceOwnerId`.
4. Match construction and match reset rebind the session to current root
   values. A shared bank starts from its deterministic representative value and
   uses the minimum member maximum as its bounded cap.
5. Helpers, projectiles, red-life, guard/stun, variable maps, persistence,
   rollback, and netplay remain outside this cut. They must not be silently
   folded into root-bank semantics.

The official references establish the options and player/team surfaces, but do
not specify an exact shared-bank initialization or multi-member mutation
algorithm. The tick-boundary delta policy is therefore a repository-local
compatibility slice, not a claim of exact IKEMEN parity.

## Local evidence

- `src/mugen/runtime/RuntimeTeamResourceBankSystem.ts` owns the v1 bank values,
  caps, baselines, reset, delta reconciliation, and deterministic diagnostics.
- `src/mugen/runtime/PlayableMatchRuntime.ts` invokes reset after construction and
  match reset, then reconciles after each completed tick without adding phases
  to the behavior checksum schedule.
- `src/tests/RuntimeTeamResourceBankSystem.test.ts` covers shared power, local
  power, independent life policy, Tag swap stability, and reset rebinding.
- Required imported Tag traces cover shared standby mirroring and non-shared
  root-local mutation through `MatchWorld`.

## Uncertainty

Exact IKEMEN treatment of simultaneous `LifeSet`/`PowerSet`, multi-member
same-tick writes, red-life, and persistence still needs source-level parity
fixtures before any broader claim.

## Next decision

Route the remaining resource families separately: helper/projectile ownership,
red-life and guard/stun, then persistence/reset across rounds. Keep each family
behind its own trace gate.
