# Active-root Standing Low Guard Rejection Report

Date: 2026-07-12
Area: IKEMEN active-root direct combat

## Delivered

- Added one required IKEMEN Tag trace for a low-only direct active-root contact against a command-driven standing defender.
- The fixture routes held-back P3 into imported state `20` S. Its state-local `PosSet` exists only to separate P3 from P1 before P4's delayed overlap.
- Existing guard-distance, root admission, direct combat, target memory, and get-hit state ownership resolve the contact; no generic guard or movement path changed.

## Evidence

- Required trace: `synthetic-imported-ikemen-active-root-standing-low-guard-reject.json`.
- Trace checksum: `906e4751`; final checksum: `1eaa402b`.
- Tick 1: P3 executes `holdback -> state 20` S at x = `-220`; low-only P4 has no direct guard-distance latch.
- Tick 2: P3 state-`20` `PosSet` reaches x = `-100`; P4 remains absent from standing L guard-distance provenance.
- Tick 3: P3 remains S with no contact.
- Tick 4: delayed P4 overlap admits only `p4 -> p3`; existing direct combat records `hit`, target id `132`, P3 state `20` S, `moveType = H`, `guarding = false`, `ctrl = true`, and life `963`.
- Verification: `pnpm qa:trace` passed `574/574` artifacts (`543` required); `pnpm test` passed `183` files / `1949` tests; `pnpm typecheck`, `pnpm check:boundaries`, and `pnpm build` passed. Build retains the known `1,661.99 kB` JavaScript chunk advisory.

## Claim Allowed

One normal-tick direct low-only active-root contact can reject a defender in a command-driven imported S fixture state through existing command entry, guard-distance, root admission, direct combat, target/contact, and get-hit ownership.

## Claim Blocked

Generic active-root standing movement, H-versus-S positive contact, crouch or air behavior, a complete high/low matrix, automatic-guard breadth, projectiles/helpers, custom state, forceguard, target precedence, Pause/hitpause, guard presentation/audio, team replacement/KO, HUD/resources, rollback, score movement, and full MUGEN/IKEMEN parity.

## Closure Audit

- Strongest remaining objection: the fixture could be misread as generic active-root standing movement or broad guard policy.
- Source cause avoided: the only geometry change is fixture-local state-`20` `PosSet`; generic active-root capability, guard-distance, admission, and resolver ownership are unchanged.
- Closing proof: the focused test pins command/state/controller order, x = `-220` and x = `-100` S snapshots with no L latch, exact admission `["p4->p3"]`, hit classification, and final P3 state. Full trace QA proves no regression across the required artifact set.
- Independent review was not used for this narrow slice; the audit is a manual adversarial source-and-trace review, not independent certification.

## Quality Record

- Task state: completed.
- Artifact verdict: win against the S-plus-L negative-route acceptance target.
- Verification state: verified for the bounded trace claim.
- Gate manifest: scope, acceptance, provenance, regression, and runtime behavior passed; visual/browser gate is N/A because no UI, renderer, or presentation surface changed.

## Global Status

- Playable sandbox: unchanged.
- MUGEN compatibility: unchanged.
- IKEMEN runtime: active-root guard coverage now includes S-plus-L rejection in addition to MA standing/crouch contact, C-versus-H rejection, and C-plus-L contact.
- Studio/editor: unchanged.
- Modular boundary: generic root admission and combat remain intact; state-`20` geometry is fixture-only evidence.
