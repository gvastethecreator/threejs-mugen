# AGENTS.md

## Project rules

- Reconstruct current truth from repo state, docs, traces, screenshots, and tests before editing.
- Keep the active objective intact: progressive MUGEN/Ikemen-GO port foundation on Three.js, playable sandbox, real-content loading by compatibility layers, honest docs, and visual QA.
- Do not claim full MUGEN/Ikemen-GO parity from partial gates. Every compatibility claim needs evidence plus explicit blocked scope.
- Do not add commercial or third-party character assets to the repo. Use local fixtures under `.scratch/fixtures/` or generated/native assets under `public/`.
- Do not hardcode one character, one stage, or one fixture path into runtime behavior.
- Preserve user work. Never revert unrelated changes.

## Repo entry

- This git repo root is `mugen-web-sandbox`. If the shell starts in the parent workspace, enter `mugen-web-sandbox` before git, pnpm, or repo-wide searches.
- Parent workspace `AGENTS.md` is only a router. This file is the authoritative repo agent contract.
- Read `CONTEXT.md` first for domain vocabulary, then `docs/ARCHITECTURE.md`, then `docs/QUALITY_AUDIT.md`.
- Live operator queue: `.scratch/roadmap/issues/` and `.scratch/architecture/`. Those trees are ignored. They are not public docs.
- Public compatibility truth belongs in `docs/`. Tickets never go under `docs/`.

## Skill routing

- If the user names a skill or plugin, read its `SKILL.md` before acting and apply only the parts relevant to this repo task.
- Use `setup-project` when agent context, local issue tracking, triage labels, or domain-doc routing drift.
- Use product/interface skills for Studio or product-surface planning, but shipped UI must bind to real runtime/project/evidence data and pass visual QA.
- Use `imagegen` and sprite-atlas builders only with provenance and QA records. Bad walk, crouch, jump, or scale source art requires regenerated source sprites, not cosmetic atlas slicing.
- Use runtime/game/Three.js skills for visual runtime work, then close with `pnpm qa:smoke` plus screenshot inspection.
- Owned project skills: `.agents/skills/mugen-runtime-causality` and `.agents/skills/mugen-runtime-evidence`.

## Work cadence

- Prefer small runtime/evidence cuts over broad rewrites.
- Reuse existing systems, contracts, libraries, fixtures, and gates before creating new ones.
- Runtime/CNS/CMD work must close with a typed operation or named runtime-system boundary where possible, a trace artifact or focused unit coverage, and docs with claim allowed / claim blocked language.
- Frontend or visual changes require `pnpm qa:smoke` and visual inspection before closeout.
- Run tests and checks at the end of the round, not after every tiny edit.

## Verification

Default closeout for code, runtime, and docs rounds:

```bash
pnpm test
pnpm typecheck
pnpm build
```

Runtime compatibility or trace changes also require `pnpm qa:trace`. Frontend, Studio, renderer, stage, sprite, or debug UI changes also require `pnpm qa:smoke`.

## Setup project profile

- Last audited: 2026-08-27 during public-tree hygiene.
- Tracker: local markdown under `.scratch/<feature-slug>/`. GitHub remote exists, but local markdown remains the working tracker unless the user explicitly asks to publish GitHub issues.
- Triage vocabulary: `docs/agents/triage-labels.md`.
- Domain layout: single-context repo with root `CONTEXT.md`; published decisions under `docs/adr/`.
- Operator architecture: `.scratch/architecture/`. Tickets: `.scratch/roadmap/issues/`.

## Agent skills

### Issue tracker

Issues and PRDs are tracked as local markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the canonical local labels `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo. Read root `CONTEXT.md` first, then `docs/ARCHITECTURE.md`, relevant public docs, and ADRs under `docs/adr/`. Live operator notes are in `.scratch/architecture/`. See `docs/agents/domain.md`.
