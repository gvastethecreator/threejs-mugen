# Research: Auxiliary Resource RedirectID v1

Date: 2026-07-15
Status: implementation-backed research
Scope: bounded IKEMEN root RedirectID execution for auxiliary resource controllers

## Primary sources

- [IKEMEN-GO State controllers (new), RedirectID](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid): RedirectID is optional on state controllers and redirects execution to the character selected by PlayerID.
- [Pinned IKEMEN-GO system source](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1492-L1510): source-pinned runtime/compiler reference for controller redirection behavior.
- [Elecbyte MUGEN 1.1b1 state controllers](https://www.elecbyte.com/mugendocs-11b1/sctrls.html): controller parameter and arithmetic-expression reference for Life, power, guard, dizzy, and red-life resources.

## Decision

The existing root RedirectID route now admits six auxiliary resource controllers in the explicit `ikemen-go` profile:

- `GuardPointsAdd` and `GuardPointsSet`
- `DizzyPointsAdd` and `DizzyPointsSet`
- `RedLifeAdd` and `RedLifeSet`

The destination is resolved through the live numeric PlayerID registry before the resource operation is evaluated. Dynamic values and `absolute` remain caller-owned; the selected target receives the mutation and telemetry mirrors back to the imported caller when the target is a non-imported demo actor.

The state-entry setup whitelist now admits the same six resource families. This keeps active CNS and state-entry setup behavior aligned without widening helper, projectile, team-bank, or presentation ownership.

## Failure policy

- Missing `RedirectID` means local execution on the caller.
- Empty, malformed, negative, missing, disabled, destroyed, and legacy-profile targets fail closed before resource mutation.
- Invalid destination resolution happens before later dynamic resource values are evaluated.
- `CtrlSet` is intentionally outside this slice because control ownership is a separate runtime boundary.

## Verification

- Focused batch: 3 files / 848 tests passed.
- `pnpm typecheck` passed.
- `node --check scripts/qa_traces.cjs` passed.
- `git diff --check` passed; only pre-existing CRLF normalization warnings remain in unrelated or touched legacy files.
- Full `pnpm qa:trace` passed: 607/607 artifacts, 573 required, 34 optional, 0 skipped.
- Active auxiliary checksum: `79f60677`.
- State-entry auxiliary checksum: `0e280069`.
- No browser smoke was needed because renderer and Studio surfaces did not change.
- Compatibility scores remain unchanged.

## Boundary

This evidence does not claim exact red-life scaling or recovery semantics, KO/persistence/rollback/netplay parity, team/shared resource banks, helper/projectile destinations, neutral identity, `CtrlSet`, or complete MUGEN/IKEMEN controller parity.

Next independent slice: decide whether `CtrlSet` RedirectID belongs in the resource route or in a control-ownership boundary, then audit target-family RedirectID mutation separately.
