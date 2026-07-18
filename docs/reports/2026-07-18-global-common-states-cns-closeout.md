# Global Common.States CNS closeout

## Result

The character loader now consumes CNS sources declared by game-config
`[Common] States`, including natural `States`, `States1`, and later numeric
suffix ordering. Root-style `data/...` references and config-relative simple
filenames resolve through the virtual filesystem. These sources are compiled
after character `st*` and DEF `stcommon`, so existing character/common
precedence remains visible.

Missing configured files produce loader warnings. `.zss` entries produce an
explicit unsupported `Common.States ZSS` finding and are excluded from CNS
parsing. No empty or misleading runtime state is created for an unsupported
source.

## Source basis

- [IKEMEN GO Common files and CommonStates](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info#common-files-air-cmd-const-fx-states)
  documents common states loaded independently of a character DEF.
- The local pinned IKEMEN source at
  `.scratch/external/Ikemen-GO` commit
  `044da72008b8ba13caf7b0f820526ce16e955fb3` compiles `stcommon` before
  sorted `sys.cfg.Common.States` sources.
- [Elecbyte CNS reference](https://elecbyte.com/mugendocs/cns.html) documents
  character state override over `stcommon`.

## Evidence

- Planning/research: `97f9f08e`.
- Implementation: `0878f15e`.
- Loader/config/compiler focus: `17/17` tests passed.
- Full post-implementation suite: `230/230` test files and `2372/2372` tests
  passed.
- `pnpm typecheck`: passed.
- `pnpm build`: passed; the existing large JavaScript chunk warning remains.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `git diff --check`: passed.

## Remaining debt

This closeout does not claim JSON `CommonStates` loading, ZSS compilation,
common commands/constants/AIR/FX, Lua insertion/deletion, complete global state
timing, helper-local input buffers, rollback/netplay, or full MUGEN/IKEMEN
parity.

## Next frontier

The next source-backed decision is ZSS/CNS common-state compilation or the
helper-specific command-buffer ownership contract. Both remain separate from
this CNS loader boundary.
