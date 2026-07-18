# Character State Source Precedence Closeout

Date: 2026-07-18

Feature commit: `e47d4f76`

Decision: [`docs/adr/0015-character-state-source-precedence.md`](../adr/0015-character-state-source-precedence.md)

Research: [`docs/research/2026-07-18-character-state-source-precedence.md`](../research/2026-07-18-character-state-source-precedence.md)

## Result

The imported character loader now keeps the DEF file roles explicit. `cns` is
parsed for constants and diagnostics, while state code comes only from
explicit `st`, `st0` through `st9`, and `stcommon` entries. A path listed as
both `cns` and `st` is parsed once and serves both roles. Character state files
are normalized to deterministic `st`, `st0`, ..., `st9` order; character state
identities are selected before `stcommon`, which fills only missing identities.

Duplicate identities remain shadowed rather than controller-appended. This
preserves the existing source-selection model and avoids claiming a broader
merge VM.

## Evidence

- Focused parser/loader/compiler/package gate: `49/49` tests passed across
  eight files.
- Tests cover constants-only CNS, shared CNS/ST paths, canonical numbered ST
  ordering, character override, and Common1 fallback.
- TypeScript 7 and production build: passed. The existing Vite warning for a
  JavaScript chunk over 500 kB remains unchanged.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `git diff --check`: passed.
- Source basis: [Elecbyte character tutorial](https://www.elecbyte.com/mugendocs/tutorial1.html)
  and [Elecbyte CNS format](https://elecbyte.com/mugendocs/cns.html).

## Scope ceiling

This closeout does not claim duplicate controller append/merge behavior,
exact CMD-vs-state-file duplicate handling, complete Common1/multi-file
precedence, IKEMEN ZSS/Lua insertion, helper input buffers, rollback/netplay,
compatibility score movement, or full MUGEN/IKEMEN parity.

## Next frontier

The next source-backed gap is a separate decision for duplicate-state and
Common1/multi-file merge semantics, or a deeper helper input-buffer contract.
Neither should be inferred from this deterministic source-selection boundary.
