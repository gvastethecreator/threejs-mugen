# Helper Width/Height RedirectID research

Date: 2026-07-21

## Question

What exact redirect and local-coordinate rule should current Helper
`Width`/`Height` use without extending the existing edge-width or Helper
scheduling claims?

## Sources

- MUGEN 1.1 local reference:
  `.scratch/external/mugen-1.1b1/docs/sctrls.html`, `Width` section.
- Ikemen-GO normative Git object
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, inspected with `git show` from
  `.scratch/external/Ikemen-GO-normative-audit`:
  `src/compiler_functions.go:2575-2611`, `:6296-6311`, and
  `src/bytecode.go:9484-9528`, `:14439-14467`.
- [MUGEN 1.1 Width reference](https://www.elecbyte.com/mugendocs/sctrls.html#width)
- [Ikemen-GO Width runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L9484-L9528)
- [Ikemen-GO Height runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L14439-L14467)

## Findings

- Both controllers compile `redirectid` before their value payloads.
- Both runtime paths resolve the destination before changing any state. An
  unavailable destination returns without mutation.
- Both calculate `redirscale` as
  `(320 / caller.localcoord) / (320 / destination.localcoord)`, equal to
  `destination.localcoord / caller.localcoord`.
- Width applies that scale to `player`; `value` applies it to both player and
  edge width. Height applies it to its value pair.
- MUGEN defines Width as a one-tick change. Its `value` syntax controls both
  player and edge width, so the existing T365 player-size-only `value` route
  cannot claim source edge behavior.

## Decision

T366 can add RedirectID for the current player-size Width path and Height
through the shared actor constraint boundary. Evaluation remains in the caller
context. The verified destination receives the scaled values, and Helper
routes use the existing resource redirect lease plus destination writeback.

## Deliberate limits

Do not add Width edge behavior, edge effects from Width value, depth, nested
Helper trees, size proxies, exact source actor order, renderer proof, upstream
differentials, score movement, or full MUGEN/IKEMEN parity.

## Result

Implemented in `52e2cfa8`. Root and current Helper Width/Height redirects
evaluate dynamic values in the caller, scale once for the destination local
coordinate system, and mutate only the verified destination. Helper routes use
the resource lease/writeback boundary. Root cross-root writes defer until the
target has reset its one-frame constraints.

The combined T365-T367 batch passes focused `6/6` files / `448/448` tests,
TypeScript 7, `qa:trace` `636/636` artifacts, build with `329` modules,
both boundary guards, and diff hygiene. Full Vitest and browser smoke remain
deferred.
