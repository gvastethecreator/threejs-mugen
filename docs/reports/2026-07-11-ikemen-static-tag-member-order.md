# IKEMEN static Tag member-order checkpoint

## Outcome

Positive static TagIn/TagOut `memberno` now swaps mutable member order only in explicit Tag mode without changing stable root identity.

## Evidence

- Compiler tests cover positive integer lowering and zero/negative/dynamic/malformed rejection.
- Runtime fixture proves same-tick P1/P3 order swap while stable ids and leader remain unchanged.
- Invalid position and non-Tag mode preserve order, state, control, standby, and successful telemetry.
- `pnpm test`: 169 files / 1649 tests passed.
- `pnpm build`: TypeScript 7 and Vite build passed; known large-chunk warning remains.
- `pnpm qa:trace`: 538/538 artifacts passed (507 required, 31 optional).
- `pnpm check:boundaries` and `git diff --check`: passed; existing documentation line-ending warnings only.

## Blocked

TagIn leader, dynamic values, redirects, gameplay consumption, authored initial order, and full IKEMEN parity.
