# Issue tracker: local markdown

Last audited: 2026-08-27

Issues, PRDs, audits, and implementation plans live as markdown in ignored `.scratch/`.

## Conventions

- One workstream per directory: `.scratch/<feature-slug>/`
- Reserved: `.scratch/planning/` is durable agent execution state.
- Reserved: `.scratch/wayfinder/` is for wayfinding maps, not ordinary implementation issues.
- Reserved: `.scratch/architecture/` is live operator architecture moved off the public tree.
- Reserved: `.scratch/archive/` is unique stale docs moved off the public tree.
- PRD path: `.scratch/<feature-slug>/PRD.md`
- Issue path: `.scratch/<feature-slug>/issues/<NN>-<slug>.md`
- Triage state: `Status:` line near the top of the issue file
- Comments: append under `## Comments`
- QA evidence: generated diagnostics, screenshots, and traces under `.scratch/qa/`

## Publishing

When a skill says to publish to the issue tracker, create or update markdown under `.scratch/<feature-slug>/`.

This repo has a GitHub remote. The working tracker is local markdown. Do not open or sync GitHub issues unless the user explicitly asks.

## Fetching

When a skill says to fetch an issue, read the referenced markdown path. If the user gives only a slug or number, search `.scratch/` first.

## Repo-specific rule

Do not treat `.scratch/fixtures/` or `.scratch/external/` as redistributable source. Those are local evidence inputs.

Do not create a second issue tracker under `docs/` or GitHub Issues for normal autonomous work. Parent workspace `AGENTS.md` is only a router.

## Roadmap issue schema

```txt
# NN - Title

Status: ready-for-agent | in-progress | blocked | closed
Labels: docs, runtime-trace, mugen-compat, studio, generated-assets, ikemen-scan, visual-qa

## Objective
## Next Useful Cuts
## Acceptance
## Blocked Claims
## Evidence
```

Runtime issues should name trace artifacts when available. UI/Studio issues should name screenshot paths. Docs-only issues should state "no score movement".
