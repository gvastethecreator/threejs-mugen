# Triage Labels

Last audited: 2026-06-28

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

## Status Field Guidance

- `needs-triage`: idea exists, no owner/acceptance yet.
- `needs-info`: blocked on user-provided fixture, product choice, or external credential.
- `ready-for-agent`: enough context, acceptance, and blocked claims exist for autonomous work.
- `ready-for-human`: requires subjective product call, asset approval, or manual fixture/license decision.
- `wontfix`: intentionally rejected; keep reason in issue body.

Use evidence tags alongside status labels. Example: `Labels: runtime-trace, mugen-compat, ready-for-agent`.
