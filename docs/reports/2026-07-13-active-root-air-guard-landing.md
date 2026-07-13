# Active-root Air Guard Landing Report

Date: 2026-07-13
Area: IKEMEN active-root runtime scheduling and guard-state execution

## Delivered

- Added one required IKEMEN Tag trace for the bounded post-contact A guard route.
- The fixture drives held-back P3 through `40/A`, automatic `132/A`, direct guard `154/A`, bounded exit `155/A`, explicit landing `52/S`, and controlled return `20/S`.
- Active roots now maintain guard stun before their existing state-clock, restricted CNS, kinematics, animation, and constraint phases. No generic aerial movement or physics-A landing owner was added.

## Evidence

- Required trace: `synthetic-imported-ikemen-active-root-air-guard-landing.json`.
- Trace checksum: `fe532005`; initial checksum: `912a2131`; final checksum: `8434e7f8`.
- Frame count: `44`.
- P3 sequence: `40/A -> 132/A -> 154/A -> 155/A -> 52/S -> 20/S`.
- Contact: exactly one `p4 -> p3` zero-chip `guard`; P4 target id `138`; P3 life remains `1000`.
- Final state: P3 `20/S/I`, `ctrl = true`; controller evidence covers `HitVelSet`, `VelAdd`, `CtrlSet`, `VelSet`, `PosSet`, and `ChangeState` before kinematics.
- Verification: `pnpm qa:trace` passes `577/577` artifacts (`546` required); `pnpm test` passes `183` files / `1953` tests; `pnpm typecheck`, `pnpm check:boundaries`, and `pnpm build` pass. Build output is `1,662.07 kB` JavaScript / `417.62 kB` gzip with the existing chunk advisory. Browser smoke is N/A because no visual surface changed.

## Claim Allowed

One fixture-owned authored active-root air-guard exit and landing route can execute under the current active-motion scheduler after a direct A-only guard contact.

## Claim Blocked

Generic `physics = A` landing, jumping or air movement, exact Common1/IKEMEN timing, complete guard policy, projectiles/helpers, target precedence, Pause/hitpause, guard presentation/audio, custom-state or forceguard variants, team lifecycle, HUD/resources, rollback, score movement, and full MUGEN/IKEMEN parity.

## Closure Audit

- Strongest remaining objection: the route could be read as proof of generic aerial physics or exact Common1 timing. The fixture uses authored `physics = N` controllers and explicit zero pause values; the claim remains fixture-owned.
- Adversarial correction: the first trace draft stalled at `154/A` because active roots did not maintain guard stun. The final runtime adds only the guard-stun tick at the front of the active-root motion phase and pins that order in focused tests.
- Regression proof: Feature 125 remains `e8856c68` / `d4148a87`; the aggregate trace corpus passes without failures.
- Independent review was not used for this narrow slice; the audit is a manual source, scheduler, fixture, and artifact review.

## Quality Record

- Task state: completed.
- Artifact verdict: win against the bounded active-root air-guard landing target.
- Verification state: verified for the bounded trace claim.
- Gate manifest: scope, acceptance, provenance, regression, runtime behavior, typecheck, boundaries, and build passed; visual/browser gate is N/A.

## Global Status

- Playable sandbox: unchanged.
- MUGEN compatibility: one additional fixture-owned active-root guard route; generic aerial parity remains blocked.
- IKEMEN runtime: active-root guard evidence now includes S-plus-H guard, S-plus-L rejection, C-plus-H rejection, C-plus-L guard, A-plus-A contact, and the authored A guard exit/landing route.
- Studio/editor: unchanged.
- Modular boundary: active-root guard-stun maintenance is isolated behind `RuntimeStunSystem`; generic admission, direct combat, and presentation ownership remain unchanged.
