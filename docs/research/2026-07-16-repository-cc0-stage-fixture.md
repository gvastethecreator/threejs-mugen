# Research: repository-authored CC0 stage fixture

Date: 2026-07-16
Lane: R1 compatibility evidence
Wayfinder ticket: 217

## Question

Which first-party fixture can provide materially different MUGEN-format
package assumptions while staying safe to redistribute and deterministic to
test?

## Decision

Use a small repository-authored stage package, `repository-skyline-relay`,
rather than a copied third-party stage. The package contains only generated or
authored repository bytes: a stage DEF, a generated SFF v1 archive, a local
`data/mugen.cfg`, and an explicit CC0 license file. Its manifest names the
entry, expected routes, provenance, and assumptions.

The stage deliberately varies the corpus assumptions: localcoord `640,480`,
game space `1280,720`, player Z starts and top/bottom depth bounds, no music
file, `resetBG = 0`, a tiled layer, an animated layer with embedded AIR, and a
bounded `VelAdd` BG controller. The production loader/report proves these
features without claiming that the stage is already a complete browser or
runtime journey.

## Primary source findings

[Elecbyte's MUGEN 1.1b1 background/stage documentation](https://www.elecbyte.com/mugendocs-11b1/bgs.html)
defines the stage DEF groups and requires the `[BGDef]` block before the
background elements. It also documents static, animated, and controller
background structures used by the fixture.

[Elecbyte's coordinate-space documentation](https://www.elecbyte.com/mugendocs/coordspace.html)
separates the game coordinate space from the stage `localcoord`; the fixture
records both independently so the loader path exercises that distinction.

## Evidence design

- Machine-readable license and provenance are part of the exported manifest
  and fixture files.
- All VFS paths are relative and traversal-free.
- The package digest hashes sorted virtual paths plus bytes, so two fresh VFS
  builds produce the same `sha256` identity.
- `MugenStageLoader` must discover and load the stage, resolve its SFF and
  config, and `createStageCompatibilityReport` must expose the animated,
  tiled, controller, depth, and decoded-sprite assumptions.

## Claim boundary

Allowed: a second repository-authored CC0 MUGEN-format stage input with stable
loader/report evidence and materially distinct stage assumptions.

Blocked: runtime trace, native/browser evidence, snapshot aggregation,
independent arbitrary-package compatibility, legal review beyond the explicit
repository license, score movement, and complete MUGEN/IKEMEN stage parity.
