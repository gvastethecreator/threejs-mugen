# Ticket 267: stateful SOCD temporal state

- Status: resolved bounded
- Date: 2026-07-18
- Scope: preserve IKEMEN `SocdFirst` state across reconstructed runtime input
  sets for modes `1` and `3`
- Depends on: [T256](256-socd-resolution.md)
- Implementation: `69aacf86`
- Research: [`docs/research/2026-07-18-stateful-socd-temporal.md`](../../../../docs/research/2026-07-18-stateful-socd-temporal.md)

## Question

Can the current set-based browser input boundary preserve the temporal
first-direction state required by IKEMEN without pretending that a set carries
raw device event timestamps?

## Answer

Yes, within a bounded reconstructed-input contract. Runtime now owns one
`RuntimeSocdInputState` per seat, updates its four directional slots at tick
ingress, applies modes `1` and `3` from that state, and clears it on match/
round runtime reset. The first simultaneous pair remains deterministic because
the public input boundary exposes a set rather than an ordered device-event
stream.

## Evidence

- Pinned IKEMEN `InputReader.SocdFirst` and `Reset` were checked in
  `.scratch/external/Ikemen-GO/src/input.go` at commit
  `044da72008b8ba13caf7b0f820526ce16e955fb3`.
- Focused `RuntimeInput` and `PlayableMatchRuntime` tests pass `2` files /
  `268` tests.
- Grouped checkpoint passes `231/231` files / `2435/2435` tests, TypeScript 7,
  production build, repository boundaries, redirect boundary, and
  `633/633` trace artifacts.
- Browser smoke is N/A: no renderer, Studio, or visible surface changed.

## Claim ceiling

This closes temporal state preservation for the reconstructed per-seat Set
boundary. Raw hardware event ordering, full IKEMEN `InputBuffer`, AI,
remapping, rollback/netplay, and complete MUGEN/IKEMEN input parity remain open.
