# T537 — Fighter Lab Animation Testbench

- Status: `closed-bounded`
- Lane: `C1 / C4`
- Priority: `P1`
- Surface: `?mode=lab&labView=testbench`

## Objective

Add a character test view that exposes every loaded animation and the package
components that a reviewer must inspect before a playtest.

## Delivered

- Added a `testbench` Fighter Lab view with URL state.
- Added roster selection for every loaded fighter.
- Added an action matrix for every animation row, including shared VFX rows.
- Added per-action frame count, timing, and hit/hurt box totals.
- Added component health for sprites, AIR, collision, VFX, runtime links, and
  motion QA.
- Added a contextual frame scrubber, current collision list, and evidence links.
- Reset the navigation drawers when the Lab view changes.

## Evidence

- `pnpm qa:browser:fighter-lab` passed.
- Browser gate covers the `testbench` route, 17 action cards, 6 component cards,
  action 510 selection, and a WebGL screenshot.
- Screenshot: `.scratch/qa/fighter-lab-gate/character-testbench.png`.
- `pnpm typecheck` passed.

## Claim ceiling

This view inspects the current native and imported runtime definitions. It does
not claim full AIR/SFF/CNS/CMD parity, editable authoring, or new compatibility
score movement. The view remains read-only and uses the existing Fighter Lab
runtime and atlas routes.
