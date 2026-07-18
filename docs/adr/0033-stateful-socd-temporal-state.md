# ADR 0033: stateful SOCD temporal state

- Status: accepted bounded
- Date: 2026-07-18
- Implementation: `69aacf86`
- Ticket: T267

## Context

T256 implemented SOCD modes `0`-`4` over copied per-tick sets. IKEMEN's
`InputReader` also retains `SocdFirst` across calls for modes `1` and `3` and
clears it on reset. Rebuilding input as a set loses raw event timestamps, but
dropping all cross-tick state produces a known compatibility gap.

## Decision

Own one `RuntimeSocdInputState` per player seat. At tick ingress, update the
four directional slots, apply the stateful mode resolver, and pass the resolved
set through the existing routing/control/command/pause paths. Reset both states
with match/round runtime reset. Preserve the stateless resolver API when callers
do not provide a state object.

## Evidence

`RuntimeInput.test.ts` and `PlayableMatchRuntime.test.ts` pass `268` focused
tests. The grouped checkpoint passes `231/231` files / `2435/2435` tests,
TypeScript 7, build, repository boundaries, redirect boundary, and
`633/633` trace artifacts.

## Claim ceiling

The decision covers persistent first-direction state at the reconstructed Set
boundary. It does not reproduce raw device timestamps, complete IKEMEN
`InputBuffer`, AI/remapping, rollback/netplay, or full input parity.
