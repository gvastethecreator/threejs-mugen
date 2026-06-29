# Triage Labels

Last audited: 2026-06-29

The engineering skills use five canonical triage roles. This repo maps them directly to local markdown labels.

| Canonical role | Local label | Meaning |
| --- | --- | --- |
| `needs-triage` | `needs-triage` | Maintainer needs to evaluate the issue. |
| `needs-info` | `needs-info` | Waiting on reporter/user input. |
| `ready-for-agent` | `ready-for-agent` | Fully specified, ready for an autonomous agent pass. |
| `ready-for-human` | `ready-for-human` | Needs human implementation or product decision. |
| `wontfix` | `wontfix` | Will not be actioned. |

Use these labels in `Status:` or `Labels:` fields in local issue markdown.

For this repo, prefer adding explicit evidence tags too:

- `runtime-trace`
- `visual-qa`
- `docs`
- `mugen-compat`
- `ikemen-scan`
- `studio`
- `generated-assets`
- `stage`
- `audio`
- `project-control`
- `boundary`

## Lane Tags

Use these tags to route work to the right roadmap package:

| Tag | Package |
| --- | --- |
| `project-control` | G1 roadmap/setup control |
| `runtime-trace` | R1 runtime compatibility |
| `mugen-compat` | R1 runtime compatibility |
| `boundary` | R2 runtime ownership or M1 modular boundary |
| `studio` | S1 Studio trust chain |
| `generated-assets` | A1 generated asset provenance |
| `ikemen-scan` | I1 scanner-only IKEMEN reference work |
| `visual-qa` | Any renderer, Studio, sprite, stage, or frontend-visible work |

## Status Field Guidance

- `needs-triage`: idea exists, no owner/acceptance yet.
- `needs-info`: blocked on user-provided fixture, product choice, or external credential.
- `ready-for-agent`: enough context, acceptance, and blocked claims exist for autonomous work.
- `ready-for-human`: requires subjective product call, asset approval, or manual fixture/license decision.
- `wontfix`: intentionally rejected; keep reason in issue body.

Use evidence tags alongside status labels. Example: `Labels: runtime-trace, mugen-compat, ready-for-agent`.
