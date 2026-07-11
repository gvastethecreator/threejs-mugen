# IKEMEN character identity model checkpoint

## Outcome

The runtime now has a standalone numeric PlayerID owner separate from stable string actor ids and one-based PlayerNo.

## Evidence

- Default allocation starts at official `HelperMax = 56`.
- Present roots assign in official odd-PlayerNo then even-PlayerNo order.
- Configurable baselines do not conflate PlayerID with PlayerNo.
- Later character allocation is monotonic; unregister removes lookup without reusing numeric or actor ids.
- Lookup rejects fractional, negative, missing, destroyed, and disabled entries while standby remains eligible.
- `RuntimeCharacterIdentity/v0` diagnostics are detached and deeply frozen while new reads project live eligibility.
- Focused proof: `RuntimeCharacterIdentitySystem.test.ts`, 6/6 tests.
- `pnpm test`: 170 files / 1687 tests passed.
- `pnpm typecheck` and `pnpm build`: TypeScript 7 and Vite passed; known large-chunk warning remains.
- `pnpm qa:trace`: 538/538 artifacts passed (507 required, 31 optional).
- `pnpm check:boundaries` and `git diff --check`: passed.
- Visual smoke: N/A; no renderer or Studio consumer changed.

## Audit

The strongest risks were assigning by input order, recycling IDs after removal, filtering standby, or exposing mutable registry internals. Tests cover each route. The model intentionally rejects duplicate actor registration and unknown Helper roots. Independent review was unavailable in this host; this is an internal adversarial audit.

## Blocked

P1-P8 integration, `ID`/`PlayerNo` expressions, snapshot consumption, Helper registration, RedirectID mutation, round-to-round identity refresh, and full IKEMEN parity.
