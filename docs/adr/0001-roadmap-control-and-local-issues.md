# ADR-0001: Roadmap Control And Local Issues

Status: Accepted

Date: 2026-06-28

## Context

This repo has a large horizon: a Three.js fighting runtime, progressive MUGEN compatibility, IKEMEN scanner and future runtime work, Creator Studio, generated asset pipeline, and later modular-engine extraction. The project also has many docs. Without a stable source-of-truth stack, agents can overclaim progress, skip required gates, or choose work from stale backlog entries.

## Decision

Use local markdown as the working issue tracker and keep repo progress controlled by explicit evidence.

- `AGENTS.md` owns agent rules and setup-project profile.
- `.scratch/roadmap/` owns local PRD/issues for agent-sized slices.
- `.scratch/architecture/` owns live operator roadmaps and construction ledgers.
- `docs/QUALITY_AUDIT.md` owns the public engineering-gate snapshot.
- `docs/COMPATIBILITY_PROFILES.md` owns profile and claim-level language.
- Runtime/compatibility claims require tests, traces, visual QA, fixture evidence, or build/export proof.
- Docs-only work can improve project control, but cannot raise compatibility or port scores.

## Consequences

- Future agents can resume from repo files without depending on chat memory.
- GitHub remote can exist while `.scratch/` remains the working tracker until the user requests issue publication.
- Every compatibility improvement must keep claim allowed / claim blocked wording explicit.
- Durable source-of-truth changes should either update this ADR family or add a new ADR.
