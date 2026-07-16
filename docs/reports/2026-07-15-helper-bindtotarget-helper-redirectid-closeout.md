# Helper-to-helper BindToTarget RedirectID closeout

Date: 2026-07-15

## Task state

Completed for the bounded helper destination `BindToTarget` ownership slice.

## Artifact verdict

Win against the accepted target: a live helper can redirect `BindToTarget` to
another live helper `PlayerID`, select that helper's remembered target, and
persist the destination binding with its authored anchor and timing payload.

## Delivered

- Enabled helper destination resolution for `BindToTarget` `RedirectID`.
- Reused helper wrapper writeback for binding, runtime position, and target
  memory.
- Preserved root destination behavior and invalid redirect fail-closed paths.
- Added direct unit coverage for helper destination binding persistence.
- Added a required imported trace with helper lifecycle, target links, binding
  offsets, logical Z, duration, stores, and payload evidence.

## Verification state

Verified for the declared boundary.

Evidence:

- `pnpm exec vitest run src/tests/HelperSystem.test.ts src/tests/RuntimeTraceGatePresets.test.ts --testTimeout=10000`: `641/641`.
- `pnpm run typecheck`: passed.
- `pnpm run build`: passed; Vite reports the existing large-chunk warning.
- `pnpm run check:boundaries`: passed.
- `node --check scripts/qa_traces.cjs`: passed.
- `node --check scripts/check_boundaries.cjs`: passed.
- `pnpm run qa:trace`: `630/630`, `596` required, `34` optional, `0` skipped.
- Required artifact checksum: `6132bd42`.
- `git diff --check`: passed; existing CRLF normalization warnings remain
  outside runtime behavior.

## Audit

The required trace proves `p1-helper-0` resolves `RedirectID = 59` to
`p2-helper-0`, whose target memory contains `p1` target `77`. The redirected
controller stores the binding on `p2-helper-0` with offset `20,-8`, `Mid`
anchor semantics, logical `Z = 6`, and a four-tick lifetime. The caller's
binding remains independent. The evidence also proves that target memory
expiry after the live binding window does not erase the earlier successful
dispatch.

The direct unit test proves the temporary destination actor writes its binding
back to the live helper wrapper. The resolver continues to reject helper
`TargetState` destinations until custom-state ownership is modeled.

## Commits

- `f252a01c feat(runtime): route helper BindToTarget through helper owners`
- `f242c84a test(runtime): cover helper-to-helper BindToTarget RedirectID`

## Official basis

- [Elecbyte helper/player IDs](https://www.elecbyte.com/mugendocs/trigger.html)
- [Elecbyte BindToTarget](https://www.elecbyte.com/mugendocs/sctrls.html)
- [IKEMEN RedirectID](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)

## Scope ceiling

No claim is made for helper custom-state destinations, helper State -1,
projectile/team/neutral ownership, recursive redirects, exact multi-target
ordering, persistence, rollback/netplay, presentation score, or full
MUGEN/IKEMEN parity.

## Next frontier

Source-backed selection of one independent helper ownership boundary, with
custom-state entry and auxiliary target resources kept separate.
