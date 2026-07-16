# Research: repository stage snapshot promotion

Date: 2026-07-16
Lane: R1 compatibility evidence
Wayfinder ticket: 221

## Question

What evidence threshold allows a repository-authored stage to join the legal
compatibility denominator without confusing local regression with external
MUGEN/IKEMEN parity?

## Decision

Require one linked stage journey with passed loader/runtime/browser evidence,
one committed local regression report, and artifact paths that survive the
snapshot probe. Classify Skyline Relay as `required-legal` because its package
and stage assets are repository-authored under CC0-1.0. Keep the optional
private training-room entry unavailable.

## Source-backed scope

The stage fixture follows the MUGEN background sections and controller model
described by [Elecbyte's MUGEN 1.1b1 background documentation](https://www.elecbyte.com/mugendocs-11b1/bgs.html)
and keeps `localcoord` distinct from configured game space per [Elecbyte's
coordinate-space documentation](https://www.elecbyte.com/mugendocs/coordspace.html).
Those sources justify the fixture's loader/runtime checks; they do not grant
complete stage parity.

## Implementation findings

- Stage journeys can now receive explicit `CompatibilityJourneyRegressionEvidence`
  while retaining a default `not-run` state for pre-browser materialization.
- A committed `reportPath` makes native evidence inspectable and lets the
  snapshot freshness probe reject missing/tampered reports.
- Browser screenshot paths are rewritten from QA-local names to repository
  relative paths before snapshot materialization; the app identity contract
  remains the VFS fingerprint, not PNG bytes.
- Snapshot promotion is status-gated: a partial stage journey cannot become a
  passed required entry by being added to the corpus.

## Claim boundary

Allowed: two required-legal repository routes indexed by a passed v1.1
snapshot, with current artifact identity and freshness checks.

Blocked: external Ikemen-Go regression, arbitrary commercial or third-party
package compatibility, exact music/FightFX/stage timing parity, score
movement, and complete MUGEN/IKEMEN parity.
