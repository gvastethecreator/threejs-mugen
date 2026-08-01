# 11 - T426 M.U.G.E.N select.def Playable Roster And Stage Authority

Status: closed-bounded
Labels: mugen-compat, loader, product-route, browser-proof, closed-bounded
Lane: R1 package/runtime compatibility
Priority: P1
Depends on: existing VFS, character loader, and stage loader

## Objective

Turn an imported `data/select.def` from a scanner-only signal into a versioned
roster/stage manifest consumed by one real Play or Studio selection route.

## Official contract

Elecbyte's [M.U.G.E.N 1.1 file inventory](https://www.elecbyte.com/mugendocs-11b1/mugen.html)
defines `select.def` as the character/stage configuration and describes a game
as assembled from characters, stages, and motif resources.

## Current evidence

`MugenSelectionManifest/v0` now owns direct VFS-resolved rows and feeds the
existing P1/P2/stage selector plus MatchWorld. A CC0 fixture launches Select
Alpha versus Select Beta on Skyline Relay; its reimport swaps the selected
pair and changes the selected stage identity. Scanner recognition remains a
separate non-execution contract.

## Scope

- Add `MugenSelectionManifest/v0` with source path/fingerprint and located
  character/stage entries.
- Parse direct `[Characters]` and stage-list entries needed for a playable
  vertical slice, including comments/options without unsafe path expansion.
- Resolve through the package VFS; keep missing, malformed, duplicate, and
  unsupported entries visible and non-fatal.
- Connect the manifest to one real selection surface and runtime launch path.
- Preserve the existing manual/demo fallback when no valid imported selection
  manifest is present.
- Keep Ikemen-only unlock/menu expressions recognized but unsupported unless a
  later issue grants execution.

## Acceptance

- A legal repository-owned fixture imports at least two characters and one
  stage through `select.def` and can launch the selected pair/stage.
- Missing and traversal-like entries fail closed with source locations.
- Duplicate/order behavior is deterministic and serialized in the manifest.
- Reload/reimport updates the visible roster without stale selection IDs.
- Focus, keyboard operation, narrow viewport fit, and zero unexpected console
  errors are browser-verified if UI changes.

## Verification

- Parser/VFS/manifest and MatchWorld integration: 2 files / 5 tests passed.
- Focused Playwright browser gate: desktop + 390x844 mobile, ZIP import,
  selection controls, keyboard focus traversal, Studio manifest, reimport,
  no overflow, and zero unexpected console errors.
- `pnpm qa:trace` 668/668, `pnpm qa:smoke`, 307 files / 3245 tests,
  `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, and
  `git diff --check` passed.

## Completion

Closed on 2026-07-30. The final browser report is
`.scratch/qa/t426-select-def/report.json`; its fixture and browser gate are
repository-owned and deterministic.

## Claim ceiling

Allowed: direct imported roster/stage entries through the named manifest and
consumer.

Blocked: full Arcade ordering, random/select parameters, hidden/unlock logic,
AI ramping, `system.def` screenpack parity, online modes, release authority,
score movement, or full M.U.G.E.N parity.
