# Global checkpoint after T316

Date: 2026-07-20
HEAD: `7837279a`

## Delivered slice

T316 carries the selected FightScreen result context into the runtime. The
winner display snapshot now includes optional `RuntimeRoundWinnerDisplaySelection/v0`
data for family, active side, and variant. Result asset sounds travel through
the matching per-family matrix and reach the existing one-shot `fs` audio edge.
The renderer consumes the selection and presents the selected p1/p2 or AI
result asset when its runtime caller supplies the context.

The PlayableMatchRuntime round boundary publishes p1/p2 side order. It keeps
the default winner family until its runtime has an explicit AI-level and team
result contract. Compatibility scores and full-port claims remain unchanged.

## Verification

- Focused Runtime, renderer, loader, audio, and PlayableMatchRuntime suites:
  5 files / 322 tests passed.
- Full suite: 237 files / 2527 tests passed.
- `pnpm typecheck`: passed with the repository TypeScript 7 toolchain.
- `pnpm build`: passed with 323 transformed modules. The known large-chunk
  warning remains; the main JavaScript bundle is about 2.060 MB before gzip.
- `pnpm qa:trace`: passed with 633/633 artifacts, including 599 required and
  34 optional artifacts, with 0 failed artifacts.
- `pnpm qa:smoke`: passed across Runtime and Studio desktop/mobile routes in
  312.4 seconds. Root diagnostics report 0 console issues and 0 page errors.
- Capture review: Runtime desktop/mobile and Studio authoring/debug stayed
  visible without critical overlap. Studio Debug retains one pre-existing
  missing stage sound warning.
- `git diff --check`: passed for the T316 implementation and checkpoint.

## Global status

The port now has source-shaped result assets and a bounded runtime selection
contract on top of the T314 winner phase. The global port remains partial and
evidence-bound. Current scorecards and full MUGEN/IKEMEN compatibility claims
stay unchanged.

## Remaining boundary

- Exact AI level, team `numSimul`, active roster, and source result conditions.
- `winType` families for normal, special, hyper, cheese, time, throw, suicide,
  teammate, perfect, and clutch results.
- Exact `handleRoundOutro` ordering, legacy delay, release ownership, and
  source skip flags.
- Dialogue, motifs, direct imported screenpack browser proof, and exact sound
  sequencing.
- Exact palette, source aspect/anchor, `perspective2`, tile, and parallax
  behavior.
- Broader runtime ownership, rollback/netplay, Studio editing breadth, and
  full MUGEN/IKEMEN parity.

## Next implementation boundary

Load the source `winType` display families as a separate typed contract,
including p1/p2 prefixes and the perfect/clutch aliases. Keep selection tied to
explicit runtime result metadata and leave unproven result types diagnostic.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go

## Local source cache

- `.scratch/external/Ikemen-GO/src/fightscreen.go` and
  `.scratch/external/Ikemen-GO/src/system.go`, pinned at revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Out Of Scope

- Replacing the existing roadmap docs; this checkpoint records current
  evidence and the next executable boundary.
- Claiming full MUGEN/IKEMEN parity without the required imported-source and
  browser artifacts.
