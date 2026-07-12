# IKEMEN PlayerPush policy research

Date: 2026-07-12
Pinned upstream revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Official source

IKEMEN extends `PlayerPush` with optional `redirectid`, `value`, `priority`, and `affectteam` parameters. Per-frame root defaults are enabled push, priority `0`, and enemy-only (`E`) participation. Character size defaults are weight `100` and push factor `1`.

- [PlayerPush compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L3526-L3569)
- [Per-frame PlayerPush defaults](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11609-L11622)
- [Character push constants](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L369-L372)
- [Root push resolution](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13622-L13874)

## Implemented contract

- Static and dynamic `value`, `priority`, and `affectteam` compose without an omitted field overwriting another controller from the same frame.
- `affectteam = E/F/B` maps to enemy-only, friendly-only, or both-team pair admission.
- Higher priority stays fixed while the lower-priority root receives displacement scaled by its `size.pushfactor`.
- Equal priority distributes overlap using the opposite root's `size.weight`, then applies each root's own push factor.
- The same resolved factors drive X and logical-Z separation before stage clamping.
- `redirectid` survives typed lowering and uses the existing fail-closed live-root redirect boundary.
- Active-motion Tag roots can execute `PlayerPush`; per-frame defaults reset to enabled, priority `0`, enemy-only.

## Claim ceiling

Allowed: bounded root PlayerPush policy for teams, priority, weight, push factor, X/Z displacement, active Tag execution, and live-root RedirectID routing.

Blocked: Clsn/Y admission, helpers, recursive redirects, exact corner/tie interpolation, exact hitpause/reset order, warning parity, rendering, and full IKEMEN parity.
