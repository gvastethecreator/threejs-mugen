# 04 - IKEMEN Scan And Reference

Status: ready-for-agent
Labels: ikemen-scan, docs, ready-for-agent

## Objective

Use Ikemen-GO as a reference source for compatibility planning while keeping near-term support to scanner/reporting unless a bounded runtime feature is explicitly gated.

## Next Useful Cuts

- Expand scanner signals for ZSS, Lua hooks, screenpacks, select/system files, model stages, and IKEMEN-only controllers/triggers.
- Link adopted behavior to source/documentation notes before implementing runtime semantics.
- Keep IKEMEN-only findings in compatibility reports as recognized/unsupported unless executed by a real gate.

## Acceptance

- Scanner tests prove each new signal.
- Docs distinguish MUGEN 1.0, MUGEN 1.1, IKEMEN scan-only, and future IKEMEN runtime work.
- `docs/IKEMEN_GO_REFERENCE.md`, `docs/COMPATIBILITY_PROFILES.md`, and `docs/SUPPORTED_FEATURES.md` stay aligned.

## Blocked Claims

- ZSS execution.
- Lua execution.
- Rollback/netplay.
- IKEMEN screenpack/lifebar parity.
- IKEMEN-specific runtime semantics without trace evidence.
