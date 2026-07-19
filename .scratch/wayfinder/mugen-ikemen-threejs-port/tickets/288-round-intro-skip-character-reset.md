# T288: FightScreen intro-skip character reset

- Status: closed at bounded implementation scope
- Date: 2026-07-18
- Entry: 562
- Code commit: `a12a2672`

## Source contract

The pinned Ikemen-GO `system.go` `runIntroSkip` path starts the shutter on a
new button edge, signals the skip at the shutter close boundary, clears player
assets, calls `posReset`, and enters state `0`. The local pinned source is
`.scratch/external/Ikemen-GO/src/system.go:2521-2555`, with the shutter timer
boundary in `.scratch/external/Ikemen-GO/src/fightscreen.go:3434-3470`.

## Delivered

- `RuntimeRoundSystem` emits a one-shot reset signal when the shutter reaches
  the source-shaped `shutter_time + 1` edge.
- `RuntimeMatchRoundWorld` carries that signal across the timer boundary before
  the active fighter pass.
- `PlayableMatchRuntime` resets every registered root at its FightScreen start
  position, enters state `0`, restores idle animation/control, clears transient
  actor state and command history, and removes only that root's helpers,
  projectiles, and explods.
- Life, power, guard/dizzy/red-life resources, variables, team state, and
  compatibility history remain intact.

## Evidence

- Focused Vitest: 5 files / 392 tests passed.
- TypeScript 7 typecheck: passed.
- `git diff --check`: passed.
- Broad suite, build, trace, browser smoke, and release gates remain deferred
  to the grouped checkpoint requested by the execution policy.

## Claim ceiling

This proves a bounded local reset event and its actor/effect ownership. It does
not prove exact `clearPlayerAssets`, global effect reset, announcement or
round/fight display suppression, dialogue, Common1/ZSS execution,
motif/localcoord transforms, teams/Turns choreography, rollback/netplay, or
full MUGEN/IKEMEN parity. Scores remain unchanged.

## Next

Select the separate FightScreen announcement/display ownership slice with
source evidence before widening the runtime contract.
