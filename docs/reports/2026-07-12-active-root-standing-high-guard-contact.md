# Active-root Standing High Guard Contact Report

Date: 2026-07-12
Area: IKEMEN active-root direct combat

## Delivered

- Added one required IKEMEN Tag trace for a high-only direct active-root contact against a command-driven standing defender.
- The fixture routes held-back P3 into imported state `20` S. Its state-local `PosSet` exists only to separate P3 from P1 before high-only P4 becomes direct guard-distance provenance.
- Existing automatic guard `120 -> 130`, root admission, direct combat, target memory, and default guard-hit selection resolve the contact; no generic guard or movement path changed.

## Evidence

- Required trace: `synthetic-imported-ikemen-active-root-standing-high-guard.json`.
- Trace checksum: `bec58061`; final checksum: `3faaf48b`.
- Tick 1: P3 executes `holdback -> state 20` S at x = `-220`; distant high-only P4 has no direct latch.
- Tick 2: P3 state-`20` `PosSet` reaches x = `-100`; P4 becomes P3's sole direct H guard-distance source.
- Tick 3: P3 enters existing standing guard state `120` while P4 remains out of contact.
- Tick 4: P3 completes `120 -> 130`; delayed P4 overlap admits only `p4 -> p3`, records `guard`, target id `134`, P3 S guard state `150`, `guarding = true`, and life `1000`.
- Verification: `pnpm qa:trace` passed `575/575` artifacts (`544` required); `pnpm test` passed `183` files / `1950` tests; `pnpm typecheck`, `pnpm check:boundaries`, and `pnpm build` passed. Build retains the known `1,661.99 kB` JavaScript chunk advisory.

## Claim Allowed

One normal-tick direct high-only active-root contact can guard a defender in a command-driven imported S fixture state through existing command entry, guard-distance, automatic guard, root admission, direct combat, target/contact, and default guard-state ownership.

## Claim Blocked

Generic active-root standing movement, crouch or air behavior, a complete high/low matrix, automatic-guard breadth, projectiles/helpers, custom state, forceguard, target precedence, Pause/hitpause, guard presentation/audio, team replacement/KO, HUD/resources, rollback, score movement, and full MUGEN/IKEMEN parity.

## Closure Audit

- Strongest remaining objection: this positive fixture could be misread as proof of generic standing guard or a complete ground high/low policy.
- Source cause avoided: state-`20` positioning and authored H are fixture-only; generic active-root capability, guard-distance, automatic guard, admission, and resolver ownership are unchanged.
- Closing proof: the focused test pins S/no-latch at x = `-220`, S/H latch at x = `-100`, imported `120 -> 130`, exact admission `["p4->p3"]`, guard classification, and final state `150`. Full trace QA proves no regression across all required artifacts.
- Independent review was not used for this narrow slice; the audit is a manual adversarial source-and-trace review, not independent certification.

## Quality Record

- Task state: completed.
- Artifact verdict: win against the S-plus-H positive-route acceptance target.
- Verification state: verified for the bounded trace claim.
- Gate manifest: scope, acceptance, provenance, regression, and runtime behavior passed; visual/browser gate is N/A because no UI, renderer, or presentation surface changed.

## Global Status

- Playable sandbox: unchanged.
- MUGEN compatibility: unchanged.
- IKEMEN runtime: active-root ground guard coverage now includes S-plus-H guard, S-plus-L rejection, C-plus-H rejection, and C-plus-L guard.
- Studio/editor: unchanged.
- Modular boundary: generic root admission and combat remain intact; state-`20` geometry is fixture-only evidence.
