# Issue Tracker: Local Markdown

Last audited: 2026-06-29

Issues, PRDs, audits, and implementation plans for this repo live as markdown files in `.scratch/`.

## Conventions

- One workstream per directory: `.scratch/<feature-slug>/`
- PRD path: `.scratch/<feature-slug>/PRD.md`
- Issue path: `.scratch/<feature-slug>/issues/<NN>-<slug>.md`
- Triage state: `Status:` line near the top of the issue file
- Comments/history: append under `## Comments`
- QA evidence: keep generated diagnostics/screenshots/traces under `.scratch/qa/` or the feature directory that produced them

## Publishing

When a skill says to publish to the issue tracker, create or update markdown under `.scratch/<feature-slug>/`.

This repo currently has a GitHub remote, but the active working tracker is local markdown. Do not open or sync GitHub issues unless the user explicitly asks.

## Fetching

When a skill says to fetch an issue, read the referenced markdown path. If the user gives only a slug or number, search `.scratch/` first.

## Repo-Specific Rule

Do not treat `.scratch/fixtures/` or `.scratch/external/` as redistributable source. Those are local/private evidence inputs.

Do not use the GitHub remote as the active issue tracker unless the user explicitly asks for GitHub Issues. Local markdown remains the working queue for autonomous agent passes.

## Roadmap Control Ledger

Use `.scratch/roadmap/issues/06-roadmap-control-and-qa-ledger.md` for setup-project, AGENTS, roadmap-routing, and QA-ledger refreshes. Append evidence there instead of creating duplicate setup issues unless the tracker layout, triage vocabulary, or domain-doc model changes.

Before choosing a new implementation issue, compare `docs/BUILD_EXECUTION_BACKLOG.md`, `docs/ROADMAP_PACKAGE_MILESTONES.md`, and the linked roadmap issue so an already-closed gate is not reselected as "next".

## Roadmap Issue Schema

Use this minimum shape for roadmap work:

```txt
# NN - Title

Status: ready-for-agent | in-progress | blocked | closed
Labels: docs, roadmap, runtime-trace, mugen-compat, studio, generated-assets, ikemen-scan, visual-qa

## Objective
## Next Useful Cuts
## Acceptance
## Blocked Claims
## Evidence
```

Runtime issues should name trace artifacts/checksums when available. UI/Studio issues should name screenshot or diagnostics paths. Docs-only issues should state "no score movement".
