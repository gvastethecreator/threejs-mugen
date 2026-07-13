# Active-root Air Guard Contact Report

Date: 2026-07-12
Area: IKEMEN active-root direct combat

## Delivered

- Added one required IKEMEN Tag trace for an A-only direct active-root contact against a command-driven imported A defender.
- The fixture routes held-back P3 into imported state `40` A. Its local `PosSet` exists only to place the isolated A fixture in the direct-threat geometry; it is not a generic jump or movement path.
- Existing automatic guard chooses `132` because `120` is absent. Existing root admission, direct combat, target memory, and default air guard-hit selection then resolve the contact; no generic runtime guard or movement ownership changed.

## Evidence

- Required trace: `synthetic-imported-ikemen-active-root-air-guard.json`.
- Trace checksum: `e8856c68`; final checksum: `d4148a87`.
- Tick 1: P3 executes `holdback -> state 40` A at x = `-220`; distant A-only P4 has no direct latch.
- Tick 2: P3 state-`40` `PosSet` authors x = `-100`, y = `-24`; normal A physics leaves the observed trace at y = `-23.45`, where P4 becomes P3's sole direct A guard-distance source.
- Tick 3: P3 enters existing automatic A guard state `132` while P4 remains out of contact.
- Tick 4: delayed P4 overlap admits only `p4 -> p3`, records `guard`, target id `136`, P3 A guard state `154`, `guarding = true`, and life `1000`.
- Verification: `pnpm qa:trace` passed `576/576` artifacts (`545` required); `pnpm test` passed `183` files / `1951` tests; `pnpm typecheck`, `pnpm check:boundaries`, and `pnpm build` passed. Build retains the known `1,661.99 kB` JavaScript chunk advisory.

## Claim Allowed

One normal-tick direct A-only active-root contact can guard a defender in a command-driven imported A fixture state through existing command entry, guard-distance, automatic guard, root admission, direct combat, target/contact, and default air guard-state ownership.

## Claim Blocked

Generic jumping or air movement, exact Common1 air-guard start and landing timing, complete high/low/air behavior, automatic-guard breadth, projectiles/helpers, custom state, forceguard, target precedence, Pause/hitpause, guard presentation/audio, team replacement/KO, HUD/resources, rollback, score movement, and full MUGEN/IKEMEN parity.

## Closure Audit

- Strongest remaining objection: a positive A route could be misread as proof of generic aerial movement or Common1-compatible air guard timing.
- Source cause avoided: only the synthetic fixture gained an A start state and local x/y geometry. Generic active-root capability, guard-distance, automatic guard, admission, resolver, and renderer ownership are unchanged.
- Adversarial correction: the initial fixture tried to exit A guard based on local distance and could fall through to S state `130` before contact. The final fixture intentionally holds `132/A` to prove the contact slice only; exit and landing are now an explicit next research item.
- Closing proof: focused coverage pins `40/A` distant, `40/A` with direct A latch, `132/A`, exact admission `["p4->p3"]`, guard classification, and final `154/A`. Full trace QA proves no regression across all required artifacts.
- Independent review was not used for this narrow slice; the audit is a manual adversarial source-and-trace review, not independent certification.

## Quality Record

- Task state: completed.
- Artifact verdict: win against the A-plus-A direct-contact acceptance target.
- Verification state: verified for the bounded trace claim.
- Gate manifest: scope, acceptance, provenance, regression, and runtime behavior passed; visual/browser gate is N/A because no UI, renderer, or presentation surface changed.

## Global Status

- Playable sandbox: unchanged.
- MUGEN compatibility: unchanged.
- IKEMEN runtime: active-root guard evidence now includes S-plus-H guard, S-plus-L rejection, C-plus-H rejection, C-plus-L guard, and one A-plus-A guard route.
- Studio/editor: unchanged.
- Modular boundary: generic root admission and combat remain intact; state-`40` A geometry is fixture-only evidence.
