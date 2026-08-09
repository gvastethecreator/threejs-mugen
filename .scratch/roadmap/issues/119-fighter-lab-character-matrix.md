# Issue 119 — Fighter Lab Character Matrix

- Status: `closed-bounded`
- Lane: `C4 product tooling`
- Priority: `P1`

## Objective

Add one roster-wide view that makes every loaded character, animation, and
package component easy to inspect and launch in the isolated Fighter Lab.

## Closeout

- `?mode=lab&labView=matrix` shows every loaded fighter and every available
  action in one scrollable matrix.
- Each fighter exposes sprites, AIR, collision, VFX, runtime, and motion-QA
  status without creating a second data source.
- Any action button selects its fighter, updates URL state, and drives the
  existing preview runtime. The right lens reuses the Testbench frame,
  `AnimElemVar`, `AnimLength`, `ClsnVar`, collision, and evidence views.
- The browser gate proves 2 fighters, 34 actions, 12 component checks, Nadia
  Action 510 selection, one active action, WebGL rendering, and zero console or
  page errors. `character-matrix.png` records visual evidence.
- Typecheck, production build, boundaries, CSS budget, and diff hygiene pass.
  The broad smoke gate timed out after 180 seconds and is not counted as a pass.

## Claim ceiling

This is read-only product tooling over the currently loaded roster. It does not
edit packages, add character content, or raise MUGEN/Ikemen compatibility
scores.
