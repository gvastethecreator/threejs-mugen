# Progress Report: Turns match-wins runtime command

## Delivered

Entry 524 adds the typed runtime equivalent of IKEMEN's per-side
`setMatchWins(teamSide, wins)` mutation. The `ikemen-go`-profile command updates
one target, keeps the aggregate target coherent, and closes an already reached
positive score immediately.

The implementation shares the same outcome owner and profile gate as Entry 523
without claiming Lua/ZSS execution.

## Evidence

- Focal suite: 2 files / 24 tests passed.
- Full suite: 209 test files / 2122 tests passed with
  `pnpm test -- --maxWorkers=4`.
- TypeScript 7 typecheck: passed.
- Production build passed: 289 modules, 1,782.11 kB JavaScript output / 447.37
  kB gzip. The existing large-chunk advisory remains open.
- Boundaries and CSS budget passed with zero duplicate selector keys, zero
  exact duplicate rules, and zero fully shadowed cross-file rules.
- Aggregate trace passed 600/600 artifacts: 566 required and 34 optional.
- Focused browser command probe passed at
  `.scratch/qa/qa-smoke-turns-rules-command-browser/diagnostics.json`, with
  both live mutations visible in snapshots and zero console/page errors. The
  full Runtime/Tag/Studio visual smoke from Entry 522 remains the UI baseline;
  this entry changes no visible surface.
- `git diff --check`: passed.
- Code commit: `19220794 feat: expose IKEMEN match win target mutation`.

## Quality audit

- Side 1 and side 2 targets remain independent.
- A target lowered to an already reached positive score closes with the correct
  winner; later round scoring is blocked.
- Non-IKEMEN profiles reject the command.
- The local bounded target policy remains explicit and does not silently claim
  official zero-win training semantics.

## Claim ceiling

This closes a bounded typed match-win mutation seam. It does not claim Lua VM
execution, script registration, rollback/netplay, or full MUGEN/IKEMEN parity.

## Next

Entries 523-524 have passed the batched broad gates. Select the next
independent source-backed lifecycle or compatibility-corpus slice.
