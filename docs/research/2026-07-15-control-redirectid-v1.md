# Research: CtrlSet RedirectID v1

Date: 2026-07-15
Status: implementation-backed research
Scope: bounded IKEMEN root RedirectID execution for CtrlSet

## Primary sources

- [IKEMEN-GO State controllers (new), RedirectID](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid): RedirectID is optional on state controllers and redirects execution to the character selected by PlayerID.
- [Pinned IKEMEN-GO system source](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1492-L1510): source-pinned runtime/compiler reference for controller redirection behavior and caller-owned expression evaluation.
- [Elecbyte MUGEN 1.1b1 state controllers](https://www.elecbyte.com/mugendocs-11b1/sctrls.html): `CtrlSet` sets the player control flag; zero disables control and non-zero enables it.

## Decision

The explicit `ikemen-go` profile now admits root-only `CtrlSet` RedirectID in the typed resource route:

- active CNS setup resolves a live root PlayerID destination before applying the control flag;
- state-entry setup uses the same destination and fail-closed policy;
- `value` and the RedirectID expression remain owned by the original caller context;
- the selected live root receives the control mutation while the caller keeps its own control and resource state.

This keeps the implementation aligned with the existing ten-controller resource RedirectID route while preserving control as an ownership boundary. Helpers, projectiles, neutral actors, aggregate/team control, and generic target families stay outside the claim.

## Failure policy

- Missing `RedirectID` means local execution on the caller.
- Empty, malformed, negative, missing, disabled, destroyed, and legacy-profile targets fail closed before control mutation.
- Invalid destination resolution happens before later value evaluation and telemetry.
- `CtrlSet` is root-only in this slice; no helper ancestry or team/aggregate redirection is inferred.

## Verification

- Focused batch: 3 files / 852 tests passed.
- TypeScript 7: `pnpm typecheck` passed.
- QA script syntax: `node --check scripts/qa_traces.cjs` passed.
- Diff hygiene: `git diff --check` passed; only the existing CRLF normalization warning remains.
- Full `pnpm qa:trace` passed: 609/609 artifacts, 575 required, 34 optional, 0 skipped.
- Required active CtrlSet trace: `9c62ad5b` / final `1f1c3da3`.
- Required state-entry CtrlSet trace: `2f21266e` / final `5511046c`.
- No browser smoke was needed because renderer and Studio surfaces did not change.
- Compatibility scores remain unchanged.

## Boundary

This evidence does not claim exact persistent-controller timing, helper/projectile/neutral targets, shared/team control ownership, rollback/netplay behavior, renderer presentation, or complete MUGEN/IKEMEN controller parity.

Next independent slice: select a target-family RedirectID mutation boundary after the control-ownership audit.
