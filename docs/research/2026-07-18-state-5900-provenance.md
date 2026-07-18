# Research: state 5900 provenance

Date: 2026-07-18
Ticket: [T270](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/270-state-5900-provenance.md)

## Question

What source facts must the bounded round-state snapshot expose so a state-5900
availability result can be audited without overstating Common1 parity?

## Primary sources and local evidence

- Pinned official IKEMEN-GO commit
  [`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`](https://github.com/ikemen-engine/Ikemen-GO/commit/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703)
  `src/system.go` places participating characters in state `5900` during the
  round reset, selecting animation `0` or the first available animation.
- The same pinned commit's `data/common1.cns.zss` defines state `5900` as a
  standing initialization state: it conditionally resets variable ranges,
  remaps the palette, changes to `190` on round one, then changes to `0`.
- Local `src/mugen/compiler/StateSourceResolver.ts` ranks character sources
  before common sources, records selected/shadowed refs, and records
  `ikemen-negative-merge` appended refs. Its source fingerprint is explicitly
  `fnv1a32`, not a cryptographic digest.
- Local `src/mugen/runtime/RuntimeRoundState5900System.ts` currently records
  only per-actor availability from state IDs. `PlayableMatchRuntime` and
  `RuntimeTurnsContinuationSystem` both construct the actor input through
  `roundState5900Actor`.

## Decision

Keep `RuntimeRoundState5900/v0` as the outer compatibility contract. Add an
optional nested `RuntimeRoundState5900Provenance/v1` record when the actor
provides `MugenStateSourceSelection[]`. The record carries selected layer,
path, existing FNV fingerprint, precedence reason, shadowed refs, and appended
refs. A state with no matching selection is `unknown`; a missing state is
`unavailable`. Actors without source-selection metadata remain byte-compatible
with the existing demo/synthetic snapshot shape.

## Uncertainty and claim ceiling

The local loader currently provides source text fingerprints, not file digests,
so this slice must say `fingerprint` and not `SHA-256 digest`. The snapshot
does not prove that the selected state controllers execute with upstream
timing, that ZSS/Lua is equivalent to CNS, or that state-5900 persistence is
complete. Those remain separate runtime work.

## Next action

The nested provenance mapper is implemented in
`src/mugen/runtime/RuntimeRoundState5900System.ts`; imported definitions now
carry `MugenCharacter.stateSources`, and `PlayableMatchRuntime` passes them to
the normal-round and Turns state-5900 world. Implementation commit:
`f2c4b2a0`.

## Verification

- `pnpm exec vitest run src/tests/RuntimeRoundState5900System.test.ts src/tests/importedFighter.test.ts src/tests/PlayableMatchRuntime.test.ts --reporter=dot` passed: `3` files / `279` tests.
- `pnpm typecheck` passed with TypeScript 7.
- `git diff --check` passed for the changed implementation surface.
- Browser smoke is N/A: no visible consumer changed.

## Claim ceiling after implementation

The snapshot now proves selected state-5900 source metadata at the bounded
runtime boundary. It still does not prove exact state-5900 controller timing,
variable/palette persistence, winpose/motif choreography, Common1/ZSS parity,
semantic equivalence, rollback/netplay, or full MUGEN/IKEMEN parity.
