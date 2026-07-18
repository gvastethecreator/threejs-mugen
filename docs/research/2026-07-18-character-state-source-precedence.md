# Character State Source Precedence Research

Date: 2026-07-18

## Question

Which DEF `[Files]` entries should contribute character state code, and how
should character `st*` files relate to `stcommon` when several files declare
the same state identity?

## Source authority

Elecbyte's [character tutorial](https://www.elecbyte.com/mugendocs/tutorial1.html)
separates `cns` (constants) from `st` (states) and `stcommon` (common states).
The [CNS reference](https://elecbyte.com/mugendocs/cns.html) explains that
common states are shared by every player and that a character state with the
same number overrides the common state.

The checked-in M.U.G.E.N 1.1 reference package at
`.scratch/external/mugen-1.1b1/docs/` contains the same CNS/common-state
wording and the official KFM DEF declares `cns = kfm.cns`, `st = kfm.cns`, and
`stcommon = common1.cns`. The package therefore confirms that sharing one path
between constants and states is valid, but only because the path is listed in
both roles.

## Repository finding

`MugenCharacterLoader` currently includes `files.cns` in the state-source list
even when the DEF does not declare it as `st*`. It also preserves the textual
order of `st*` entries. `parseDef` recognizes the numbered `st0` through `st9`
keys but does not normalize their order. This makes source ownership depend on
DEF line order and can accidentally turn a constants-only CNS file into a
character state source.

## Decision boundary

Implement one bounded loader contract:

1. Parse `cns` for constants and diagnostics, but add its state definitions to
   the state-source list only when the same path is explicitly listed by `st*`.
2. Normalize character state files to `st`, `st0`, `st1`, through `st9` order,
   retaining only entries actually present in the DEF.
3. Resolve all character state identities before `stcommon`; the first selected
   character identity wins, and `stcommon` fills only identities that are still
   missing.
4. Preserve the existing state identity model, including literal IKEMEN `+1`,
   and keep CMD State -1 in its separate command-state path.

This is source ownership and deterministic precedence, not controller merging.
Duplicate state definitions are shadowed rather than appended.

## Blocked assumptions

Exact duplicate-state diagnostics, Common1/multi-file controller append
semantics, CMD-vs-state-file duplicate handling, IKEMEN ZSS/Lua insertion,
runtime parity, rollback/netplay, and complete MUGEN/IKEMEN compatibility remain
outside this cut.

## Evidence target

The focal gate must prove constants-only `cns` does not load state code, an
explicit shared `cns`/`st` path does load it, `st*` ordering is deterministic,
character state overrides common state, common state fills a missing identity,
and current loader/compiler/runtime suites remain green.

## Outcome

The bounded loader contract landed in `e47d4f76`. `cns` is parsed once for
constants and diagnostics; only explicit `st*` entries become character state
sources, with the same path still valid in both roles. Character state files
are normalized to `st`, `st0`, ..., `st9`, and `stcommon` remains the fallback
source. The focal gate is green at `49/49`, with TypeScript 7/build, repository
boundaries, redirected-target guard, and diff hygiene also passing.
