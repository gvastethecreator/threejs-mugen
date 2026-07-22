# IKEMEN Reversal Sprite Priority Root Redirect Research

Date: 2026-07-22

## Question

Can the local ReversalDef path add source-backed static inherited HitDef sprite
priorities before entering the separate `missonoverride` work?

## Sources

- [IKEMEN ReversalDef compiler route](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1864-L1905)
- [IKEMEN ReversalDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7965-L8000)
- [IKEMEN ModifyReversalDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8350-L8385)
- [IKEMEN accepted-contact priorities](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10823-L10850)
- [IKEMEN HitOverride arbitration](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10765-L10770)

## Findings

- ReversalDef delegates its inherited parameters to the HitDef route, and
  ModifyReversalDef writes that payload into an already-active reversal.
- Accepted HitDef-family contact writes `p1sprpriority` to the source and
  `p2sprpriority` to the target when those fields are authored.
- The local direct combat system already applies authored values through a
  profile-aware policy and records telemetry that trace gates can inspect.
- Local reversal contact bypasses the generic HitOverride query. Source
  `missonoverride` tests an active matching override in that later path, so a
  field-only implementation here would overstate support.

## Decision

Implement static `p1sprpriority` and `p2sprpriority` on ReversalDef activation
and active root ModifyReversalDef RedirectID mutation. Extract the common
accepted-contact policy from direct combat, then invoke it after a reversal has
been accepted. Keep dynamic values and `missonoverride` blocked.

## Evidence plan

- Compiler accepts static values and rejects dynamic payloads.
- ReversalSystem proves active mutation keeps identity and applies the changed
  priority values with role/provenance telemetry.
- Imported match proves active root mutation keeps move/reversal identity.
- Required trace proves redirected values reach both actors after counter
  contact.

## Implementation result

`b245afb0` adds `HitDefSpritePrioritySystem`, makes direct contact use it, and
adds ReversalDef/ModifyReversalDef typed priority fields. The root RedirectID
trace starts with `4/-3`, applies `5/-4`, and confirms final `p2/p1` role
telemetry for the incoming attacker and reverser.

## Verification

Focused compiler, reversal, playable-match, trace, and DirectCombat coverage
passes 5 files / 1052 tests. `pnpm typecheck`, script syntax, and diff hygiene
pass. Full Vitest, trace aggregate, build, and boundary checks remain queued
for the next grouped runtime checkpoint.
