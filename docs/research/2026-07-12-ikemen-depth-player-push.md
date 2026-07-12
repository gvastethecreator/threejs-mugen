# IKEMEN depth player-push research

Date: 2026-07-12
Pinned upstream revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Official behavior

IKEMEN's global push pass rejects `PlayerPush`-off, standby, and disabled actors before applying team policy. It requires Y, X, and Z size-box overlap. When Z is enabled and centers differ, it compares X distance against Z distance normalized by total body width/depth: similar distances push both axes, otherwise the farther normalized axis wins. Equal Z falls back to X. The result uses priority, weight, and push factors, then reclamps X/Z and updates interpolation.

Primary source: [Ikemen-GO `char.go` push detection](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13622-L13874).

## Implemented cut

- Existing stable root-pair traversal and eligibility remain unchanged.
- X overlap uses current facing-aware body widths.
- Z overlap uses `combatDepth.position` and `combatDepth.size`.
- Character `localcoord` scales X/Z comparison and displacement.
- The official `0.75` similarity threshold selects X, Z, or both axes.
- Equal Z preserves X fallback.
- Post-push Z is reclamped to stage depth bounds unless `ScreenBound stagebound = 0` opted out.
- Missing depth data preserves the previous X-only path.

## Claim ceiling

Allowed: bounded symmetric X/Z player push for eligible playable and active Tag roots using current body-width/depth geometry and localcoord scaling.

Blocked: Clsn/Y admission, `pushPriority`, weight, `pushfactor`, `pushAffectTeam`, exact tie-breaking, interpolation, helper participation, exact size-box selection, hitpause/tick-order parity, and full MUGEN/IKEMEN push parity.
