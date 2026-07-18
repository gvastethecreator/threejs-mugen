# IKEMEN negative-state merge closeout

## Result

The imported character loader now distinguishes MUGEN-style first-listed
duplicate handling from the bounded IKEMEN negative-state composition rule.
Definitions with an explicit `ikemenversion` merge repeated negative states
across ordered `st*` and `stcommon` sources. Literal `+1` follows the same
policy. Normal states remain first-listed.

The implementation keeps the initial state source as the selected identity,
records appended source refs on the selection, and assigns each appended
controller its actual source ref. Repeated `StateDef` identities within one
source file do not append, matching the pinned compiler's intra-file guard.

## Source basis

- [Elecbyte CNS reference](https://elecbyte.com/mugendocs/cns.html) for special
  state identities, execution ordering, and `stcommon` override/fallback.
- [Elecbyte character tutorial](https://www.elecbyte.com/mugendocs/tutorial1.html)
  for the separate `cns`, `st`, and `stcommon` file roles.
- Local pinned IKEMEN GO source at
  `.scratch/external/Ikemen-GO` commit
  `044da72008b8ba13caf7b0f820526ce16e955fb3`, specifically the character
  compiler's ordered source loading, per-file duplicate guard, and negative
  state append condition.

## Evidence

- Planning/research: `1e4faae7`.
- Implementation: `0c42c770`.
- Resolver/loader/compiler focus: `91/91` tests passed.
- Full post-implementation suite: `230/230` test files and `2371/2371` tests
  passed.
- `pnpm typecheck`: passed.
- `pnpm build`: passed; the existing large JavaScript chunk warning remains.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `git diff --check`: passed.

## Remaining debt

This closeout does not claim CMD state-source composition, global
`Common.States`, ZSS/Lua insertion, helper-local input buffers, exact
same-file diagnostic parity, rollback/netplay, or full MUGEN/IKEMEN parity.
Those require separate source-backed slices.

## Next frontier

The next high-value decision is either global Common state source discovery and
precedence or helper-specific input-buffer ownership. Both must be researched
separately before implementation.
