# 12 - T427 Ikemen Live ZSS State Pipeline

Status: closed-bounded
Labels: ikemen-runtime, zss, compiler, runtime-trace, closed-bounded
Lane: I2 bounded runtime
Priority: P2
Depends on: T424 and the current source-authority/scanner contracts

## Objective

Create the first real ZSS character path from package loading through parsing,
shared state IR, and `PlayableMatchRuntime`, with located fail-closed reporting
for every construct outside the declared subset.

## Official contract

The official [Ikemen ZSS guide](https://github.com/ikemen-engine/Ikemen-GO/wiki/ZSS)
defines ZSS as an executable alternative to CNS, permits CNS and ZSS files in
one character, and supports a `.cns.zss` fallback for a missing CNS reference.

## Current evidence

`parseZss` now lowers a declared grammar/controller subset through the existing
state source resolver and compiler. Direct `.zss`, missing-CNS `.cns.zss`
fallback, and mixed CNS/ZSS sources reach `PlayableMatchRuntime` under
`ikemen-go`; M.U.G.E.N receives a located rejection. The historical
`src/mugen/da30/ZssSubsetRuntime.ts` remains non-product evidence.

## Scope

- Parse a reusable first grammar slice: `StateDef`, ordered controller calls,
  `if`/`else`, expression-backed parameters, and the documented
  `ignoreHitPause`/`persistent` wrappers needed by the fixture.
- Lower supported constructs into existing `StateProgramIr`; avoid a parallel
  runtime or hard-coded fixture interpreter.
- Support direct `.zss` state references and `.cns.zss` fallback under the
  explicit `ikemen-go` profile.
- Define deterministic CNS/ZSS source ordering and preserve source locations.
- Execute a representative state chain with at least one state change and one
  runtime mutation through the real character loader and match runtime.
- Keep functions, loops, local-variable breadth, Lua, unsafe I/O, and ungranted
  controllers explicit in capability diagnostics until implemented.

## Acceptance

- [x] Direct and fallback ZSS fixtures compile to shared IR and execute live.
- [x] One mixed CNS/ZSS character proves deterministic source order.
- [x] The M.U.G.E.N profile rejects ZSS with a located unsupported result.
- [x] Malformed and unsupported constructs do not partially execute or crash.
- [x] Compatibility output distinguishes recognized, compiled, executed, and
  blocked ZSS capabilities.
- [x] The isolated DA30 model is not used as evidence of product execution.

## Verification

- Focused parser/loader/runtime/scanner: 4 files / 21 tests.
- Required live trace: `ikemen-zss-live`, checksum `47c627a2`; `pnpm qa:trace`
  passed 669/669 artifacts (635 required, 34 optional).
- `pnpm test` 309/3254, `pnpm typecheck`, `pnpm build`, and
  `pnpm check:boundaries` passed. The build retained its existing large-chunk
  warning.
- Full `qa:smoke` stopped at Vite startup before Chrome. A static production
  preview instead captured desktop/mobile Match UI with one visible canvas and
  zero console/page errors; it is focal visual evidence only, not global smoke
  promotion.

## Completion

Closed on 2026-07-30. The executable set is `StateDef`, ordered `Null`,
`PosAdd`, `ChangeState`, and `VelSet`; `if`/`else`, `#` comments,
`ignoreHitPause`, and positive-integer `persistent(n)` are admitted only as
the named parser forms. An ungranted controller or malformed construct blocks
its complete ZSS source.

## Claim ceiling

Allowed: the explicitly named ZSS grammar/controller subset through the real
loader, shared IR, compatibility telemetry, and live runtime.

Blocked: general ZSS compatibility, functions/loops/local scopes beyond the
declared subset, Lua, screenpack/system ZSS, rollback/netplay, score movement,
or full Ikemen parity.
