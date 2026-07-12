# Map Active-root Constraint And Collision Promotion

Type: research
Status: ready
Blocked by: None

## Question

What is the smallest source-backed promotion that lets an already-live, presented P3-P8 Tag root obey stage constraints or participate in body/collision geometry without silently granting incoming hits, outgoing attacks, push, targets, or full combat?

## Acceptance

- Pin IKEMEN stage-bound, `ScreenBound`, width/player-push, standby, hit-detection, and Tag-state behavior at revision `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.
- Map local `RuntimeActorConstraintWorld`, frame boxes, collision debug, direct/projectile/helper combat, target memory, root phase capabilities, and post-fighter ordering.
- Separate stage clamp, body push, diagnostic collision rendering, outgoing attack eligibility, incoming hurt eligibility, and combat mutation into independently claimable consumers.
- Select one narrow implementation ticket with exact ordering, actor ids, failure paths, required trace/browser gates, reset behavior, and deletion criteria.
- Update research, roadmap, workplan, progress, backlog, scorecard, and issue 07 without changing runtime behavior or scores.

## Claim Ceiling

Allowed: one implementation-ready constraint/collision boundary grounded in pinned source and current runtime ownership.

Blocked: executable P3-P8 constraint/collision/combat widening until a later implementation ticket lands; exact Tag ZSS overlap, effects, HUD/audio, round/resources, direct native input/AI, rollback/netplay, scores, or full IKEMEN parity.
