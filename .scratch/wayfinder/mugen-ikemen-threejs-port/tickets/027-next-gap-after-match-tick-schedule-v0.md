# Choose next gap after MatchTickSchedule v0

Type: research
Status: resolved
Blocked by: None

## Question

What is the smallest source-provenance package that can prove character state override versus `stcommon` fallback for Common1 state 120 without changing guard timing?

## Candidate Inputs

- Character DEF `stcommon` resolution and package-relative source identity.
- State 120 present in both character state data and Common1 data.
- State 120 absent from character data and resolved from Common1.
- Selected file path, fingerprint, state owner, and trace/artifact provenance.
- Explicit separation from automatic guard-phase ordering.

## Answer

Implement an explicit `StateSourceResolver` that selects character state data before `stcommon`, deduplicates the compiled state number, and retains selected/shadowed kind, path, and whole-file fingerprint. Attach the selected source to controllers so required guard-start artifacts can prove character override and Common1 fallback without changing the existing state 120 timing.

Primary-source basis and blocked scope are recorded in `docs/research/2026-07-10-common1-state-source-precedence.md`.
