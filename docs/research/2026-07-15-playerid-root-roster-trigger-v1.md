# PlayerID Root-Roster Trigger v1

## Question

Can an IKEMEN `PlayerID(id), trigger` read be evaluated from a standby root
against a live root outside that root's current active pair, without widening
the redirect claim to generic `RedirectID` mutation or Helper identity?

## Primary sources

- [IKEMEN state controllers: RedirectID](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  documents the controller-level redirect concept and keeps the selected
  PlayerID target distinct from the caller's controller execution.
- [Pinned IKEMEN runtime source](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1492-L1510)
  remains the pinned lookup anchor used by the v0 audit.

## Findings

1. The prior active-expression path projected only the current actor/opponent
   pair. That was sufficient for an opposing-root trace but insufficient for a
   standby root reading P1 in a tag roster.
2. The match already owns the authoritative live root list and numeric
   identity registry. Passing that list into active trigger contexts removes
   the pair-only gap without creating a second roster or identity source.
3. The match-owned PlayerID callback still filters through the identity
   registry and keeps legacy profiles fail-closed. The callback is bound to the
   caller, so a standby root can read another root without taking ownership of
   that target's controller execution.
4. `Enemy` and `EnemyNear` continue to use their existing opponent projection;
   the full-root projection is supplied for PlayerID lookup only.
5. Standby CNS evidence is observed as executed/final state plus reserve actor
   frames. It is not labelled as an active `routedState`, so the trace gate
   checks the correct telemetry contract instead of manufacturing a stronger
   claim.

## Decision

Implement and trace only:

- full live root roster projection for active `PlayerID(id), trigger` reads;
- match-owned identity callback propagation through active, paused, standby,
  and state-entry paths;
- a required imported tag trace proving `p3` standby reads P1 and reaches state
  `2794` while retaining standby/effective-control evidence.

Do not widen the claim to Helper/neutral identity, generic controller
`RedirectID` mutation, exact tag scheduling order, input/combat/effect
ownership, dynamic lifecycle promotion, or complete MUGEN/IKEMEN parity.

## Evidence

- Focused runtime/compiler/context/trace batch: 7 files, 845 tests passed.
- TypeScript 7 typecheck: passed.
- `node --check scripts/qa_traces.cjs`: passed.
- `pnpm qa:trace`: 603/603 artifacts, 569 required, 34 optional, 0 failed,
  0 skipped.
- Required trace `synthetic-imported-playerid-root-roster` checksum:
  `ac6f6a4b`.

## Next research cut

Keep `RuntimeCharacterIdentitySystem` and the live root roster as the source of
truth. The next independent gate should cover root-aware scheduling/input
ownership beyond this read-only expression projection. Generic RedirectID
mutation and Helper/neutral lookup remain separate decisions.
