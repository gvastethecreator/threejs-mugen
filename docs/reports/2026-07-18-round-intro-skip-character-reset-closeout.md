# T288 Closeout: FightScreen intro-skip character reset

- Date: 2026-07-18
- Entry: 562
- Code commit: `a12a2672`
- Status: Closed at bounded implementation scope

## Delivered

The intro shutter now emits a source-shaped, one-shot actor-reset edge. The
playable runtime consumes it before the active fighter pass, resets all root
actors to their stage starts, re-enters state `0`, restores idle/control state,
clears transient state and command history, and removes owner-scoped effect
actors. Persistent round resources, variables, team state, and compatibility
history are preserved.

## Verification

| Gate | Result |
| --- | --- |
| Focused runtime/effect/input tests | 5 files / 392 passed |
| TypeScript 7 | Passed |
| `git diff --check` | Passed |
| Broad suite/build/trace/browser | Deferred to grouped checkpoint |

## Claim ceiling

The closeout proves the local reset event and its bounded ownership model. It
does not prove exact upstream asset clearing, global effect resets,
announcement/display suppression, dialogue, Common1/ZSS, motif/localcoord,
teams/Turns, rollback/netplay, or full MUGEN/IKEMEN parity. Scores remain
65 / 36 / 20 / 10-12 / 6-8 / 25.

## Next

T289 is the source-first announcement/display ownership slice. Its evidence
must remain separate from the character reset and from the T287 shutter bars.
