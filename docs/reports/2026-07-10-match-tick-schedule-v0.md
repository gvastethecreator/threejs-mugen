# Port Status Report: Match Tick Schedule v0

Date: 2026-07-10

## Completed package

`MatchTickSchedule/v0` records the current active, pause, and hitpause routes without reordering behavior. Snapshot, runtime trace, trace artifact, trace QA diagnostics, and desktop/mobile bridge evidence carry the same owner-backed schedule vocabulary.

The sidecar inventories mutable stores and side effects for every marker. Fighter-level stamps retain actor identity. The current `kinematics < controllers` and `animation < combat` order is visible as a known roadmap divergence instead of being hidden inside broad phases.

## Area status

| Area | Current state | This package | Next risk |
| --- | --- | --- | --- |
| Playable sandbox | Playable local match and deterministic traces | Current tick branches and semantic order are inspectable | Schedule correction and accelerated-step history |
| Practical MUGEN | Partial compatibility with required traces | Elecbyte controller ordering is separated from unproven global order | Common1 source precedence and guard-phase order |
| Three.js renderer | Semantic presentation order and browser overlap proof | Snapshot tail identifies presentation projection after simulation | L4 baselines and broader effect ordering |
| Studio editor | Persistent project/scene plus evidence workbench | Stored trace artifacts retain schedule diagnostics | First source identity/write/reimport transaction |
| IKEMEN | Scanner/reporting only | IKEMEN compatibility is not inferred as a schedule claim | Package-level provenance and executable profile behavior |
| Modular engine | Shared contracts and boundary gates | Schedule vocabulary remains runtime-owned and renderer-independent | Neutral snapshot envelope versus MUGEN-specific schedule |

## Published scores

No score movement is claimed: private sandbox 65/100, practical MUGEN 35/100, MUGEN MVP 20/100, full MUGEN 10-12/100, IKEMEN 6-8/100, Studio/modular 25/100.

## Close audit

Independent review found eight risks across two passes: macro-only markers hid the critical order mismatch; phase entries lacked mutable-store and side-effect inventories; trace artifacts dropped the sidecar; checksum exclusion was declarative rather than proven; partial/empty schedules could pass; one store inventory was inaccurate; required artifact diagnostics broke v0 typing; and full metadata repeated in every artifact frame. The final cut adds five semantic stamps, exact marker metadata, negative validators, optional v0 diagnostics, compact per-frame stamps, a per-artifact catalog, artifact/QA propagation, and a differential checksum invariant.

The compact representation reduced schedule data from the first design's approximately 100.5 MB to 12.5 MB across 12,883 trace frames, about 4.1% of artifact bytes. `qa:smoke` navigation was also stabilized around active/out-of-viewport tabs and filters while retaining bridge-state, screenshot, relink, replacement, and evidence assertions.

## Verification

- Focused schedule/runtime/artifact coverage: 113 tests, including missing-frame and empty-phase negative cases.
- Differential trace test: schedule-only mutation preserves frame and aggregate behavior checksums.
- Full suite: 156 files, 1542 tests.
- Runtime trace: 526/526 artifacts, 495 required and 31 optional; schedule status passed across active, hitpause, and pause branches with a merged 17-phase catalog and no definition conflicts.
- Browser: desktop/mobile bridge diagnostics plus all runtime/Studio assertions passed in 147.3 s.
- TypeScript 7 production build, architecture boundaries, and `git diff --check` passed. The existing large-chunk build warning remains non-blocking.
