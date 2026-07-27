# ADR 0057 — TaskAcceptanceManifest/v1 (DA30-011)

- **Status:** Accepted
- **Date:** 2026-07-27

## Context

DA29 closeouts treated non-empty `functionResults` as acceptance. Clause-level
proof requires a versioned manifest per task.

## Alternatives

1. **Code-owned manifests** next to tests (chosen for validators + fixtures).
2. **Doc-owned manifests** only in markdown (hard to machine-check).
3. **Handwritten tests only** without schema (flexible, weak audit).

## Decision

Use `TaskAcceptanceManifest/v1` JSON (see `src/mugen/da30/TaskAcceptanceManifest.ts`).
Each clause has: id, evidenceKind, producer, assertion, expectedFailure,
revisionPolicy, environment, claim. Validators reject missing negatives,
duplicates, unknown kinds, empty assertions, and claim widening.
