# Voice Channel Zero Hit Cancellation

Date: 2026-07-10
Status: implemented and focused-test verified

## Question

How should browser audio know when to stop a player's channel `0` voice without continuously inferring hits from hitstun?

## Answer

Shared combat should emit an explicit monotonic received-hit sequence. Browser audio consumes each new sequence once and stops only channel `0` for that runtime actor.

## Primary Source

- Elecbyte State Controller Reference: <https://www.elecbyte.com/mugendocs/sctrls.html>
  - `PlaySnd channel`: channel `0` is reserved for player voices.
  - Channel `0` voices are stopped when the player is hit.
  - Other numbered channels remain player-owned; `StopSnd -1` is the explicit global stop route.

## Baseline Risk

Actor-scoped channel ownership prevented cross-player interruption, but an actor's channel `0` source and pending decode survived accepted hits. Polling `hitStun > 0` would repeatedly cancel legitimate voices throughout the stun and would miss zero-stun edge cases.

## Implementation

- Added optional `receivedHitSequence` to `CharacterRuntimeState`.
- `RuntimeDirectCombatWorld` increments it only for accepted normal hit; helper attacks share that boundary. `RuntimeProjectileCombatWorld` applies the same rule for Projectile hit while preserving the sequence on guard.
- `MugenAudioSystem` remembers the last sequence per actor and stops actor-local channel `0` once after processing snapshot sound events.
- Actor-local stop also invalidates pending channel decode generations.

## Evidence

- Red: accepted hit preserved sequence `4`; channel `0` stayed active after sequence `0 -> 1`.
- Green: selected direct-combat hit/guard tests plus controlled active-source and deferred pending-decode cancellation tests pass.
- Focused Projectile hit/guard and helper-hit tests prove the signal across all currently playable attack paths.
- The integration test proves P2 voice survival and later P1 voice playback with unchanged sequence.
- TypeScript 7 passes; `pnpm qa:trace` remains 524/524 without checksum drift.
- Full regression, production build, architecture boundaries, and browser smoke pass.

## Claim Boundary

Allowed: bounded accepted direct, Projectile, and helper attack results signal a player hit once and browser audio cancels only that actor's active or pending channel `0` voice.

Blocked: HitOverride/reversal voice policy, helper-as-defender breadth, exact simultaneous/multi-hit ordering, common/system/BGM ownership, KO voice policy, perceptual/device parity, and full MUGEN/IKEMEN audio parity.
