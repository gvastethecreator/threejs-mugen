# PlayerID Trigger Redirection v0

## Question

What is the smallest source-backed runtime slice that can admit IKEMEN
`PlayerID(id), trigger` reads without pretending that generic `RedirectID`
mutation, Helper identity, or full team scheduling already have parity?

## Primary sources

- [IKEMEN state controllers: RedirectID](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  describes `RedirectID` as an optional expression that sends controller
  execution to a designated PlayerID. The page also keeps the distinction
  between controller execution and state transitions visible.
- [Pinned IKEMEN runtime source](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1492-L1510)
  is the source anchor used for the PlayerID lookup audit. The SHA is pinned
  so later upstream edits do not silently change this decision record.

## Findings

1. `PlayerID(id), trigger` is a read redirect: expression evaluation must use
   the selected actor's projected runtime context, while the caller keeps
   ownership of the expression and its diagnostics.
2. The current runtime already owns a live root identity registry. Reusing it
   gives deterministic numeric lookup and filters unavailable identities
   without introducing a second roster implementation.
3. Active contexts can use the current pair by default, while the match-owned
   controller path can project the full live root list. Helpers are deliberately
   not admitted by this slice.
4. `PlayerID(x)` in numeric function position is only a value expression. It
   does not imply that every controller `RedirectID` mutation route is wired.
5. Negative, missing, non-finite, and unavailable IDs fail closed and report a
   typed unsupported feature where the evaluator has no live target callback.

## Decision

Implement and trace only:

- static and dynamic non-negative `PlayerID(id), trigger` redirects;
- compiler support scanning for the redirect context and the numeric function;
- propagation through active, paused, standby, and state-entry controller
  expression contexts;
- one required imported trace proving an opposing root lookup and state route.

Do not widen the claim to Helper/neutral identity, roster-wide lifecycle
ordering, controller mutation ownership, incremental failure behavior, or
complete MUGEN/IKEMEN parity.

## Evidence

- Focal runtime/compiler/context/trace batch: 7 files, 685 tests passed.
- TypeScript 7 typecheck: passed.
- `node --check scripts/qa_traces.cjs`: passed.
- `pnpm qa:trace`: 602/602 artifacts, 568 required, 34 optional, 0 failed,
  0 skipped.
- Required trace `synthetic-imported-playerid` checksum: `eac692be`.

## Next research cut

Keep `RuntimeCharacterIdentitySystem` as the identity source of truth. The next
implementation decision is root-aware scheduling/input ownership for P2-P4 and
standby roots, followed by an independent trace. Generic controller RedirectID
and mutation parity remain separate gates.
