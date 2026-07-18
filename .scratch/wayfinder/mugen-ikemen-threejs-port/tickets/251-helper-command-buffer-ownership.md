# Ticket 251: helper command-buffer ownership

- Status: resolved bounded implementation
- Date: 2026-07-18
- Scope: runtime input history used by IKEMEN helpers with `keyctrl = 1`
- Depends on: Ticket 241 / ADR 0008, Ticket 250 / ADR 0017
- Implementation: `ba6a7e0b`
- Pause follow-up: `7968bc65`
- Closeout: [`docs/reports/2026-07-18-helper-command-buffer-ownership-closeout.md`](../../../docs/reports/2026-07-18-helper-command-buffer-ownership-closeout.md)

## Question

The sandbox already gives IKEMEN helpers access to State -1, -2, and -3 when
`keyctrl = 1`, but command checks currently read the owning root's
`CommandBuffer`. IKEMEN clones the command list and its input buffer for a
key-controlled helper, so a helper must be able to observe the current input
without inheriting the root's command edge history.

## Bounded contract

- Store a helper-local `CommandBuffer` only when the resolved helper has
  `keyctrl = 1`.
- Give that buffer the owner's parsed command definitions, preserving the
  existing command names and sequence semantics.
- Sample the owner's current input into the helper-local buffer once per
  helper advance, before helper negative states are evaluated.
- Route `command =` and `command()` checks for that helper through its local
  buffer; retain the owner callback as a compatibility fallback for fixtures
  and helpers without a local buffer.
- Keep `keyctrl = 0` command checks closed and preserve owner/root behavior for
  helpers that do not opt into key control.
- Preserve the existing pause gate. This ticket does not claim complete
  hitpause buffering, input remapping, AI command generation, or netplay
  rollback semantics.

## Out of scope

ZSS/Lua command compilation, CommonCmd loading, command remapping and SOCD
policy, helper-specific controller identities beyond command history, exact
upstream `InputBuffer` internals, rollback/netplay, and complete parity.

## Outcome

`keyctrl = 1` helpers in the `ikemen-go` profile now receive a local
`CommandBuffer` backed by the owning character's parsed commands. The owning
root's normalized current input is sampled once before helper controller
execution, including active, regular-pause, and hitpause helper advances.
Command predicates for `keyctrl = 0` remain closed. MUGEN 1.1 keeps the prior
owner-buffer compatibility route instead of silently switching to IKEMEN local
history.

## Acceptance evidence

- A focused helper test proves a `keyctrl = 1` helper can activate a command
  from sampled input even when the owner callback reports false.
- A focused negative case proves a `keyctrl = 0` helper does not gain command
  access from the same sampled input.
- Production spawn wiring passes the owner's parsed command definitions and
  current input into helper advancement.
- Pause and hitpause bridges forward the actor input to helper effect advances.
- Batched runtime tests, TypeScript 7 typecheck, build, repository boundary
  guards, and `git diff --check` pass before closeout.

## Verification

- Helper/effect/match focus after implementation: `297/297` tests.
- Pause/helper/match focus after pause forwarding: `323/323` tests.
- Final full suite: `230/230` files, `2373/2373` tests.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`,
  `pnpm check:redirect-boundary`, and `git diff --check` passed.

## Source basis

- [IKEMEN GO global states and keyctrl](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info#global-states)
  documents that helpers only access State -1 with `keyctrl`, and that IKEMEN
  enables helper access to additional negative states through the parameter.
- The pinned IKEMEN source at
  `.scratch/external/Ikemen-GO` commit
  `044da72008b8ba13caf7b0f820526ce16e955fb3` clones a helper command list and
  its `InputBuffer` when `keyctrl[0]` is enabled in `src/state_clone.go`, while
  `src/char.go` gates `command()` on helper key control.
- The local `CommandBuffer` already owns bounded input history and command
  sequence evaluation; this ticket reuses that API rather than creating a
  second parser.
