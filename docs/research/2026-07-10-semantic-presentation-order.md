# Semantic Presentation Order

Date: 2026-07-10

## Question

How should MUGEN stage, actor, effect, and overlay order reach Three.js without making renderer numbers the compatibility model?

## Primary sources

- Elecbyte stage documentation: `layerno = 0` draws behind characters, `layerno = 1` draws in front, and elements inside each layer draw back-to-front in DEF order: https://www.elecbyte.com/mugendocs/bgs.html
- Elecbyte controller documentation: higher player `SprPriority` draws on top; HitDef can replace P1/P2 priority after accepted hit or guard: https://www.elecbyte.com/mugendocs/sctrls.html
- Three.js `Object3D.renderOrder`: lower values render first, but opaque and transparent queues remain independent: https://threejs.org/docs/pages/Object3D.html
- Three.js `Material`: disabling depth writes is appropriate for ordered 2D overlays; disabling depth tests also disables effective depth writes: https://threejs.org/docs/pages/Material.html
- Installed Three.js r184 `WebGLRenderLists.js`: WebGL sorting compares group order, render order, then material/depth/id, with separate opaque and transparent lists.

## Decision

- Own `MugenPresentationOrder/v0` under runtime, independent of Three.js.
- Record profile, semantic phase, source kind, blend policy, priority, tie breaker, and tie policy.
- Use strict phases: stage background < actor underlay < actor < effect < stage foreground < debug < overlay.
- Preserve DEF order inside each stage layer and sprite priority inside the actor phase.
- Adapt all migrated 2D surfaces to one transparent queue with depth test/write disabled and explicit `renderOrder`.
- Preserve semantic priority/ties without a compatibility clamp; bound only the numeric Three.js encoding to keep strict phase bands.
- Keep nested hit-spark groups at group order zero; order their meshes, because Three.js group order precedes object render order.
- Propagate trustworthy player definition/contact profiles; use `unknown` for stage/effect surfaces that do not yet carry package-level provenance.

## Evidence

- Pure semantic/adapter tests cover strict phases, actor priority/ties, authored stage order, input normalization, and material application.
- Runtime snapshots own actor semantic order; CharacterRenderer reports semantic and effective values.
- Stage and hit-spark diagnostics expose semantic order, actual mesh orders, and group order.
- Browser smoke independently recomputes effective order and uses controlled WebGL pixel overlaps on desktop/mobile to prove stage background < actor shadow < actor < hit spark < stage foreground with neutral root-group order.
- Current desktop/mobile screenshots are nonblank, correctly framed, and show the hit spark with stage foreground composition intact.

## Blocked claims

Equal-priority reference behavior, exact profile propagation, Explod `ontop`, Projectile/Explod priority edge cases, all afterimage/shadow/debug ordering, screenpack composition, deterministic L4 image baselines, and L5 MUGEN/IKEMEN reference parity remain open.
