# Helper command-buffer ownership closeout

## Result

The sandbox now models the bounded IKEMEN ownership rule for helper command
input. Imported helpers with `keyctrl = 1` receive a local `CommandBuffer` and
the owning character's parsed command definitions. Their current command
predicates read local history after the owner's normalized input is sampled.

The input is forwarded through active helper advances and through regular-pause
and hitpause effect routes. Helpers with `keyctrl = 0` remain command-closed.
MUGEN 1.1 retains the owner-buffer compatibility route used by the existing
runtime contract.

## Source basis

- [IKEMEN GO global states and keyctrl](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info#global-states)
  documents helper access to negative states through `keyctrl`.
- The pinned IKEMEN source at
  `.scratch/external/Ikemen-GO` commit
  `044da72008b8ba13caf7b0f820526ce16e955fb3` clones command lists and their
  input buffer for key-controlled helpers in `src/state_clone.go`, and gates
  `command()` on helper key control in `src/char.go`.
- The repository `CommandBuffer` remains the single bounded command-sequence
  evaluator.

## Implementation

- Planning/research: `f6d1c640`.
- Main runtime implementation: `ba6a7e0b`.
- Pause/hitpause input forwarding: `7968bc65`.
- ADR: [`docs/adr/0018-helper-command-buffer-ownership.md`](../adr/0018-helper-command-buffer-ownership.md).

## Verification

- Main focused runtime route: `297/297` tests passed.
- Pause forwarding focus: `323/323` tests passed.
- Final full suite: `230/230` files and `2373/2373` tests passed.
- `pnpm typecheck`: passed.
- `pnpm build`: passed; the existing large JavaScript chunk warning remains.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `git diff --check`: passed.

## Audit and remaining debt

The closeout deliberately does not claim raw IKEMEN `InputBuffer` parity, AI
command generation, CommonCmd loading, ZSS/Lua compilation, SOCD policy,
rollback/netplay, helper command persistence, or full MUGEN/IKEMEN parity.
Those remain independent roadmap items.

## Next frontier

The next source-backed compatibility choice is CommonCmd/command-source
loading or the remaining ZSS/CNS common-state compilation boundary. Either
should keep helper command ownership explicit and should not reintroduce shared
root history for IKEMEN key-controlled helpers.
