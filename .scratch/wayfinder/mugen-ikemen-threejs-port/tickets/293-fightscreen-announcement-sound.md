# T293: Route FightScreen announcement sounds

- Type: task
- Status: resolved at source-sound routing scope
- Date: 2026-07-18
- Entry: 567
- Depends on: T289, T290, T291

## Question

How can the imported Round/Fight announcement sound edges use the actual
`fight.def` SND bank without colliding with character SND or FightFX banks?

## Answer

Parse bounded `round.default.snd` and `fight.snd` references, load the
`[Files] snd` archive as `fightScreenAssets`, and carry those references into
the runtime announcement tracks under the dedicated `fs` audio prefix. The
browser audio system consumes each edge once per round/phase and retains the
existing actor/FightFX routing.

The same asset bundle records the `fight.def` inline action table and screen
SFF/SND paths for the next renderer slice. No screen animation is drawn in
this task.

## Claim ceiling

This proves bounded source reference transport, dedicated SND archive loading,
and one-shot Web Audio routing. It does not prove exact per-round/single/final
announcement selection, `AnimTextSnd` completion, AIR/FNT/SFF rendering,
dialogue, motif/localcoord transforms, pause persistence, teams/Turns,
rollback/netplay, or full MUGEN/IKEMEN parity.
