# IKEMEN active team eligibility

## Question

Which character states must be separated from complete team membership before multi-root EnemyNear/P2 selection is implemented?

## Answer

Pinned IKEMEN GO first rejects disabled, neutral/same-side, and standby characters. It then builds different candidate sets: EnemyNear accepts opposing root players, including dead roots; P2 accepts opposing player-type characters that are not standby or `over_ko`. Distance ordering and cache refresh remain a later selection concern.

## Primary sources

- [IKEMEN GO enemy eligibility](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L5089-L5109)
- [IKEMEN GO EnemyNear/P2 candidate construction](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13962-L14057)

## Implementation decision

- Keep complete opposing-team enumeration unchanged for team-wide effects.
- Add fail-closed active-state filtering for `disabled`, `standby`, and neutral characters.
- Expose separate EnemyNear-root and P2-player-type candidate projections.
- Publish `RuntimeTeamRoster/v0` diagnostics before connecting multi-root topology to playable scheduling.

## Uncertainty

Nearest distance ordering, P2 behind-facing penalty, Z distance, cache invalidation, tag transitions, KO state transitions, and multi-root runtime ownership remain unimplemented.
