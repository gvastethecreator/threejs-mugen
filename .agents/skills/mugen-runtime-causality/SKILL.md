---
name: mugen-runtime-causality
description: "MUGEN/Ikemen causality: live Helper ancestry, redirects, hit source, WinType. Not rootId alone."
---

# MUGEN Runtime Causality

Work in `X:\threejs-mugen\mugen-web-sandbox`. The parent `X:\threejs-mugen` is a router only; do not run git or pnpm there. Read `AGENTS.md`, then `CONTEXT.md`.

Use when damage, redirects, helpers, projectiles, or WinType cross actor boundaries.

## Process

1. Freeze one ownership question: source, carrier, receiver, later consumer.
2. Record actor id, PlayerID, parent, and root as separate fields. Do not let `attacker`/`defender` stand in for those roles.
3. Admit a Helper only through a live parent chain to the declared root. Missing, cyclic, cross-root, or stale parent PlayerID fails closed.
4. Store cause at contact. Later WinType reads those facts. Do not rebuild cause from the current winner.
5. Prove the claimed path and at least one rejected path with focused tests.

```text
pnpm test -- <focused-runtime-tests>
pnpm typecheck
```

## Done

One sentence names who owns the effect and which test proves it. Browser/screenpack parity stays blocked without runtime proof.
