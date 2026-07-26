# Daily roadmap plan after DA27-09

Status: documented
Mode: research and planning only
Current HEAD observed: `aa85cb84553dfa854737ab955121e65f3bc0bea4`

## Goal

Reconstruct current roadmap truth after DA27-09, separate each evidence cursor, find unit-only or bridge-only closures, and propose the next 30 small cuts without changing code or scores.

## Steps

- [x] Read the required bootstrap and repository rules.
- [x] Compare current HEAD, latest ledger, formal/global, QA, focal, visual/product, and source cursors.
- [x] Cross-check Entry 601 and linked issue files.
- [x] Inspect likely live consumers of DA26/DA27 models and bridges.
- [x] Review primary Elecbyte, Ikemen, W3C, and Three.js sources where they change the plan.
- [x] Write the post-DA27-09 audit and DA28 proposal.
- [ ] Adopt DA28 through the generated selector in a future code-enabled run.
- [ ] Re-gate current HEAD before any product or score promotion.

## Guardrails

- Do not edit source, runtime, UI, tests, assets, or dependencies.
- Do not run code suites for a documentation-only audit.
- Do not move a score or cursor without its named evidence.
- Treat native fixtures and imported-package evidence as different classes.
- Keep DA28 proposed until the selector generator adopts it.
