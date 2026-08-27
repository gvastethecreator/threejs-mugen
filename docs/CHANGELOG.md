# Changelog

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
