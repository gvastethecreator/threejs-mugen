# Changelog

## 2026-09-15 — project tune-up

- Repaired the required `pnpm typecheck` gate: 29 type errors across 14 files, including Helper and effect option types, camera-bound snapshots, and test fixtures.
- Fixed the two failing tests in the default suite. Helper float and integer expression resolution now treats invalid or non-finite results as unresolved instead of `0`, so fresh Helper Projectile fall-impact components fail closed.
- Refreshed the legal journey package digest and checksum after the lite fixture palette-seed change.
- Removed a duplicated stage QA tree under `public/stages/rooftop-dojo/public/` and a stray failed `qa/background-pack-report.json`.
- Regenerated the code map for the current source revision.

## 2026-08-27 — public-tree maintenance

- Added MIT license, contributing guide, and security contact.
- Slimmed the README and public docs. Operator roadmaps, research dumps, and ticket ledgers now live in ignored `.scratch/`.
- Untracked `.scratch/` from git. Evidence artifacts used by tests remain in `docs/evidence/`.

## 2026-08-12 — project maintenance

- Updated direct dependencies and regenerated `pnpm-lock.yaml`.
- Confirmed pnpm as the canonical package manager. Bun was not adopted because this project does not use it.
- Added `check`, `deps:check`, `audit`, and `verify` scripts.
- Added `.vscode/tasks.json` for common tasks.
- Recorded upgrade impact in `docs/DEPENDENCY_UPDATES.md`.
- Recorded gate status in `docs/QUALITY_AUDIT.md`.

## Compatibility note

Runtime WIP stays intact. Known helper Projectile and helper BindToTarget RedirectID failures remain explicit blockers. They are not hidden by weaker expectations.
