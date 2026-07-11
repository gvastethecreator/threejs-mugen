# IKEMEN live team state projection

## Question

Which live character flags must reach snapshots before multi-root construction or scheduling?

## Answer

Pinned IKEMEN GO stores disabled, standby, and over-KO as mutable character-system flags. Changing any of them for a player-type character invalidates EnemyNear/P2 caches. `over_ko` is asserted when state 5150 is reached. Player-type means a root or a Helper with player helper type. These belong to runtime character state and must be snapshotted, not inferred permanently from actor kind.

## Primary sources

- [IKEMEN GO system flags and enemy-cache invalidation](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L4696-L4713)
- [IKEMEN GO player-type definition](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L5460-L5462)
- [IKEMEN GO over-KO transition](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12000-L12006)

## Implementation decision

- Add `CharacterRuntimeState.teamState` with all four explicit booleans.
- Initialize roots as active player-types and Helpers as active non-player-types.
- Clone state through player/helper snapshots and normalize old snapshots in `MatchWorld`.
- Drive `RuntimeTeamRoster/v0` from snapshot state instead of actor-kind inference.

## Uncertainty

Helper `type = player` compilation, tag/turns transitions, state-5150 integration, inert P3/P4 construction, and all playable team phases remain unimplemented.
