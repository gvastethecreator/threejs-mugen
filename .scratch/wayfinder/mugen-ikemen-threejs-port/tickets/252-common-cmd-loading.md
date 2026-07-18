# Ticket 252: Common.Cmd command-source loading

- Status: resolved bounded implementation
- Date: 2026-07-18
- Scope: merge configured IKEMEN `Common.Cmd` sources into character command parsing
- Depends on: Ticket 250 / ADR 0017, Ticket 251 / ADR 0018
- Implementation: `991613f7`
- Closeout: [`docs/reports/2026-07-18-common-config-loader-closeout.md`](../../../docs/reports/2026-07-18-common-config-loader-closeout.md)
- Research: [`docs/research/2026-07-18-common-cmd-loading.md`](../../../docs/research/2026-07-18-common-cmd-loading.md)

## Question

The loader now has a bounded command buffer for helpers, but it only parses the
character's `[Files] cmd` source. IKEMEN appends configured `[Common] Cmd*`
files to that command text before compiling the character command list. Without
this merge, a real `data/common.cmd` command cannot reach root or helper
command predicates.

## Bounded contract

- Read `[Common]` keys matching `Cmd` and `Cmd<number>` in natural numeric order.
- Resolve root-style `data/...` references and config-relative references using
  the same virtual-file path rules already used by global `Common.States`.
- Append existing `.cmd` sources after the character command source, then run
  one `parseCmd` pass so defaults, remaps, command order, and buffer metadata
  retain one parser boundary.
- Load CommonCmd even when the DEF has no character `cmd` file.
- Report missing CommonCmd references as loader warnings and report explicit
  ZSS references as unsupported without feeding them to the CMD parser.
- Keep character CMD `[State -1]` extraction scoped to the character CMD text;
  CommonCmd contributes commands only in this bounded slice.

## Outcome

The loader now resolves ordered `[Common] Cmd*` entries, appends supported
`.cmd` text after the character command source, and parses the merged text once.
Resolved CommonCmd paths are retained in `MugenCharacter.files`, and the
compatibility report marks CMD as present when only a common source supplies
the command list. Common ZSS and missing paths remain explicit evidence.

## Out of scope

CommonConst, CommonAir, CommonFx, ZSS/Lua command compilation, raw IKEMEN
command/input internals, AI command generation, SOCD policy, rollback/netplay,
and complete MUGEN/IKEMEN parity.

## Acceptance evidence

- Focused loader coverage proves character commands precede CommonCmd commands,
  numeric `Cmd*` ordering is stable, and config-relative fallback works.
- A no-character-CMD case still exposes a CommonCmd command to the parsed
  character model.
- Missing and `.zss` references produce explicit diagnostics/unsupported
  evidence without crashing or contaminating the command list.
- Batched runtime tests, TypeScript 7 typecheck, build, repository boundary
  guards, and diff hygiene pass before closeout.

## Verification

- Loader/config focus: `31/31` tests across four files.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`,
  `pnpm check:redirect-boundary`, and `git diff --check` passed.

## Scope ceiling

This does not claim CommonConst/AIR/FX parity, ZSS/Lua command compilation,
raw IKEMEN input internals, AI command generation, SOCD, rollback/netplay, or
complete MUGEN/IKEMEN parity.
