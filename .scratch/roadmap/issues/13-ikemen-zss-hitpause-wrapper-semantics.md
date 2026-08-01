# 13 - T428 Ikemen ZSS HitPause Wrapper Semantics

Status: closed-bounded
Labels: ikemen-runtime, zss, hitpause, runtime-trace, closed-bounded
Lane: I2 bounded runtime
Priority: P2
Depends on: T427 live ZSS state pipeline

## Objective

Prove one real mixed CNS/ZSS character route where Ikemen ZSS
`ignoreHitPause { ... }` changes controller scheduling during an active global
hit pause, while an unwrapped ZSS controller stays frozen.

## Official contract

Elecbyte's M.U.G.E.N 1.1 controller reference defines `persistent` and
`ignorehitpause` as optional constant controller parameters. The official
[Ikemen ZSS guide](https://github.com/ikemen-engine/Ikemen-GO/wiki/ZSS) maps
those concepts to enclosing `persistent(n)` and `ignoreHitPause` blocks, and
allows both wrappers together before an `if` block.

## Current evidence

T427 lowers the named wrappers into the shared controller parameters and
executes a ZSS state chain, but its live fixture does not enter global hit
pause. Existing CNS-only runtime tests prove `ignorehitpause` scheduling; they
do not prove that a real parsed ZSS wrapper reaches that same live path.

## Scope

- Reuse the existing loader/shared-IR path and exact allowed ZSS controller
  list; do not admit `HitDef` or any new ZSS controller.
- Make a mixed character fixture: CNS starts the bounded hit pause and direct
  ZSS supplies the wrapped and unwrapped controllers under test.
- Prove wrapper lowering, execution during the pause, frozen unwrapped ZSS
  control, source locations, and deterministic same-tick state behavior.
- Keep the M.U.G.E.N profile's located ZSS rejection and fail-closed parser
  boundary intact.

## Acceptance

- A real loaded ZSS `ignoreHitPause` block executes during the fixture's global
  hit pause.
- A comparable unwrapped ZSS controller does not execute during that pause.
- The result is source-located in compatibility/session telemetry and in one
  required runtime trace.
- No new ZSS grammar, controller family, or broad hitpause claim is implied.

## Verification

- Focused parser, loader, scheduler, and `PlayableMatchRuntime` tests with
  positive and negative pause cases.
- One required trace with actor-frame/controller-event evidence inside the
  pause interval.
- `pnpm typecheck`, relevant suite/build/boundaries, diff hygiene, and docs.

## Closed evidence

- Separate deterministic CC0 mixed fixture preserves T427's live-trace
  checksum while CNS `StateDef 200` starts the pause and appended ZSS
  `StateDef -2` supplies the pair under test.
- Loader proof preserves declared source order, the M.U.G.E.N profile rejects
  the located ZSS reference, and the real scheduler executes only wrapped
  `.zss` `VelSet` at hit-pause tick 2; the sibling unwrapped `.zss` `PosAdd`
  has no event.
- Focused: 3 files / 12 tests. Full suite: 310 files / 3257 tests. Typecheck,
  build, boundaries, and `git diff --check` passed.
- Required trace: `ikemen-zss-hitpause-wrapper`, checksum `b6533370`, passed
  inside `pnpm qa:trace` 670/670 artifacts (636 required, 34 optional).
- No browser/smoke claim is added: this slice changes no UI or public visual
  route.

## Claim ceiling

Allowed: one direct character-state ZSS `ignoreHitPause` wrapper route through
existing global hit-pause scheduling under `ikemen-go`.

Blocked: general ZSS wrapper parity, dynamic `persistent`, new controllers,
ZSS-authored `HitDef`, Lua, system/screenpack ZSS, rollback/netplay, score
movement, or full Ikemen parity.
