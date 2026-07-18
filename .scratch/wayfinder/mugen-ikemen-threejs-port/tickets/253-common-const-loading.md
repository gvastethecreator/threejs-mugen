# Ticket 253: Common.Const constant loading

- Status: resolved bounded implementation
- Date: 2026-07-18
- Scope: merge configured IKEMEN `Common.Const` files into character constants
- Depends on: Ticket 248 / ADR 0015, Ticket 250 / ADR 0017, Ticket 252
- Research: [`docs/research/2026-07-18-common-const-loading.md`](../../../docs/research/2026-07-18-common-const-loading.md)
- Implementation: `e765822a`
- Closeout: [`docs/reports/2026-07-18-common-config-loader-closeout.md`](../../../docs/reports/2026-07-18-common-config-loader-closeout.md)

## Question

The runtime compiler already consumes parsed character constants, but the
loader ignores the configured `[Common] Const*` sources used by IKEMEN for
global/default values. This makes `Const(...)` expressions and imported
controller defaults miss values that the engine provides before loading the
character CNS.

## Bounded contract

- Read `[Common]` keys matching `Const` and `Const<number>` in natural numeric
  order.
- Resolve root-style `data/...` references and config-relative references using
  the established virtual-file rules.
- Parse existing text sources through the CNS constant parser, retaining only
  their constant map for this slice.
- Load common constants before the character `cns` constants so character-owned
  keys override common defaults.
- Load CommonConst even when the DEF has no `cns` file.
- Report missing references as loader warnings and block explicit `.zss`
  sources with unsupported evidence instead of feeding them to the CNS parser.

## Outcome

The loader now resolves ordered `[Common] Const*` entries and seeds the
constant map before parsing the character CNS. Character constants therefore
override common defaults, while CommonConst sources are retained in the
resolved-file model and can supply values without a character CNS.

## Out of scope

CommonAir, CommonCmd remap/SOCD, CommonFx, ZSS/Lua compilation, constants
outside the parsed INI sections, runtime default tables not represented in
the loader model, rollback/netplay, and complete MUGEN/IKEMEN parity.

## Acceptance evidence

- Focused loader coverage proves natural `Const*` order, common fallback keys,
  and character CNS override precedence.
- A no-character-CNS case still exposes CommonConst values.
- Missing and `.zss` references produce explicit evidence without crashing or
  polluting the parsed constants.
- Batched runtime tests, TypeScript 7 typecheck, build, repository boundary
  guards, and diff hygiene pass before closeout.

## Verification

- Loader/config focus: `31/31` tests across four files.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`,
  `pnpm check:redirect-boundary`, and `git diff --check` passed.

## Scope ceiling

This does not claim full engine default-table initialization, CommonAir/FX,
ZSS/Lua, AI input, SOCD, rollback/netplay, or complete MUGEN/IKEMEN parity.
