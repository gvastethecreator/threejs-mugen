# Global checkpoint after T321

Date: 2026-07-20
Scope: FightScreen `winType` composition and repository-wide closeout
Commits:

- `b2419663` (`feat(render): compose FightScreen win type records`)
- `c065308c` (`docs: record T320 global checkpoint`)

## Delivered slice

T321 carries explicit `perfect` and `clutch` selections as ordered
special-plus-`normal` records. The runtime publishes independent named sound
edges, the audio path handles same-frame records without replaying repeated
snapshots, and the renderer allocates separate mesh slots while retaining the
existing FightScreen groups and diagnostics.

## Global evidence

- `pnpm test`: passed, 237 files / 2532 tests.
- `pnpm typecheck`: passed with the TypeScript 7 toolchain.
- `pnpm build`: passed, 323 modules; JavaScript 2,066.71 kB and gzip 518.70
  kB. The existing large-chunk advisory remains.
- `pnpm qa:trace`: passed, 633/633 artifacts; 599 required and 34 optional.
- `pnpm qa:smoke`: passed in 301.9s at `http://127.0.0.1:5300`; runtime
  desktop/mobile, MUGEN Lite, Tag, Studio, and imported journeys completed.
  Runtime canvases were nonblank with 992 desktop and 1160 mobile unique
  colors; one player hit spark resolved.
- Smoke diagnostics report empty `consoleIssues` and `pageErrors`. Studio
  Debug exposes the linked 8-frame trace and checksum `e93d530a`.

## Visual review

Reviewed fresh runtime desktop/mobile and Studio project-authoring/Debug
captures. The canvases render content at both sizes, with no critical overlap
or framing failure in the reviewed surfaces. Studio Debug still logs the
known missing `sound/kfm.mid` stage reference; existing readiness blockers
remain `project-release-decision` and `asset-validation`.

## Claim ceiling

The full port objective remains active and compatibility scores stay unchanged.
Live win-type derivation, source-equivalent multi-team arbitration, direct
screenpack proof, exact SND mixing/device parity, ZSS/Lua, rollback/netplay,
and broad MUGEN/IKEMEN parity remain open.

## Next implementation boundary

T322 should derive the bounded win type from live round facts, beginning with
the existing explicit combat and round metadata, then add a trace fixture
before widening screenpack browser evidence.
