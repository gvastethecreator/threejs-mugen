# Implement Helper Resource Redirected Dispatch Lease/v1

Type: task
Status: resolved
Blocked by: None

## Question

Can helper-local resource controllers reuse the helper lease for
`RedirectID`, targeting a live root or helper while preserving caller-owned
dynamic values and helper wrapper synchronization?

## Scope

Migrate current helper CNS resource controllers through the shared
`RuntimeRedirectedTargetDispatchWorld` lease: `CtrlSet`, life, power,
guard-point, dizzy-point, and red-life resource families. Support
helper-to-root and helper-to-helper destinations already represented by the
character identity registry.

Use an empty candidate projection because resources mutate one destination and
do not select target memory. Keep the existing helper controller dispatcher as
the concrete executor and commit helper destination wrappers only inside the
lease operation.

Do not add helper State -1/global-state scheduling, helper custom-state
`TargetState`, projectile/team ownership, recursive redirects, `TargetScoreAdd`,
persistence, rollback/netplay, or full parity in this ticket.

## Evidence required

- helper resource lease unit/integration coverage for root and helper
  destinations;
- invalid RedirectID remains fail-closed and omitted RedirectID stays local;
- TypeScript 7 check, focused helper/runtime batch, and diff hygiene pass;
- closeout report records no score movement and the scheduling boundary.

## Research basis

- IKEMEN state-controller reference:
  <https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29>
- Elecbyte controller reference:
  <https://www.elecbyte.com/mugendocs/sctrls.html>
- ADR: `docs/adr/0006-runtime-redirected-target-dispatch.md`
- Existing helper target lease and root resource lease closeouts.

## Exit

Helper CNS resource RedirectID resolves and executes through one synchronous
lease for root/helper destinations, with local operation semantics,
fail-closed invalid identity, and wrapper commits preserved.

## Resolution

Implemented helper CNS resource RedirectID through the existing `helper`
lease phase. The helper resolver now reuses live root/helper identity and
creates an empty candidate projection for resource dispatch. The helper
dispatcher resolves dynamic resource values from the caller runtime/context,
executes against the lease destination, and commits helper wrappers only
inside successful lease execution.

The route is propagated through the active effect, post-fighter, and pause
helper-context plumbing. Omitted RedirectID remains local and invalid
destinations fail closed.

## Evidence

- Added PlayableMatchRuntime coverage for helper LifeAdd to a root with a
  caller-owned `Var(0)` value, helper-to-helper PowerSet, local PowerSet, and
  invalid LifeSet RedirectID.
- Focused batch: `23/23` selected tests passed across lease, helper,
  PlayableMatchRuntime, and resource dispatch suites.
- TypeScript 7 check: `pnpm exec tsc -p tsconfig.json --noEmit` passed.
- `git diff --check` passed for the feature changes.
- Browser/renderer smoke: N/A; no visible UI or Three.js surface changed.
- Full repository suite and full compatibility trace remain deferred to the
  next multi-slice checkpoint.

## Claim boundary

Allowed: current helper CNS resource RedirectID to live root/helper
destinations uses the synchronous helper lease while preserving caller-owned
dynamic values, local behavior, helper wrapper commits, and fail-closed
identity.

Still open: helper State -1/global-state, projectile/team destinations,
recursive redirects, exact multi-target ordering, `TargetScoreAdd`,
persistence, rollback/netplay, presentation, and full MUGEN/IKEMEN parity.

## Commits

- `43bb9a1f docs(wayfinder): select helper resource lease`
- `5e0d5744 feat(runtime): lease helper resource redirects`

## Next frontier

Characterize projectile/team `RedirectID` ownership as the next actor-family
boundary; keep helper scheduling and recursive redirects separate.
