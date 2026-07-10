# Choose next gap after SprPriority draw order

Type: research
Status: resolved
Blocked by: None

## Question

Which package should follow player SprPriority L2 ordering while maximizing full visual/gameplay/editor progress?

## Candidate inputs

- HitDef `p1sprpriority`/`p2sprpriority` contact mutation and renderer handoff.
- Equal-priority/transparent-overlap and stage foreground ordering.
- AIR flip/rotation pivot or L4 deterministic visual baseline.
- First source-bound Studio collision/state editor.
- IKEMEN screenpack ingestion or post-KO runtime timeline.

## Answer

Select direct static `HitDef p1sprpriority` / `p2sprpriority` as a two-step R1 presentation-semantic package. First preserve authored-versus-omitted values and resolve them through a named MUGEN 1.1 policy with provenance; then mutate player/helper priorities only on accepted hit or guard and add required trace evidence. Keep collision priority, Projectile/dynamic values, IKEMEN normative defaults, Three.js adaptation, equal ties, stage/effect ordering, and score movement blocked.

Research: `docs/research/2026-07-10-hitdef-sprite-priority-policy.md`.

Implementation closed in two commits: typed policy seam first, then shared accepted-contact player/helper mutation plus required trace provenance. Final gate: 526/526 artifacts with player checksum `4dafe2f3` and helper checksum `53833d9e`; no score movement.
