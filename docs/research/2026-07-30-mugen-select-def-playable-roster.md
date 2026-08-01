# T426: M.U.G.E.N `select.def` playable roster/stage authority

Date: 2026-07-30
Status: closed-bounded
Issue: [11](../../.scratch/roadmap/issues/11-mugen-select-def-playable-roster.md)

## Official baseline

Elecbyte's M.U.G.E.N 1.1 [file inventory](https://www.elecbyte.com/mugendocs-11b1/mugen.html)
names `data/select.def` as character and stage configuration. Its motif
inventory separately assigns character/stage inclusion to `select.def` and
system-screen behavior to `system.def`.

## Decision

This cut promotes only direct `[Characters]` and `[Stages]` rows from a
package VFS into `MugenSelectionManifest/v0`. The manifest carries source
path, optional source/file digest, order, raw/reference/options, source
location, result, and deterministic diagnostics. It does not promote scanner
recognition, random/select parameters, unlock logic, or screenpack behavior
to execution.

## Implemented route

- `MugenSelectionManifest/v0` resolves direct entries without filesystem
  escape; malformed, duplicate, missing, traversal-like, and unsupported rows
  stay visible and non-runnable.
- `MugenSelectionImport` uses the manifest only when it supplies at least two
  characters and one stage. Otherwise the prior single-character/manual/demo
  import fallback remains intact.
- Character/stage loaders accept explicit manifest-selected DEF paths.
- The existing Play P1/P2/stage selector consumes imported roster entries.
  Separate owner SFF routes keep P1 and P2 on their own selected archives.
- Studio Build shows source path, digest, launch tuple, entry results, and
  diagnostics.

## Evidence

- Repository-authored CC0 fixture launches Select Alpha versus Select Beta on
  Skyline Relay through `data/select.def`; its reimport reverses the pair and
  changes the selected stage identity.
- Focused parser/fixture/import coverage: 2 files / 5 tests passed.
- Browser gate passed desktop and 390x844: real ZIP import, selected controls,
  keyboard focus traversal, two imported native sprites, Studio manifest,
  reimport, no horizontal overflow, and zero unexpected console errors.
- `pnpm qa:trace`: 668/668 artifacts; `pnpm qa:smoke`: passed; full suite:
  307 files / 3245 tests; typecheck, build, boundaries, and diff hygiene:
  passed.

## Claim ceiling

Allowed: direct imported roster/stage entries through the named manifest and
existing product consumer.

Blocked: full select-screen/Arcade order, random/select parameters, unlock
logic, AI ramping, `system.def` parity, online modes, release authority,
score movement, and full M.U.G.E.N parity.
