# IKEMEN Active-root Presentation Promotion Research

Date: 2026-07-11
Wayfinder: 098
Pinned upstream revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

What is the smallest source-backed browser-visible promotion for one already-live P3-P8 Tag root without granting effect, collision, combat, round, HUD, audio, or resource ownership implicitly?

## Answer

Publish presentation selection as a renderer-independent runtime contract. `RuntimeRootPresentation/v0` will carry separate ordered `drawRootIds` and `cameraRootIds`; it will not move roots between `MugenSnapshot.actors` and `reserveActors`. Three.js may resolve the draw ids across both arrays, while HUD, audio, collision debug, hit sparks, effects, combat, round flow, and resources keep consuming the existing P1/P2 pair.

For the first explicit IKEMEN Tag cut, a present player root is drawable when it is not disabled, not standby, and not under `AssertSpecial invisible`. Camera-X participation is decided independently: the root must not be disabled or standby and must not opt out through `ScreenBound moveCameraX = 0`; invisibility alone does not remove it from camera tracking. Shadows follow draw eligibility plus the existing local/global no-shadow policy. Legacy, unknown, and IKEMEN Single matches keep their exact P1/P2 presentation contract.

Using standby as an immediate outgoing-root draw filter is an intentional temporary divergence. Pinned IKEMEN keeps a tagged-out root drawable while its authored leaving state moves it offscreen, then its waiting state applies `invisible` and an offscreen position. The sandbox does not execute the shipped Tag ZSS choreography or permit leaving-state motion for bounded standby roots yet. Keeping the outgoing root visible would therefore strand a duplicate fighter on screen. The bounded cut swaps draw and camera ownership in the first post-transition snapshot, with no overlap or leaving animation, and records this limit explicitly.

## Upstream Presentation Order

