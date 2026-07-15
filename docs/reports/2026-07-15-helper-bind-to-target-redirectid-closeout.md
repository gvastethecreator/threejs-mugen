# Helper BindToTarget RedirectID closeout

Date: 2026-07-15

## Status

Implemented and verified as a bounded IKEMEN helper binding slice.

Feature evidence commit: `a13746bb`.
Invalid-route hardening commit: `3e14d378`.

## Delivered behavior

Helper `BindToTarget` now has a dedicated proof path for `RedirectID`. The
helper controller resolves PlayerID `57` to root `p2`, then applies authored
`ID = 77` against `p2`'s target memory (`p1`). The destination binding keeps
`pos = 20,-8,Mid`, `posz = 6`, and `time = 4`; the helper's own bind state
remains untouched. The generic target dispatcher needed no new runtime-core
branch because it already handled `bindtotarget` and the previous ownership
resolver now covers helper calls.

Invalid helper redirects fail closed before mutation in the focused unit
boundary.

## Evidence

- Focal RedirectID coverage: `6/6` tests passed across helper, playable
  runtime, and trace gate surfaces.
- Affected runtime suites: `871/871` passed across 3 files.
- Full trace QA: `pnpm run qa:trace` passed `627/627` artifacts.
- Required/optional split: `593` required, `34` optional, `0` skipped.
- Required artifact: `synthetic-imported-helper-bind-to-target-redirect`,
  checksum `f4c7b7f4`, final checksum `07898058`.
- TypeScript 7 check: `pnpm run typecheck` passed.
- Production build: `pnpm run build` passed.
- Boundary audit: `pnpm run check:boundaries` passed.
- Trace runner syntax: `node --check scripts/qa_traces.cjs` passed.
- Diff hygiene: `git diff --check` passed before commits.

The build emitted the repository's existing Vite chunk-size warning (`>500
kB`); build exit status remained successful and no new bundle split was part
of this runtime-only slice.

## Audit

The valid trace proves helper dispatch, root destination ownership, target
memory selection, typed binding operation telemetry, Mid anchor payload,
logical Z, duration, reciprocal target links, and helper-local state
separation. The invalid unit proves the redirect resolver can block an
unavailable PlayerID without creating a bind.

## Official basis

- [Elecbyte BindToTarget documentation](https://www.elecbyte.com/mugendocs/sctrls.html)
  defines target ID, position/postype, and duration semantics.
- [IKEMEN RedirectID documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  defines PlayerID execution redirection and its separation from custom-state
  transfer.

## Scope ceiling

No claim is made for helper destinations, helper State -1/global state,
helper TargetState/custom-state transfer, projectiles, teams, recursive
redirects, exact multi-target ordering, pause-order parity, persistence,
rollback/netplay, presentation score, or full MUGEN/IKEMEN parity.

## Next frontier

Source-backed selection for helper `TargetState`/custom-state ownership.
