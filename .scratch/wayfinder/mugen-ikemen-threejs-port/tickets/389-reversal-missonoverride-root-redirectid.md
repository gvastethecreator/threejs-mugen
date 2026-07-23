# T389 Reversal MissOnOverride Root RedirectID

Type: task

Status: field retention resolved in `188c4462`; topology corrected by T390
`20324cf`

## Question

Can static `missonoverride` on ReversalDef and root ModifyReversalDef
RedirectID arbitrate a direct counter against a matching active HitOverride
without changing unrelated HitDef paths?

## Source evidence

- Pinned [IKEMEN HitDef compiler route](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1864-L1905)
  accepts `missonoverride` as an inherited HitDef field.
- Pinned [IKEMEN ReversalDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7965-L8000)
  delegates inherited fields through HitDef behavior.
- Pinned [IKEMEN ModifyReversalDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8350-L8385)
  updates that payload on an active reversal.
- Pinned [IKEMEN HitOverride arbitration](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10765-L10770)
  returns no contact for `missonoverride = 1`, or for its default when a
  non-projectile HitDef-family payload carries `p1stateno` or `p2stateno`.

## Correction

T389 correctly retained the field and its default/forced direct miss policy.
Its original direct route queried HitOverride on the reverser and used the
incoming attack payload. IKEMEN instead queries the countered actor and uses
the ReversalDef inherited HitDef payload. T390 records and repairs that
topology.

## Contract

Under explicit `ikemen-go`, static ReversalDef and root
ModifyReversalDef RedirectID accept `missonoverride`. T390 applies the policy
only after matching a HitOverride owned by the countered actor against the
active reversal inherited `attr` and `guardflag`:

- absent field plus `p1stateno` or `p2stateno` skips the contact;
- `missonoverride = 0` applies that actor's HitOverride redirect;
- `missonoverride = 1` skips the contact even without custom-state fields.

The explicit-zero route does not run normal ReversalDef p1/p2 states.

## In scope

- Static field parsing on ReversalDef activation.
- Static root ModifyReversalDef RedirectID mutation on one active root
  reversal.
- Direct matching-HitOverride arbitration before accepted reversal contact.
- Compiler, dispatch, imported match, and required trace evidence.

## Out of scope

Dynamic expressions, Projectile or Helper contact, Helper receivers, broader
HitOverride guard/slot parity, source scheduler order, teams, renderer work,
rollback/netplay, and full MUGEN/IKEMEN parity.

## Result

`188c4462` keeps `missOnOverride` on the active move and runtime metadata.
T390 `20324cf` corrects the actor/payload topology and sends an explicit-zero
match through the existing HitOverride redirect path.

## Verification

- `RuntimeCompiler`, `ReversalSystem`, `RuntimeCombatResolutionSystem`,
  `PlayableMatchRuntime`, and `CombatResolver` pass 5 files / 452 tests.
- Required
  `synthetic-imported-ikemen-root-modifyreversaldef-missonoverride-redirect`
  passes with an attacker-owned HitOverride redirect after explicit zero.
- `node --check scripts/qa_traces.cjs` and diff hygiene pass.
- The full trace aggregate, typecheck, full Vitest, build, and boundaries stay
  queued for the grouped runtime checkpoint. Under external Node load, an
  unrelated team-handoff artifact exceeded the normal five-second test limit;
  it passed in 8.36 seconds with a diagnostic 20-second limit and does not
  exercise ReversalDef or HitOverride.
