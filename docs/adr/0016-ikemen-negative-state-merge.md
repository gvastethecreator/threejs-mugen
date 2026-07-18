# ADR 0016: IKEMEN Negative State Merge

- Status: Accepted bounded loader contract
- Date: 2026-07-18
- Last reviewed: 2026-07-18 at HEAD `0c42c770`
- Scope: imported character `st*` and `stcommon` CNS sources
- Implementation: [`0c42c770`](https://github.com/gvastethecreator/threejs-mugen/commit/0c42c770)
- Closeout: [`docs/reports/2026-07-18-ikemen-negative-state-merge-closeout.md`](../reports/2026-07-18-ikemen-negative-state-merge-closeout.md)
- Research: [`docs/research/2026-07-18-ikemen-negative-state-merge.md`](../research/2026-07-18-ikemen-negative-state-merge.md)

## Context

Ticket 248 established deterministic character `st*` ordering and
character-before-`stcommon` source ownership, but intentionally kept duplicate
state identities first-listed. The pinned IKEMEN compiler uses a different
bounded rule for negative states when a character declares `ikemenversion`:
later source files reuse the existing negative state block and append their
controllers, while normal states keep the first compiled identity.

## Decision

1. Keep `first-wins` as the resolver default.
2. Select `ikemen-append` only when the imported DEF contains a non-empty
   `ikemenversion` value.
3. Under `ikemen-append`, merge repeated `-4`, `-3`, `-2`, `-1`, and literal
   `+1` identities across distinct ordered state sources.
4. Preserve the first state identity/source, let later explicitly authored
   state fields override earlier fields, and append later controllers in
   source order with their own source refs.
5. Do not append duplicate identities within one source file; keep the later
   occurrence as shadowed evidence.
6. Keep normal numeric state duplicates first-listed and shadowed.

## Consequences

Positive:

- explicit IKEMEN negative-state composition is no longer silently reduced to
  one file;
- controller and selection provenance remains inspectable;
- MUGEN, unknown, and legacy packages retain the prior first-wins behavior.

Boundaries:

- CMD state-source interaction, global `Common.States`, ZSS/Lua insertion,
  helper-specific input buffers, and complete engine parity remain open;
- this is source resolution and runtime-program input evidence, not a claim of
  complete negative-state bytecode or timing parity.

## Evidence

- `91/91` focused loader/compiler compatibility tests passed.
- `230/230` test files and `2371/2371` tests passed after implementation.
- TypeScript 7 typecheck/build and both repository boundary guards passed.
