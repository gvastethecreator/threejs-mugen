# Common1 NoFallHitFlag research

## Question

Which source-backed admission rule can be implemented now for `NoFallHitFlag`
without conflating it with the incomplete generic hitflag and Common1 models?

## Primary source evidence

- The pinned [IKEMEN GO character loop](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go#L10440-L10455)
  rejects a hit against a target whose fall-hit counter is already active when
  the attack does not carry the `F` hitflag, unless the attacker asserts
  `NoFallHitFlag`.
- The same source defines `NoFallHitFlag` as an IKEMEN assert-special flag in
  the pinned [flag declarations and assert-special mapping](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go#L1048-L1065).
- The [Elecbyte State Controller Reference](https://www.elecbyte.com/mugendocs/sctrls.html)
  documents the legacy state-controller surface but does not define the
  IKEMEN-specific `NoFallHitFlag` extension. The pinned IKEMEN source is the
  authority for this tranche.

## Repository boundary

The sandbox already carries authored `HitDef.hitflag` through compiler IR and
`DemoMove.hitFlag`, and it already normalizes `AssertSpecial` names into typed
booleans for `NoFallDefenceUp` and `NoFallCount`. The three direct admission
paths are separate: `RuntimeRootDirectHitAdmissionSystem` precomputes team-root
pairs, `RuntimeCombatResolutionSystem` resolves regular direct hits, and
`RuntimeHelperCombatSystem` resolves helper direct hits. Projectiles currently
use a separate `RuntimeProjectile` model and do not carry a direct HitDef
`hitFlag` field.

## Decision for T260

Use one pure predicate at the combat boundary:

1. If the authored hitflag is omitted, preserve the current runtime behavior.
2. If the defender is in move type `H` with `hitFall.falling = true`, require
   an explicit `F` token and reject when the attacker asserts
   `NoFallHitFlag`.
3. Call that predicate from root admission, regular direct resolution,
   equal-priority preparation, and helper direct resolution.

The `moveType H` plus `hitFall.falling` pair is a deliberate runtime proxy for
IKEMEN's `hittmp >= 2` boundary. It is sufficient for this bounded slice but is
not a claim that the sandbox has complete `hittmp` or `acttmp` parity.

## Uncertainty and non-claims

- The omitted-hitflag path remains unchanged because the current runtime and
  synthetic fixtures do not yet model the engine's default hitflag inference.
- Projectiles, reversals, custom-state ownership, ZSS/Lua, rollback/netplay,
  and browser presentation are outside this change.
- The direct predicate does not establish complete MUGEN/IKEMEN parity or
  exact Common1 state-loop ordering.

## Implementation outcome

The bounded predicate was implemented in `71f0d265` after the planning and
source audit commit `4637d4e9`. `NoFallHitFlag` is now typed, explicit direct
HitDef `F` admission is enforced for falling targets across root, regular, and
helper direct paths, and omitted hitflags remain unchanged. Focused, full-suite,
TypeScript 7, build, boundary, and trace gates remain green. The claim ceiling
above is unchanged.
