# Entry 546 Closeout: Root Resource RedirectID v0

## Result

Closed the bounded IKEMEN root resource mutation slice. Imported
`LifeAdd`/`LifeSet`/`PowerAdd`/`PowerSet` controllers can now redirect through
the live PlayerID registry in active CNS and state-entry setup paths. Dynamic
resource values resolve against the caller before the target actor is mutated.

## Changes

- Compiled valid `RedirectID` expressions into the four supported resource
  operation types and rejected malformed redirect expressions at compile time.
- Routed active and state-entry resource dispatch through the existing root
  identity resolver, with legacy profiles and missing/negative destinations
  failing closed.
- Preserved caller-owned dynamic `value` and `kill` evaluation by attaching a
  resolved operation before dispatching to the target.
- Preserved imported compatibility evidence when the destination is a demo
  actor.
- Added required active and state-entry trace artifacts plus QA coverage.

## Verification

| Gate | Result |
| --- | --- |
| Focused compiler/runtime/trace batch | 3 files, 843 passed |
| `pnpm typecheck` | passed |
| `node --check scripts/qa_traces.cjs` | passed |
| `git diff --check` | passed; unrelated dirty roadmap docs report known CRLF warnings |
| `pnpm qa:trace` | 605/605, 571 required, 34 optional, 0 failed, 0 skipped |
| Active RedirectID trace | `a10bfbff` |
| State-entry RedirectID trace | `6adde9e8` |
| Browser smoke | not run; no frontend, renderer, or Studio surface changed |

## Claim boundary

The evidence supports root-only IKEMEN redirection for the four basic life and
power controllers, including caller-owned dynamic expressions and state-entry
setup. It does not claim Helper/projectile/neutral identity, team/shared bank
ownership, auxiliary resource families, exact `LifeAdd absolute` behavior,
KO/persistence/rollback/netplay parity, or complete MUGEN/IKEMEN compatibility.
No score movement.

## Commits

- `feat(runtime): route basic resources through RedirectID`
- `docs(runtime): close basic resource RedirectID v0`

## Next cut

Keep the identity registry and caller-bound evaluation context as the source of
truth. The next independent gate should audit invalid/missing resource
RedirectID behavior or another ownership boundary before expanding to Helpers,
projectiles, or shared team resources.
