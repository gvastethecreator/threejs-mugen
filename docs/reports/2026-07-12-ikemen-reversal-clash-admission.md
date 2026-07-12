# IKEMEN ReversalDef Clash Admission Report

Status: superseded by the directed mutation slice documented in `2026-07-12-ikemen-reversal-clash-runtime.md`; this report remains the read-only prerequisite record.

Date: 2026-07-12

## Delivered

- Separate directed clash decisions for dual active ReversalDefs.
- Getter-first and stable runtime-attacker ordering.
- Enemy-side, active-window, reversal-attr, and Clsn1 contact reasons.
- Versioned `RuntimeRootDirectHitAdmission/v1` snapshot/trace cloning.
- First-class trace-gate requirements/evidence for exact admitted direct and ReversalDef-clash pair arrays.
- Required explicit-Tag artifact with `p2->p1`, `p1->p2`, zero ordinary admissions, zero combat reasons, and zero targets.

## Boundary

This is read-only evidence. No runtime system consumes the candidates. Winner/tie/randomness, reversal mutation, state routing, hitpause, power, target/contact memory, attack depth/Z, AffectTeam, projectile/helper clashes, and full parity remain blocked.

## Verification

Focused unit, snapshot, trace, and TypeScript checks pass. An asymmetric attr test fixes the official directed ownership: attacker ReversalDef filter against getter attack attr. Full-suite, trace-catalog, build, boundary, checksum, and independent-review evidence are recorded at closure.

## Closure

- Tests: 179 files, 1846 tests passed.
- Trace QA: 552/552 artifacts passed, 521 required; new checksum `74e8e779`.
- TypeScript 7: `tsc --noEmit` passed.
- Production build: 261 modules, JS 1,626.13 kB / gzip 408.43 kB.
- Boundaries and `git diff --check`: passed.
- Independent review: three P2 findings audited; schema and gate findings fixed, attr orientation locked with asymmetric official-direction test.
