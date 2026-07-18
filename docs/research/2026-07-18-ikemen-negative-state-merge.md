# IKEMEN negative-state merge research

## Question

The loader now separates constants-only `cns` from explicit character state
files. The next compatibility boundary is the meaning of repeated negative
`StateDef` identities across ordered `st*` and `stcommon` sources.

## Primary source evidence

- The official [M.U.G.E.N CNS reference](https://elecbyte.com/mugendocs/cns.html)
  defines the special states and their per-tick ordering, and documents
  `stcommon` as the common-state fallback that can be overridden by character
  state data.
- The official [M.U.G.E.N tutorial](https://www.elecbyte.com/mugendocs/tutorial1.html)
  separates `cns` constants, `st` states, and `stcommon` common states.
- The repository's pinned IKEMEN GO source is available under
  `.scratch/external/Ikemen-GO` at commit `044da72008b8ba13caf7b0f820526ce16e955fb3`.
  Its `src/compiler.go` loads character `st`, then CMD state code, then
  `stcommon`, and then global common states. It keeps a map keyed by state
  identity: normal duplicate states are not replaced, while an explicit
  `ikemenversion` permits negative states to reuse the previous block and
  append later controllers. State files are ordered as `st`, `st0`, `st1`, ...
  by natural key order.

## Bounded interpretation

For this slice, `ikemenversion` is the loader's explicit signal to enable the
IKEMEN negative-state policy. The first matching negative state remains the
identity owner. Later matching sources contribute only fields they explicitly
set and their controllers, in source order. `+1` is included because the
IKEMEN compiler represents its literal identity in the same negative-state
merge path internally.

The current repository has no source role for CMD/global `Common.States` in
`MugenStateSourceResolver`; those routes remain explicitly out of scope rather
than being silently folded into the character/common contract.

## Risks and non-claims

- This does not prove MUGEN's undocumented same-file duplicate diagnostics or
  every ZSS/Lua insertion rule.
- It does not claim that a merged negative state is equivalent to complete
  IKEMEN bytecode compilation; controller support remains governed by the
  existing compiler report.
- It does not broaden normal-state duplicate behavior or common-state source
  discovery.

## Implementation target

Add an explicit resolver policy with default first-wins behavior and an
`ikemen-append` mode selected only for imported definitions with
`ikemenversion`. Preserve source refs for both the selected state and each
appended controller, then prove it with focused resolver/loader fixtures.