1. `Char.cueDraw` rejects invalid/disabled characters, not standby characters. The character sprite is queued only when `ASF_invisible` is clear; shadow and reflection creation are nested under that same visibility check, then further gated by `ASF_noshadow`: [character draw and shadow](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12649-L12857).
2. Camera X/Y tracking requires the corresponding `movecamera` flag and independently rejects standby. Screen-bound clamping also rejects standby: [camera tracking](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12058-L12112), [screen bounds](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L9871-L9889).
3. The entering Tag state disables screen/stage bounds but enables camera movement, positions the incoming root offscreen, assigns velocity, and performs `TagIn`: [entering state](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/data/tag.zss#L72-L105).
4. The leaving state keeps a low-priority sprite, disables camera movement, runs offscreen, and only then enters the waiting state. The waiting state disables camera movement, asserts `invisible`, and forces an offscreen position: [leaving and waiting states](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/data/tag.zss#L107-L148).
5. The global Tag switch issues `TagOut`, removes control/input, and sends the partner through `TagIn` into the entering state. Non-leader partners can be sent through the leaving state independently: [Tag switch orchestration](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/data/tag.zss#L239-L327).

The source therefore has separate policies for actor-list membership, draw visibility, shadow creation, camera tracking, standby, and authored Tag state choreography. One generic local `active` flag would be wrong.

## Local Ownership Map

| Local owner | Current truth | Selected change |
| --- | --- | --- |
| `RuntimeSnapshotWorld.match` | Serializes P1/P2 into `actors` and P3-P8 into `reserveActors`. | Preserve both storage contracts; attach `RuntimeRootPresentation/v0`. |
| `RuntimeMatchPresentationSnapshotWorld` | Builds camera and EnvShake input from P1/P2 and snapshots only P1/P2 effect groups. | Accept explicit camera roots, but retain P1/P2 EnvShake and effect ownership. |
| `cameraCenterX` | Averages P1/P2 roots that do not set `moveCameraX = false`. | Consume runtime-selected camera roots; no renderer-owned camera policy. |
| `ThreeMugenRenderer` | Sends `snapshot.actors` to character, hit-spark, and collision renderers. | Send selected draw roots only to `CharacterRenderer`; keep hit sparks and collision debug pair-owned. |
| `CharacterRenderer` | Draws every supplied actor and creates shadows from `shadowVisible`; it does not consume `AssertSpecial invisible`. | Selection omits invisible roots and therefore removes their body, afterimages, and shadow together. |
| App HUD / Debug panels | Many reads depend on stable `actors[0]` / `actors[1]`. | Keep pair indexing and lifebar values unchanged. |
| `MugenAudioSystem` | Discovers sound events from `snapshot.actors` plus effects. | Keep reserve-root audio undiscoverable. |
| `MatchWorld` registry | Derives `presentedRootIds` from `snapshot.actors`, so P3-P8 presentation remains false. | Derive presented ids from the new runtime contract and reconcile `RuntimeRootPhaseCapabilities/v1`. |
| Reset | Restores P1/P2 active and all reserves standby. | Recompute presentation from restored live state; retain no cached ids or stale Three.js meshes. |

## Selected Policy

Wayfinder 099: **Execute active-root presentation handoff**.

`RuntimeRootPresentation/v0` must expose a stable row for every root plus ordered `drawRootIds` and `cameraRootIds`. The first policy is:

- non-Tag paths: P1/P2 draw and camera behavior remains byte-for-byte compatible;
- explicit IKEMEN Tag draw: present player roots with `disabled = false`, `standby = false`, and no live `AssertSpecial invisible`;
- explicit IKEMEN Tag camera X: present player roots with `disabled = false`, `standby = false`, and `screenBound.moveCameraX !== false`, independent from invisibility;
- shadow: only a drawn root can own a shadow, then existing `noshadow`, `globalnoshadow`, and `shadowVisible` rules apply;
- post-transition timing: the first snapshot after `p1 standby=true, p3 standby=false` draws P3/P2, tracks P3/P2, and removes P1 from character meshes without changing `actors[0..1]`;
- no fallback from an empty Tag-side selection to a standby root; absence remains explicit and diagnostic;
- no root is admitted to hit sparks, collision boxes, effect snapshots, audio, HUD slots, direct control/AI, combat, round, or resources by this policy.

The versioned diagnostic should include a reason per root so disabled, standby-proxy-hidden, invisible, screen-bound-excluded, drawn, and camera-tracked states can be asserted without reproducing policy in tests or smoke scripts.

## Evidence Plan

Unit and integration evidence:

- policy tests for Tag, Single, legacy, disabled, standby, invisible, no-shadow, `moveCameraX = 0`, over-KO, empty-side, duplicate-id, and detached snapshot behavior;
- snapshot/camera tests proving P1/P2 storage remains stable while P3 becomes drawn/tracked;
- renderer tests proving selected P3 replaces stale P1 meshes, invisible roots have no body/afterimage/shadow, and collision/hit-spark inputs remain pair-only;
- HUD/audio/registry tests proving P1/P2 indexing and event discovery remain unchanged while public presentation capability moves only for selected ids;
- reset tests proving draw/camera ids and renderer meshes return to P1/P2;
- one required imported Tag trace whose frames carry the same P1/P2/P3 standby and presentation ids used by browser evidence.

Browser evidence uses a dedicated local QA scenario, not production defaults:

- desktop `1440x960` and mobile `390x844` screenshots before and after one host/test `p1 -> p3` standby transaction;
- baseline draw/camera ids `[p1,p2]`, handoff ids `[p3,p2]`, and reset ids `[p1,p2]`;
- `snapshot.actors` remains `[p1,p2]`, `reserveActors` still contains P3, renderer diagnostics contain P3/P2 but not P1 after handoff, and HUD labels remain P1/P2;
- canvas pixel checks stay nonblank with stable framing, and mesh diagnostics prove no duplicate outgoing root or stale shadow;
- no P3 collision, hit-spark, effect, sound, resource, or round evidence appears.

## Adversarial Audit

- Appending P3 to `snapshot.actors` is rejected because it changes HUD, audio, collision, debug, and positional pair contracts together.
- Filtering in Three.js alone is rejected because renderer code would own compatibility policy and traces could not explain the result.
- Reusing `structurallyActive` is rejected because over-KO, draw, camera, and collision have different source policies.
- Treating invisible as no-camera is rejected; upstream camera participation is independently standby/ScreenBound-gated.
- Rendering all non-disabled roots is rejected until Tag leaving/waiting ZSS states can move and hide standby actors correctly.
- Promoting P3 effect snapshots or EnvShake along with its sprite is rejected because effect stores still alias non-P2 roots into P1 ownership.
- Reordering `actors` to place the current leader first is rejected because leader, HUD slot, resource owner, and stable root identity are separate axes.

## Deletion Criteria

Remove the standby draw proxy once the runtime executes the shipped Tag entering/leaving/waiting states, supports their `ScreenBound`, `AssertSpecial invisible`, position, velocity, and sprite-priority behavior, and has a browser oracle for the outgoing/incoming overlap. Replace the bounded camera average when full IKEMEN camera edge, Y, zoom, and stage-bound behavior lands. Retain the versioned draw/camera projection even after those upgrades; it remains the renderer-independent explanation of which roots each presentation consumer selected.

## Implementation Outcome

Wayfinder 099 implemented the selected boundary. `RuntimeRootPresentation/v0` now publishes stable draw/camera rows and exact ordered ids; Three.js resolves only selected character bodies/shadows across pair/reserve storage; camera consumes selected roots while EnvShake/effects remain pair-owned. Required trace checksum `97255586` and frame checksums `65b85d54`, `65b00e8f` pass inside 542/542 artifacts. Desktop/mobile smoke proves `[p1,p2] -> [p3,p2] -> [p1,p2]`, stable P1/P2 HUD/gameplay storage, matching phase capabilities, and stale-mesh cleanup.

## Claim Ceiling

Allowed now: bounded immediate P3-P8 body/shadow/camera presentation under explicit IKEMEN Tag, with pinned draw/shadow/camera/Tag choreography facts and the stable local owner boundary documented.

Blocked: exact outgoing/incoming overlap; Tag ZSS/Lua execution; P3 stage clamp/push/collision, effects, audio, HUD/lifebar, combat, round, resources, direct native input/AI, camera Y/zoom parity, score movement, or full IKEMEN presentation parity.
