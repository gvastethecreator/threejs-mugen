# Ticket 250: global Common.States CNS

- Status: resolved bounded implementation
- Date: 2026-07-18
- Scope: imported character loading from `[Common] States` config entries
- Depends on: Ticket 249 / ADR 0016
- Implementation: `0878f15e`
- Closeout: [`docs/reports/2026-07-18-global-common-states-cns-closeout.md`](../../../docs/reports/2026-07-18-global-common-states-cns-closeout.md)

## Question

IKEMEN can load common state files independently of a character DEF. How can
the sandbox expose that source without mixing it into character `st*`,
`stcommon`, CMD, or unsupported ZSS behavior?

## Bounded contract

- Read `[Common]` keys `States`, `States0`, `States1`, ... from the loaded game
  config in natural key order.
- Split comma-separated paths and resolve root-style `data/...` references,
  with config-relative fallback for simple filenames.
- Load CNS common-state sources after character `st*` and DEF `stcommon`.
- Preserve existing first-listed normal-state precedence and the explicit
  IKEMEN negative-state append policy from Ticket 249.
- Report missing global files as loader warnings and report `.zss` entries as
  unsupported instead of pretending they were compiled.
- Keep the source visible through existing common state provenance.

## Out of scope

JSON `CommonStates` save/config mutation, ZSS compilation, Lua insertion and
deletion, common commands/constants/air/fx, helper input buffers, and complete
IKEMEN parity.

## Outcome

The loader now reads natural `[Common] States*` config entries, resolves
root-style and config-relative CNS paths, appends them after DEF `stcommon`,
and reuses the existing source precedence/negative merge model. Missing files
become loader warnings; ZSS entries become explicit unsupported findings and
are not parsed as CNS.

## Evidence

- Loader/config/compiler focus: `17/17` tests.
- Full suite after implementation: `230/230` files, `2372/2372` tests.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`,
  `pnpm check:redirect-boundary`, and `git diff --check` passed.
