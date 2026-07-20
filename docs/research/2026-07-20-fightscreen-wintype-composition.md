# FightScreen winType composition

Date: 2026-07-20
Ticket: T321
Status: implemented at bounded special-plus-normal scope

## Official source findings

Ikemen-GO keeps the special win type beside the base `normal` record. For
`perfect` and `clutch`, the update loop steps the special record and then the
normalized `normal` record. The draw path applies the same order. Since each
record owns its timer, `time`, `displaytime`, and `sndtime`, their edges can
have different frames and can share a frame without being merged.

The local source cache is pinned to
`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Port slice

The runtime now carries an ordered `winTypes` list. Explicit `perfect` and
`clutch` selections expand to the special record followed by `normal`; other
types keep one record. Each normalized sound record becomes a named absolute
post-KO edge. Audio deduplication tracks all keys for the current round/state,
so two same-frame records play once each and a repeated snapshot does not
replay either edge.

The renderer allocates independent mesh slots for each active record in the
existing FightScreen background/text groups. Diagnostics keep the primary
`winType` view and add the full `winTypes` list for inspection.

## Evidence

- `RuntimeRoundSystem.test.ts` proves ordered composition and separate timing.
- `MugenAudioSystem.test.ts` proves two same-frame records and repeat safety.
- `FightScreenAnnouncementRenderer.font.test.ts` proves two active records,
  bitmap text, and the existing p2/AI winning-side route.
- Focused result: 3 files / 54 tests passed.
- TypeScript 7 typecheck and diff hygiene passed.

## Claim ceiling

The slice covers explicit imported special-plus-`normal` composition. Live
win-type derivation, source-equivalent multi-team arbitration, direct
screenpack proof, and full MUGEN/IKEMEN compatibility remain open.

## Source links

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- `.scratch/external/Ikemen-GO/src/fightscreen.go`
