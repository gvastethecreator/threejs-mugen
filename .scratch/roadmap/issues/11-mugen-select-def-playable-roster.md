# 11 - T426 M.U.G.E.N select.def Playable Roster And Stage Authority

Status: ready-for-agent
Labels: mugen-compat, loader, product-route, browser-proof, ready-for-agent
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

The package scanner recognizes `select.def`, and local project state owns P1,
P2, and stage IDs. No imported `select.def` currently owns the live roster or
stage selector; scanner recognition therefore earns no execution credit.

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

- Parser/VFS/manifest tests plus one product integration test.
- Focused browser gate for the real selection surface.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, relevant runtime
  traces, and diff hygiene.

## Claim ceiling

Allowed: direct imported roster/stage entries through the named manifest and
consumer.

Blocked: full Arcade ordering, random/select parameters, hidden/unlock logic,
AI ramping, `system.def` screenpack parity, online modes, release authority,
score movement, or full M.U.G.E.N parity.
