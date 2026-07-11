# IKEMEN dynamic TagIn caller-control checkpoint

## Outcome

TagIn caller `ctrl` now resolves supported boolean expressions from live caller CNS context before atomic Tag mutation and applies after caller state entry.

## Evidence

- Compiler emits normalized deferred caller-control metadata only for TagIn and rejects malformed structure/TagOut use.
- Runtime proves a true expression overrides StateDef `ctrl = 0` after state entry.
- Runtime proves `var(0)` resolves false, then true after caller variable mutation on the next tick.
- Telemetry records concrete caller control, not deferred metadata.
- `pnpm test`: 169 files / 1655 tests passed.
- `pnpm build`: TypeScript 7 and Vite passed; known large-chunk warning remains.
- `pnpm qa:trace`: 538/538 artifacts passed (507 required, 31 optional).
- `pnpm check:boundaries` and `git diff --check`: passed.

## Blocked

Dynamic partner control/target/state/member/leader, redirects, exact partial-mutation parity, gameplay ownership, and full IKEMEN parity.
