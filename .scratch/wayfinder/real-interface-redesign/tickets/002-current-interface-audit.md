---
id: 002
title: Audit current interface causality
type: research
status: resolved
claimed_by: /root
depends_on: [001]
---

# Question

Why have prior interface improvements failed to produce a coherent product, and what must the new design stop doing?

# Answer

The current shell treats navigation, pipeline, stage, diagnostics, readiness, commands, and console as simultaneously primary. The same state is repeated as badges, counters, callouts, cards, and log text across permanent regions. The live scene remains valuable, but it is visually squeezed and frequently covered by the next-action layer. Runtime, Inspect, and Studio inherit the same cockpit grammar even when their jobs differ.

The implementation reflects this accumulation: `src/app/App.ts` is 15,736 lines; active style sources under `src/styles` total 12,087 lines and about 354 KB; `redesign.css` alone is 2,447 lines. The Ruthless detector found 168 UI-relevant leads (143 P2), dominated by nowrap risk, fixed-width mobile risk, tiny text, all-caps body text, nested cards, accent stripes, and generic glass/card treatments. These are audit leads, not automatically accepted defects.

# Evidence

- Desktop captures for Runtime, Inspect, and all eight Studio routes.
- Narrow captures for Runtime and Studio Workbench.
- `audit/static-findings.json`
- `audit/report.md`

# Resolution

Keep product truth and the live artifact. Remove the permanent dashboard topology, repeated hierarchy, terminal cosplay, and detached readiness summaries.

