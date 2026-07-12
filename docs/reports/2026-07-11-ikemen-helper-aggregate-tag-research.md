# IKEMEN Helper Aggregate Tag Research Report

Date: 2026-07-11  
Scope: Wayfinder 086 research only  
Pinned source: Ikemen-GO `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Result

- Partner ownership is clear: a redirected Helper selects a same-side root through inherited stable PlayerNo; partner standby/state/control mutate that root after Helper-local effects.
- Member and leader ownership is root-team state. Helper `memberno` exposes an upstream zero-initialized `memberNo` quirk; leader uses stable PlayerNo and does not share that ambiguity.
- Upstream failure is incremental. Local execution will preserve the established prevalidated atomic contract and document the divergence.
- Wayfinder 087 is implementation-ready for partner only. Member and leader remain separate cuts.

## Evidence Gates

- Source: passed against current official wiki plus pinned compiler/runtime source.
- Local ownership audit: passed across Helper identity, Tag partner selection, team order, redirect dispatch, state/control, and telemetry boundaries.
- Scope/diff: passed with `git diff --check`; only existing CRLF-to-LF warnings were emitted.
- Runtime regression, trace, build, and browser gates: N/A; this checkpoint changes no executable or visible behavior.

## Quality Record

Task state: completed  
Artifact verdict: better; aggregate fog became one bounded implementation ticket  
Verification state: verified for the research claim  
Deferred: exact incremental failure, Helper member-order execution, leader execution, gameplay ownership, and full parity
