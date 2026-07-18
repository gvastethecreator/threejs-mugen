# State 5900 Provenance Closeout

Date: 2026-07-18
Ticket: Wayfinder 270
Commit: `f2c4b2a0`

## Result

Imported fighter definitions now preserve loader `stateSources`. The shared
state-5900 world projects selected source layer/path/FNV fingerprint,
precedence, shadowed refs, appended negative-state refs, and explicit unknown
or unavailable status through optional nested
`RuntimeRoundState5900Provenance/v1` data. Legacy demo/synthetic actors that
do not supply source metadata keep the existing snapshot shape.

## Evidence

- Focused runtime/import/round coverage: `3` files / `279` tests passed.
- `pnpm typecheck` passed with TypeScript 7.
- `git diff --check` passed for the implementation surface.
- Browser smoke: N/A, no visible consumer changed.

## Claim ceiling

Allowed: bounded source provenance for state-5900 availability in normal-round
and Turns planning. Blocked: exact state-5900 controller execution,
variable/palette persistence, winpose/motif choreography, Common1/ZSS semantic
parity, rollback/netplay, and full MUGEN/IKEMEN parity. No score movement.
