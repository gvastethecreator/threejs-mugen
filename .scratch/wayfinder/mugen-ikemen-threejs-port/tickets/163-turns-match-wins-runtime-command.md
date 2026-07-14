# Ticket 163: Runtime command for match win targets

Status: closed
Entry: 524

## Question

How should the browser runtime expose IKEMEN's live `setMatchWins(teamSide,
wins)` mutation without conflating it with Lua/ZSS execution?

## Source-backed decision

- IKEMEN's official Lua bridge validates team side `1` or `2` and writes the
  requested win target into `matchWins` in
  [`script.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/script.go?plain=1#L6595-L6608).
- Match closure is evaluated from positive side wins reaching the side target
  in [`system.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1#L1485-L1489).
- Lua/ZSS remains scanner-only in the browser port, so this slice exposes a
  typed runtime adapter and keeps script execution outside the claim.

## Implementation

- `RuntimeMatchOutcomeSystem.setMatchWins` mutates one bounded side target,
  recomputes the published aggregate target, and closes an already reached
  score without inventing another round.
- `PlayableMatchRuntime` accepts `set-match-wins` only under the explicit
  `ikemen-go` profile.
- The existing MatchWorld facade routes the live mutation and keeps the
  side-specific target visible in the outcome snapshot.

## Evidence

- `RuntimeMatchOutcomeSystem.test.ts` and `MatchWorld.test.ts`: 24 tests passed.
- TypeScript 7 typecheck and `git diff --check`: passed.
- Code commit: `19220794 feat: expose IKEMEN match win target mutation`.
- Broad test, trace, build, and browser gates are batched with Entry 523.

## Claim ceiling

This is a bounded typed runtime adapter for the official setter. It does not
execute Lua/ZSS, claim exact zero-win training semantics, or provide complete
rollback/netplay or MUGEN/IKEMEN parity.
