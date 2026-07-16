# Research: Redirected Target Dispatch Characterization

Date: 2026-07-16
Lane: R1 compatibility and runtime ownership
Wayfinder ticket: 200

## Question

What evidence is required before accepting the proposed
`RuntimeRedirectedTargetDispatch` lease and widening the Target family?

## Answer

Characterize the four existing successful routes without changing controller
semantics:

1. root active CNS -> root destination;
2. root State -1 setup -> root destination;
3. helper caller -> root destination;
4. helper caller -> helper destination.

Each observation must preserve the original caller, exact destination, state
program owner, requested target id, selected target actors, and the
operation-specific mutation set. The target dispatcher owns selection and
mutation classification; the runtime adapters own route labels and caller
identity. Invalid or unavailable destinations remain fail-closed and are not
promoted into a successful route observation.

## Source-backed boundary

The official IKEMEN controller reference documents `RedirectID` as an
optional controller parameter on the bounded Target family, including
`TargetLifeAdd`, `TargetPowerAdd`, `TargetState`, and `TargetScoreAdd`:

- [IKEMEN state controllers](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)

The legacy baseline remains the Elecbyte controller reference:

- [Elecbyte state controllers](https://www.elecbyte.com/mugendocs/sctrls.html)

The local ADR is still Proposed and explicitly requires characterization
before a lease migration:

- `docs/adr/0006-runtime-redirected-target-dispatch.md`

## Decision boundary

- This slice records successful route observations; it does not centralize
  resolution or writeback yet.
- Helper-destination `TargetState` remains blocked and is not silently counted
  as a fourth success; the helper-to-helper route uses a non-state Target
  mutation.
- `TargetScoreAdd`, target Set variants, recursive redirects, projectile/team
  identity, and exact multi-target ordering remain separate work.

## Acceptance

1. The dispatcher exposes selected target ids and mutation actor ids without
   changing existing result shapes.
2. Compatibility sessions retain exact redirected caller/destination identity.
3. Focused tests cover all four route labels and prove unselected candidates
   are absent from the mutation set.
4. Existing target/helper semantics and invalid-route behavior remain green.
