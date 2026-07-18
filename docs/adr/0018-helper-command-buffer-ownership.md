# ADR 0018: IKEMEN Helper Command-Buffer Ownership

- Status: Accepted bounded runtime contract
- Date: 2026-07-18
- Last reviewed: 2026-07-18 at HEAD `7968bc65`
- Scope: helper command predicates and input history for `keyctrl = 1`
- Implementation: `ba6a7e0b`
- Pause follow-up: `7968bc65`
- Research: [`docs/research/2026-07-18-helper-command-buffer-ownership.md`](../research/2026-07-18-helper-command-buffer-ownership.md)
- Closeout: [`docs/reports/2026-07-18-helper-command-buffer-ownership-closeout.md`](../reports/2026-07-18-helper-command-buffer-ownership-closeout.md)

## Context

Ticket 241 enabled helper negative-state execution but routed helper command
predicates to the owning root's command history. IKEMEN's helper clone path
creates an independent command list/input buffer when `keyctrl` is enabled.
Without that distinction, a helper can observe a root command edge that was
not sampled by its own command state.

## Decision

1. Reuse the repository `CommandBuffer` implementation for helper-local input
   history.
2. Create the local buffer and carry the owning character's parsed commands
   when a helper resolves `keyctrl = 1`.
3. In the `ikemen-go` profile, sample the owning root's normalized current input
   once before each helper advance and evaluate command predicates against the
   local buffer.
4. Forward current input through active, regular-pause, and hitpause effect
   routes so pause-eligible helper advances retain the same input contract.
5. Keep command predicates closed for `keyctrl = 0`.
6. Preserve the existing owner-buffer callback for MUGEN 1.1 and for manually
   constructed helpers without local command definitions.

## Consequences

Positive:

- IKEMEN helpers no longer share root command edge history by accident.
- Existing command parsing, remapping, buffer timing, and hitpause sample
  behavior remain centralized in `CommandBuffer`.
- The MUGEN compatibility path remains stable and explicit.

Boundaries:

- This does not implement the upstream raw `InputBuffer` internals, AI command
  cheating, CommonCmd loading, ZSS/Lua command compilation, SOCD policy,
  rollback/netplay, or complete parity.

## Evidence

- `297/297` helper/effect/match focused tests after the main implementation.
- `323/323` pause/helper/match focused tests after pause forwarding.
- Final `230/230` test files and `2373/2373` tests passed.
- TypeScript 7 typecheck/build, repository boundaries, redirect boundary, and
  diff hygiene passed.
