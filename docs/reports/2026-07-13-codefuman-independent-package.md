# Code Fu Man Independent Package Report

Date: 2026-07-13
Area: independent character-package compatibility
Roadmap entry: 481
Wayfinder ticket: 131

## Decision

Code Fu Man is accepted as the second independently sourced legal package for
bounded compatibility evidence. It stays an optional local fixture: the
repository does not bundle the character assets, and clean environments keep
the route skipped rather than claiming support without the source package.

## Provenance

- Source repository: [Jesuszilla/CodeFuMan](https://github.com/Jesuszilla/CodeFuMan).
- Local source audit: `.scratch/external/CodeFuMan-master/CodeFuMan-master/`.
- Local license evidence: `chars/cfm/LICENSE`, MIT License, copyright Jesuszilla
  2019.
- Packaged entry: `chars/cfm/cfm.def`.
- Archive: `.scratch/fixtures/codefuman.zip`, 307511 bytes.
- Archive SHA-256: `7974f5101a3f3bca0ef3aef3b491fc34d81cbc132d91b53a51b78f34819b1ca0`.
- Exact archive entries: 20, including `data/common1.cns`, six ACT palettes,
  DEF/CMD/CNS/AIR/SFF/SND, README, and license.

## Delivered

- Added `ExternalFixtureManifest/v1` with source, license, archive hash, exact
  entries, expected loader identity, commands, states, and animations.
- Added optional fixture tests for archive provenance and the production
  `ZipCharacterSource -> MugenCharacterLoader -> createImportedFighterDefinition`
  path.
- Added `codefuman-independent-x` to `qa:trace` through the typed runtime
  preset. The route is not copied from the repository-owned MUGEN-lite trace.
- Added an optional desktop Playwright gate to `qa:smoke`: real ZIP upload,
  imported idle, authored `x` route to state `200`, real AIR action `1055`,
  nonblank canvas/sprite evidence, and return to idle.

## Evidence

- Focused fixture tests: `3/3` passed.
- Runtime artifact: `.scratch/qa/trace-gates/codefuman-independent-x.json`.
- Runtime checksum: `91e27e22`; initial `3bb8fbdd`; final `827caf7d`; 14 frames.
- Runtime gate requires imported ownership, active command `x`, routed and
  executed state `200`, `ChangeState`, `HitDef`, `hitdef`, and a real hit event.
- Trace final actor reports state `200`, AIR action `1055`, one target, and
  imported source ownership.
- Browser diagnostics: `.scratch/qa/qa-smoke/diagnostics.json`.
- Browser idle: state `0`, action `0`, sprite frame `0,4`, 989 sampled canvas
  colors and 2431 projected sprite colors.
- Browser attack: state `200`, action `1055`, frame `0`, 993 sampled canvas
  colors and 3351 projected sprite colors; idle return passed.
- Full trace catalog: `579/579` artifacts passed, `547` required and `32`
  optional. The Code Fu Man artifact is optional because the ZIP is local and
  ignored by git.

## Claim Ceiling

Allowed: one independently sourced MIT character package crosses local archive
provenance, production loader, imported runtime state `200`/`x` contact, and a
desktop Three.js browser render with explicit evidence.

Blocked: public asset bundling, arbitrary character corpus support, exact
Common1 timing, exact Code Fu Man visual/audio/AI parity, QCF/special breadth,
helper/projectile ownership, commercial assets, broad controller parity, score
movement, and full MUGEN/IKEMEN parity.

## Quality Record

- `pnpm test`: `185` files / `1962` tests passed.
- `pnpm typecheck`: passed.
- `pnpm check:boundaries`: passed.
- `pnpm build`: passed; existing Vite large-chunk advisory remains (`1,662.07
  kB` JavaScript, `417.62 kB` gzip).
- `pnpm qa:trace`: passed, `579/579` artifacts.
- `pnpm qa:smoke`: passed, including the Code Fu Man browser gate and all
  existing runtime/Studio surfaces.

## Closure Audit

- The package hash and exact file list prevent a different local archive from
  silently standing in for the audited source.
- The runtime trace requires an authored command/state/controller route and a
  hit event; it cannot pass from the MUGEN-lite fixture checksum.
- The browser gate accepts the package's actual AIR action (`1055`) rather than
  imposing the previous fixture's action numbering.
- Missing local assets skip only this optional package route; they do not turn
  into a public compatibility claim.
- Scores remain unchanged. The next frontier is a separate Code Fu Man special
  route map before any broader corpus claim.
