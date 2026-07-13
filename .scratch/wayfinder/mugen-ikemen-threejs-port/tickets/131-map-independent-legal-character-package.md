# Map Independent Legal Character Package

Type: research
Status: resolved
Blocked by: None

## Question

Which second character package can extend the current legal MUGEN-lite evidence
without importing unverified third-party assets or conflating a palette route
with character breadth?

## Inputs

- `.scratch/fixtures/external-fixtures.json`
- `.scratch/external/CodeFuMan-master/`
- Existing package/license evidence and `CompatibilityJourney/v1`.
- `docs/reports/2026-07-13-legal-act-palette-route.md`

## Acceptance

- Identify a source and permission/license record that is inspectable locally.
- Define an exact file set and stable digest before implementation.
- Select one loader/runtime/browser gate that cannot pass by copying the current
  MUGEN-lite trace or ACT palette checksum.
- Keep asset provenance, unsupported findings, and claim ceiling visible in the
  report and compatibility aggregate.

## Claim Ceiling

Allowed: one independently sourced legal character package with bounded evidence.

Blocked: corpus compatibility, commercial assets, exact Common1 timing, broad
controller parity, and full MUGEN/IKEMEN parity.

## Resolution

Selected Code Fu Man from [Jesuszilla/CodeFuMan](https://github.com/Jesuszilla/CodeFuMan).
The local MIT license, exact 20-entry package inventory, archive size, and
SHA-256 are recorded in
`docs/reports/2026-07-13-codefuman-independent-package.md`. The production
loader test, deterministic runtime artifact `91e27e22`, and browser smoke
capture are independent of the repository-owned MUGEN-lite checksum. The
package remains optional and unbundled; no score movement is claimed.

Next: Wayfinder 132 maps one authored Code Fu Man special route before any
broader corpus or public-support claim.
