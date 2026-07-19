# T295: Render FightScreen AIR announcements

- Type: task
- Status: resolved at bounded AIR/SFF presentation scope
- Date: 2026-07-18
- Entry: 569
- Depends on: T294

## Question

How should imported FightScreen `AnimTextSnd` animation references reach the
Three.js scene without colliding with character or FightFX sprite routes?

## Answer

Add a dedicated `FightScreenAnnouncementRenderer` with its own SFF provider.
The renderer consumes the runtime announcement mode/phase, selects numbered,
single, final, default, or Fight assets, resolves the indexed inline AIR
action, advances frames using the existing duration/loop semantics, and
projects the source layout offset, scale, facing, and localcoord into the
camera viewport. Its diagnostics distinguish inactive, missing definition,
missing action/sprite, expired display time, and resolved sprite states.

Text-only definitions remain visible through the existing HUD fallback while
the renderer reports that FNT text is outside this bounded visual slice.

## Evidence

- Focused renderer/loader/runtime/imported-fighter gate: 6 files, 325 tests
  passed.
- TypeScript 7 typecheck passed.
- The official pinned source models these components as `AnimTextSnd` backed by
  `AnimLayout`; this slice follows the AIR/SFF branch and keeps text/layout
  breadth explicit.

## Claim ceiling

This proves bounded AIR/SFF announcement presentation and route isolation. It
does not prove exact `AnimTextSnd` completion ownership, FNT rasterization,
palette effects, top/background layers, screenpack motif/localcoord fallback,
dialogue, pause persistence, teams/Turns, rollback/netplay, browser visual
parity, or full MUGEN/IKEMEN parity.
