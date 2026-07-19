# Research: FightScreen intro-skip character reset

- Date: 2026-07-18
- Entry: 562 / T288
- Status: resolved bounded slice

## Sources

- [Ikemen-GO system.go](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go)
- [Ikemen-GO fightscreen.go](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go)
- [Elecbyte MUGEN trigger reference](https://elecbyte.com/mugendocs-11b1/trigger.html)
- Local pinned evidence: `.scratch/external/Ikemen-GO/src/system.go:2521-2555` and
  `.scratch/external/Ikemen-GO/src/fightscreen.go:3434-3470`.

## Findings

1. `runIntroSkip` does not only shorten the intro. It waits for the source
   shutter signal, clears player assets, calls `posReset`, and invokes
   `selfState(0, -1, -1, 0, "")` for each character.
2. The signal is emitted while the shutter timer equals `shutter_time + 1`,
   before that frame decrements the timer.
3. The source keeps the skip-round and skip-fight display flags while resetting
   other global effects. Those flags are not folded into this actor-only slice.
4. Character reset is therefore a distinct ownership boundary from the T287
   shutter renderer and from the still-open announcement/display path.

## Local adaptation

The runtime emits a consumable one-shot signal at the source shutter edge. The
match round world forwards it before the fighter pass, and the playable runtime
resets each root in place. The reset clears transient fighter state, target and
command memory, and owner-scoped effect actors while preserving round
resources, variables, team state, and compatibility history. State `0` entry is
then routed through the existing state-entry boundary.

The implementation intentionally does not pretend that the local effect store
is equivalent to Ikemen's complete `clearPlayerAssets`, nor does it add global
FightScreen display suppression as an incidental side effect.

## Evidence and claim ceiling

Focused tests pass at 5 files / 392 tests; TypeScript 7 typecheck and diff
hygiene pass. A broad suite/build/trace/browser checkpoint is intentionally
pending. This evidence proves only the bounded reset event, actor state
cleanup, owner-scoped effect cleanup, resource preservation, and command
history clearing. It does not prove announcement timing, exact display-flag
ownership, dialogue, Common1/ZSS, motifs, teams/Turns, rollback/netplay, or
full parity. Scores remain 65 / 36 / 20 / 10-12 / 6-8 / 25.

## Decision

Close T288 as a separate character-reset boundary. Research and implement
FightScreen announcement/display ownership next, with its own source anchors,
snapshot contract, renderer/audio evidence, and grouped quality gates.
