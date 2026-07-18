# Research: stateful SOCD temporal state

Date: 2026-07-18
Ticket: [T267](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/267-stateful-socd-temporal-state.md)

## Question

What minimum state must the Three.js input boundary retain to match IKEMEN's
first/last-direction behavior for SOCD modes `1` and `3`?

## Primary sources

- [IKEMEN-GO `input.go` at the local pinned cache revision](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/input.go#L425-L629)
  defines `InputReader.SocdFirst`, zero-value reset, and mode-specific conflict
  resolution.
- Local mirror: `.scratch/external/Ikemen-GO/src/input.go`, commit
  `044da72008b8ba13caf7b0f820526ce16e955fb3`, lines `425-629`.
- Runtime boundary: `src/mugen/runtime/RuntimeInput.ts` and
  `src/mugen/runtime/PlayableMatchRuntime.ts`.

## Findings

- IKEMEN stores four directional first-state flags: up, down, back, forward.
- The flags clear when neither member of an opposing pair is held, and reset
  with the input reader.
- Modes `1` and `3` consume that persistent state; a per-call iteration order
  is not enough to model a held direction across ticks.
- The browser runtime receives an input `Set`, so it cannot recover the exact
  timestamp order of two directions first introduced in the same set.

## Decision

Add `RuntimeSocdInputState` with four booleans per seat. Update it at tick
ingress, use it only for modes `1` and `3`, and reset both seats at runtime
match/round reset. Keep the old pure function behavior when no state object is
provided so non-match callers retain the prior contract.

## Outcome and uncertainty

Implemented in `69aacf86`; focused coverage is `2` files / `268` tests. This
closes temporal persistence for reconstructed sets. Raw device events,
IKEMEN's complete input buffer, and first-press timestamp recovery remain
unavailable and are intentionally outside the claim.

## Next decision

Keep input authority diagnostics separate from temporal state. The next
authority slice must make package/runtime/profile precedence observable without
silently inventing a global match configuration owner.
