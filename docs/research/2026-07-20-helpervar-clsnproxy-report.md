# Implementation report: HelperVar clsnproxy

Date: 2026-07-20
Area: imported Helper expression context and direct combat admission
Scope: T351, bounded `clsnproxy` flag

## Result

The runtime now carries Helper `clsnproxy` from a typed Helper controller into
`RuntimeHelper`. `HelperVar(clsnproxy)` reads the flag in the active
`ikemen-go` Helper context and returns zero for legacy, unknown, root, or
absent-flag contexts. Proxy Helpers are skipped by the existing direct Helper
HitDef admission loop. The required imported HelperVar trace checks the new
field.

Ikemen also uses this flag to suppress direct hit/get-hit behavior while
projecting proxy collision boxes as an extension of the parent. This slice
keeps that geometry contract open and records only the typed state/read and
direct-admission boundary.

## Implementation

- `ControllerOps.ts` parses finite static values and supported scalar
  expressions into `clsnProxy` metadata.
- `EffectSpawnSystem.ts` resolves dynamic values through the existing dispatch
  expression boundary, blocks unresolved values, and removes the field from
  non-Ikemen operations.
- `HelperSystem.ts` stores the flag, exposes it to the expression context, and
  rejects direct interaction for proxy Helpers.
- `ExpressionCompiler.ts` and `ExpressionEvaluator.ts` recognize the raw
  `clsnproxy` HelperVar key while keeping unknown keys closed.
- `PlayableMatchRuntime.ts` supplies the active dispatch resolver.
- `RuntimeTraceGatePresets.ts` authors `clsnproxy = 1` and requires
  `HelperVar(clsnproxy) = 1` in the imported route.

## Evidence

- Feature commit: `813bf6d6`.
- Focused affected modules: `6` files, `759/759` tests.
- Full suite: `239/239` files, `2601/2601` tests.
- Required trace corpus: `634/634`, with `600` required and `34` optional
  artifacts; T351 HelperVar checksum `cf9710ef`.
- TypeScript 7 typecheck, build (`326` modules), and boundaries: passed.

The existing Vitest jsdom canvas warning and Vite large-chunk warning remain.
The browser gate is deferred for this runtime-only change.

## Claim ceiling

Evidence covers the current Helper-local boolean read, static/dynamic dispatch,
direct combat admission skip, and required imported trace. It does not cover
parent collision-box projection, helper-as-defender breadth, exact proxy box
flattening, nested or redirected Helpers, renderer output, or full
MUGEN/IKEMEN parity.

## Primary sources

- [Ikemen-GO `compiler.go` at the pinned revision](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler.go)
- [Ikemen-GO `bytecode.go` at the pinned revision](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go)
- [Ikemen-GO `char.go` at the pinned revision](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go)
