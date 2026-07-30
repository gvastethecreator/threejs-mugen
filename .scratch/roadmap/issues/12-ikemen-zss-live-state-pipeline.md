# 12 - T427 Ikemen Live ZSS State Pipeline

Status: ready-for-agent
Labels: ikemen-runtime, zss, compiler, runtime-trace, ready-for-agent
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

`IkemenFeatureScanner` recognizes ZSS files and syntax, but
`MugenCharacterLoader` reports ZSS state sources as unsupported.
`src/mugen/da30/ZssSubsetRuntime.ts` is an isolated model and does not load or
execute character states.

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

- Direct and fallback ZSS fixtures compile to shared IR and execute live.
- One mixed CNS/ZSS character proves deterministic source order.
- The M.U.G.E.N profile rejects ZSS with a located unsupported result.
- Malformed and unsupported constructs do not partially execute or crash.
- Compatibility output distinguishes recognized, compiled, executed, and
  blocked ZSS capabilities.
- The isolated DA30 model is not used as evidence of product execution.

## Verification

- Parser/compiler/source-resolution/loader/runtime tests.
- One required live ZSS trace with controller and state-order evidence.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, and diff hygiene.
- Browser proof only if the product surface changes.

## Claim ceiling

Allowed: the explicitly named ZSS grammar/controller subset through the real
loader, shared IR, and live runtime.

Blocked: general ZSS compatibility, functions/loops/local scopes beyond the
declared subset, Lua, screenpack/system ZSS, rollback/netplay, score movement,
or full Ikemen parity.
