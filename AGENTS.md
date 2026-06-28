# AGENTS.md

## Project Rules

- Use `caveman` mode for implementation-only work that does not need user questions.
- Reconstruct current truth from repo state, docs, traces, screenshots, and tests before editing.
- Keep the active objective intact: progressive MUGEN/Ikemen-GO port foundation on Three.js, playable sandbox, real-content loading by compatibility layers, honest docs, and visual QA.
- Do not claim full MUGEN/Ikemen-GO parity from partial gates. Every compatibility claim needs evidence plus explicit blocked scope.
- Do not add commercial or third-party character assets to the repo. Use local fixtures under `.scratch/fixtures/` or generated/native assets under `public/`.
- Do not hardcode one character, one stage, or one fixture path into runtime behavior.
- Preserve user work. Never revert unrelated changes.

## Work Cadence

- Prefer small runtime/evidence cuts over broad rewrites.
- Runtime/CNS/CMD work must close with:
  - typed operation or named runtime-system boundary where possible
  - trace artifact or focused unit coverage
  - docs update with claim allowed / claim blocked language
- Frontend or visual changes require `pnpm qa:smoke` and visual inspection before closeout.
- Run tests/checks at the end of the round, not after every tiny edit.
- If docs, backlog, or trackers are part of the workflow, keep them honest against current code and gates.
- For architecture reviews, use subagents when available and reconcile their findings into one narrow plan.

## Verification Baseline

Default closeout for code/runtime/docs rounds:

```bash
pnpm test
pnpm typecheck
pnpm build
```

Runtime compatibility or trace changes also require:

```bash
pnpm qa:trace
```

Frontend, Studio, renderer, stage, sprite, or debug UI changes also require:

```bash
pnpm qa:smoke
```

## Agent skills

### Issue tracker

Issues and PRDs are tracked as local markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the canonical local labels `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo. Read root `CONTEXT.md` first, then relevant roadmap/architecture docs and ADRs under `docs/adr/` if present. See `docs/agents/domain.md`.
