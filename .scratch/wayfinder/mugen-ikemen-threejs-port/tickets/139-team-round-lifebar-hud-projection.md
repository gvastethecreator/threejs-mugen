# Wayfinder 139 - TeamRoundLifebar HUD Projection/v0

Status: resolved bounded visible subset

Dependency: Wayfinder 138 / `RuntimeTeamRoundLifebar/v0`.

## Answer

The main round HUD now consumes the versioned team lifebar snapshot for
IKEMEN non-Single routes. It preserves ordered leader/member slots and renders
standby reserves without treating them as active Three.js roots. The Tag
handoff keeps the slot ids stable while changing the side active ids and slot
states.

## Evidence

- `src/app/App.ts`
- `src/styles/base/app-shell.css`
- `src/styles/redesign.css`
- `scripts/qa_smoke.cjs`
- `docs/research/2026-07-13-team-round-lifebar-hud.md`
- `docs/reports/2026-07-13-team-round-lifebar-hud.md`

## Claim allowed

The exercised desktop/mobile Tag presentation: stable `p1,p3,p2,p4` team
slots, visible leader/member and active/standby states, and active-root change
`p1,p2` -> `p3,p2` with clean browser diagnostics.

## Claim blocked

Motif/AIR animation, red-life interpolation, shared resources, automatic Turns
continuation, exact Tag choreography, KO/win timing, screenpack parity,
rollback/netplay, and full MUGEN/IKEMEN parity.
