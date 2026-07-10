# Choose next gap after IKEMEN deferred pause activation

Type: research
Status: resolved
Blocked by: None

## Question

What minimal helper execution context can route helper-created Pause/SuperPause through the helper's runtime identity, root/team ownership, local movement allowance, sounds, and target-defense scope without duplicating root controller behavior?

## Candidate Inputs

- Pinned IKEMEN GO helper character identity and Pause/SuperPause controller paths.
- Current helper controller context, owner-backed effects, and paused actor list.
- Root-only `applyMatchPauseController` and current-target `p2defmul` bridge.
- Existing helper pause/supermovetime traces and helper RunOrder evidence.

## Answer

Route helper Pause/SuperPause side effects through a typed helper callback carried by `RuntimeEffectHelperContextWorld`. The match adapter uses helper serial/state identity for global pause ownership and audio attribution, root fighter resources for `poweradd`, helper-local movement fields for `movetime`, and helper target memory for bounded positive `p2defmul`. Dynamic values resolve under helper Parent/Root/Enemy/Target context; `p2defmul` uses a float resolver rather than the integer controller path.

Required trace `synthetic-imported-ikemen-helper-superpause.json` proves same-tick appended helper ownership, root power `125`, helper sound `S9,4`, movetime `3`, current-target linkage, and final P2 life `959` after scaled target damage. Opposing-team breadth and zero-value semantics move to ticket 040.
