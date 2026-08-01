---
id: 001
title: Reconstruct the product contract
type: research
status: resolved
claimed_by: /root
depends_on: []
---

# Question

What product behavior, information architecture, and trust boundary must survive a from-zero interface redesign?

# Answer

The product is a local-first MUGEN runtime and evidence workbench with three public modes. Runtime Match makes the sandbox playable. Inspect accepts a local ZIP/folder and exposes parsed character data and compatibility gaps. Studio operates on the same live project through eight addressable views, with Workbench → Assets → Evidence → Build as the primary production chain.

The new interface must preserve live scene state, project/runtime truth, local-only intake, URL-addressable mode/view state, visible blockers, trace/evidence provenance, compile/package gating, keyboard/gamepad/touch entry points, and recovery/data-loss protections. It may replace every aesthetic, layout, hierarchy, and component pattern used to present them.

# Evidence

- `AGENTS.md`
- `CONTEXT.md`
- `docs/INTERFACE_SYSTEM.md`
- `docs/ENGINE_STUDIO_ROADMAP.md`
- `.scratch/roadmap/issues/02-studio-evidence-workflow.md`
- `src/app/StudioTabs.ts`
- `src/app/App.ts`

# Resolution

The functional contract is stable enough to ideate without inventing a different product.

