# IKEMEN PlayerPush X tie research

Date: 2026-07-12
Pinned upstream revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Official contract

When X centers tie, IKEMEN chooses direction by priority/corner side, hit state, attack state, scaled Y, then facing. Candidate/getter ordering controls which actor remains anchored.

- [X tie and corner policy](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13789-L13846)

## Implemented contract

- Stable pair order maps left root to upstream getter and right root to candidate.
- Priority and stage-side position decide unequal-priority ties.
- Equal priority applies hit-state, attack-state, localcoord-scaled Y, and facing branches in upstream order.
- Resolved direction feeds existing weight/pushfactor displacement and stage clamp.
- Non-tied X behavior remains unchanged.

## Claim ceiling

Allowed: deterministic root X-center tie direction for current stable run order.

Blocked: exact duplicate getter/candidate visitation, helper run order, Z ties/corners, interpolation history, pause ordering, and full parity.
