# Research: repository-authored stage journey

Date: 2026-07-16
Lane: R1 compatibility evidence
Wayfinder ticket: 218

## Question

What evidence can be added immediately after the repository-authored CC0 stage
fixture without overclaiming a complete playable or browser route?

## Decision

Add a typed journey around the existing production stage loader, report, and
playable runtime. The journey uses the fixture VFS directly, hashes sorted
paths plus bytes with Web Crypto, observes the initial stage snapshot, advances
one bounded frame, and applies the next round. It records only checks whose
owners are already present in the repository.

## Primary source findings

[Elecbyte's MUGEN 1.1b1 background/stage documentation](https://www.elecbyte.com/mugendocs-11b1/bgs.html)
defines the stage sections and the static, animated, tiled, and controller
background structures used by Skyline Relay.

[Elecbyte's coordinate-space documentation](https://www.elecbyte.com/mugendocs/coordspace.html)
supports keeping stage `localcoord` separate from configured game space; the
journey checks that distinction through the production stage snapshot.

## Evidence design

- Package identity is deterministic and uses a browser-compatible Web Crypto
  digest helper rather than a test-only Node hash.
- The runtime uses a one-frame timer so the next-round path is bounded and
  deterministic.
- The reset check compares the post-frame clock with the initial snapshot and
  then verifies that `resetBG = 0` preserves that absolute clock after the
  successful round transition.
- Browser and native fields remain explicit `not-run` values in the journey;
  they cannot silently become passing claims.

## Claim boundary

Allowed: repository-authored CC0 Skyline Relay loader/report evidence and a
bounded runtime route covering depth, animated BGCtrl, and round reset clock.

Blocked: folder/ZIP equivalence, visible application import, browser/native
proof, snapshot aggregation, score movement, arbitrary-package compatibility,
and complete MUGEN/IKEMEN stage parity.
