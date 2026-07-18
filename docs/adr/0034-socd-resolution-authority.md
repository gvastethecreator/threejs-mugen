# ADR 0034: SOCD resolution authority

- Status: accepted bounded
- Date: 2026-07-18
- Implementation: `b241cc65`
- Ticket: T268

## Context

The runtime can receive a valid explicit option, P1/P2 package metadata, or a
profile default. Returning only the chosen mode made package conflicts and
invalid explicit values invisible to diagnostics.

## Decision

Expose `RuntimeSocdResolutionAuthority/v0` from the match runtime. Select a
valid runtime option first. If package values conflict, keep the existing P1
fallback for compatibility but emit `package-socd-resolution-conflict`. Then
fall back through P1, P2, and profile default. Emit
`invalid-runtime-option` for an invalid explicit value while continuing
fallback. Return copied package values and diagnostics.

## Evidence

`RuntimeInput.test.ts` and `PlayableMatchRuntime.test.ts` pass `270` focused
tests. The grouped checkpoint passes `231/231` files / `2435/2435` tests,
TypeScript 7, build, repository boundaries, redirect boundary, and
`633/633` trace artifacts.

## Claim ceiling

This makes current precedence and conflicts observable. It does not establish
the final match/system configuration owner, replay/netplay serialization, or
complete package/input parity.
