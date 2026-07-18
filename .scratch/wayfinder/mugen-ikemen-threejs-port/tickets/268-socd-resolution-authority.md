# Ticket 268: SOCD resolution authority

- Status: resolved bounded
- Date: 2026-07-18
- Scope: expose which runtime/package/profile source selected `SOCDResolution`
  and make package conflicts observable
- Depends on: [T256](256-socd-resolution.md), [T267](267-stateful-socd-temporal-state.md)
- Implementation: `b241cc65`
- Research: [`docs/research/2026-07-18-socd-resolution-authority.md`](../../../../docs/research/2026-07-18-socd-resolution-authority.md)

## Question

How should one match select SOCD policy when explicit runtime configuration,
two imported packages, and the compatibility-profile default disagree?

## Answer

Runtime now exposes `RuntimeSocdResolutionAuthority/v0`. Valid explicit runtime
configuration wins; a package conflict remains compatibility-preserving P1
fallback but emits `package-socd-resolution-conflict`; otherwise P1, P2, then
profile default supply the value. Invalid explicit values emit
`invalid-runtime-option` and continue through package/default selection.

## Evidence

- Focused `RuntimeInput` and `PlayableMatchRuntime` tests pass `2` files /
  `270` tests.
- Authority getter returns defensive copies of package values and diagnostics.
- Grouped checkpoint passes `231/231` files / `2435/2435` tests, TypeScript 7,
  production build, repository boundaries, redirect boundary, and
  `633/633` trace artifacts.
- Browser smoke is N/A: no renderer, Studio, or visible surface changed.

## Claim ceiling

This makes precedence and conflict diagnostics explicit. It does not choose a
new match/system configuration owner, serialize the authority for replay or
netplay, or claim complete IKEMEN package/input parity.
