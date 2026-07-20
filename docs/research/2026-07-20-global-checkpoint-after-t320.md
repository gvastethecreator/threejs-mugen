# Global checkpoint after T320

Date: 2026-07-20
Scope: FightScreen `winType` sound edge and repository-wide closeout
Commit: `da09213c` (`feat(audio): route FightScreen win type sounds`)

## Delivered slice

T320 carries the selected imported FightScreen win-type sound from p1/p2
asset definitions into `RuntimeRoundSystem`, publishes its exact post-KO
`sndtime` edge while the winner display may still be pending, and routes the
edge through the existing archive lookup and one-shot audio path. The map,
ticket, and research note record the source evidence and claim ceiling.

## Global evidence

- `pnpm test`: passed, 237 files / 2530 tests.
- `pnpm typecheck`: passed with the TypeScript 7 toolchain.
- `pnpm build`: passed, 323 modules; JavaScript 2,065.29 kB and gzip 518.26
  kB. The existing large-chunk advisory remains.
- `pnpm qa:trace`: passed, 633/633 artifacts; 599 required and 34 optional.
- `pnpm qa:smoke`: passed in 290.3s at `http://127.0.0.1:5300`; runtime
  desktop/mobile, MUGEN Lite, Tag, Studio, and imported journeys completed.

## Visual review

Reviewed fresh smoke captures for runtime desktop/mobile, Studio project
authoring, and Studio Debug. The canvases rendered content at both sizes and
the reviewed surfaces had no critical overlap or framing failure. Studio
Debug still shows the known missing `sound/kfm.mid` warning; the run also
keeps the existing readiness blockers `project-release-decision` and
`asset-validation`.

## Claim ceiling

The full port objective remains active. T320 does not raise compatibility
scores: source-equivalent special-plus-`normal` win-type composition,
live win-type derivation, direct imported screenpack audio proof, exact SND
mixing/device parity, teams, rollback, ZSS/Lua, and broad MUGEN/IKEMEN parity
remain open.

## Next implementation boundary

T321 should compose the source's `perfect`/`clutch` record with the base
`normal` record, preserving independent timing, visual layers, and sound
edges before widening direct screenpack evidence.
