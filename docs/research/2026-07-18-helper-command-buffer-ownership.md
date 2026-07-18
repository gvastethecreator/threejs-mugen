# Helper command-buffer ownership research

## Question

Ticket 241 closed helper State -1 execution by routing command predicates to
the owner root. That was a useful first runtime cut, but it does not model the
input-history ownership that IKEMEN gives a helper when `keyctrl = 1`.

## Primary source evidence

- The official [IKEMEN GO global states reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info#global-states)
  says a helper does not access State -1 unless `keyctrl` is enabled, and that
  IKEMEN extends helper access to States -2 and -3 through the same parameter.
- The pinned source `.scratch/external/Ikemen-GO` at commit
  `044da72008b8ba13caf7b0f820526ce16e955fb3` initializes helper key control in
  `src/char.go`, gates `command()` on `keyctrl[0]`, and clones command lists
  plus their input buffer in `src/state_clone.go` when key control is enabled.
- The same source's `commandUpdate` path updates a key-controlled helper's
  command input before evaluating its command list; helpers that share root
  command state do not receive a new independent history.

## Repository gap

`src/mugen/runtime/HelperSystem.ts` currently stores `keyCtrl` but has no
command buffer or command definition list. `PlayableMatchRuntime` passes an
owner-root `commandActive` callback to every helper. That callback is correct
for the existing compatibility fallback, but it lets a helper observe root
edge history instead of its own copied history.

## Bounded interpretation

Reuse `CommandBuffer` for helper-local history. At spawn, attach parsed owner
commands and create a buffer only for `keyctrl = 1`. At helper advance, push the
owner's already-normalized `currentInput` once before negative-state execution.
Use the local buffer for the helper's command predicates, then fall back to the
existing callback for manually constructed helpers and old fixtures.

The production route will pass command definitions through the existing effect
spawn actor definition and pass current input through the effect-helper context.
The implementation intentionally does not recreate IKEMEN's full raw
`InputBuffer`, AI controller, remap, SOCD, or rollback behavior.

## Risks and non-claims

- A local buffer must not be sampled more than once in one helper tick, or
  command timing will drift.
- Pause/hitpause filtering remains owned by the existing runtime pause gate and
  `CommandBuffer` sample options; this ticket only wires the current input.
- Helpers created directly in tests or by extensions without definitions keep
  the owner callback fallback and are not falsely reported as full parity.

## Implementation target

Add explicit helper command ownership, wire parsed commands at helper spawn,
forward root current input through the helper context, and cover both enabled
and disabled key-control paths with focused tests.
