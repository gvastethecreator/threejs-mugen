# Ticket 270: state 5900 provenance

- Status: resolved
- Date: 2026-07-18
- Scope: carry selected character/Common1 state-5900 source provenance into
  the bounded round-state snapshot
- Depends on: [T156](156-match-outcome-state-5900.md),
  [T027](027-next-gap-after-common1-state-source-precedence.md)
- Research: [`docs/research/2026-07-18-state-5900-provenance.md`](../../../../docs/research/2026-07-18-state-5900-provenance.md)

## Question

Can the existing state-5900 availability boundary expose the selected source
path, layer, precedence reason, and existing source fingerprint without
changing behavior for demo/synthetic actors or claiming full Common1 parity?

## Bounded contract

1. Preserve the existing `RuntimeRoundState5900/v0` outer snapshot contract.
2. Add optional nested `RuntimeRoundState5900Provenance/v1` data only when a
   definition supplies source selections.
3. Carry selected `character`/`common` source, path, FNV-1a source fingerprint,
   precedence reason, shadowed sources, and IKEMEN negative-state append data.
4. Mark missing or source-unresolved state 5900 explicitly; never invent a
   cryptographic digest from the existing FNV fingerprint.
5. Keep state entry, round timing, compatibility scores, and full parity claims
   unchanged.

## Acceptance evidence

- Focused runtime-system coverage proves character override, common fallback,
  shadowed source, appended negative-source metadata, missing source, and
  legacy actor behavior.
- Imported fighter projection carries `MugenCharacter.stateSources`.
- Runtime round and Turns callers pass source selections to the world.
- Implementation commit: `f2c4b2a0`.
- Focused verification passes `3` files / `279` tests and TypeScript 7.
- Browser smoke is N/A unless a visible consumer changes.

## Claim ceiling

Allowed: bounded source provenance for state-5900 availability snapshots.
Blocked: exact state-5900 controller execution, variable/palette persistence,
winpose/motif choreography, complete Common1/ZSS parity, semantic source
equivalence, rollback/netplay, and full MUGEN/IKEMEN parity.
