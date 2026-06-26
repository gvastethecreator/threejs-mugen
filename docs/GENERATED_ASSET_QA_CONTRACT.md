# Generated Asset QA Contract

This document defines how image generation and `sprite-atlas-builder` outputs become trusted project assets.

Generated assets are native/authored assets. They do not count as imported MUGEN compatibility evidence.

## Pipeline

```txt
concept brief
  -> identity anchor
  -> imagegen prompt/source sheet
  -> source review
  -> sprite-atlas-builder extraction
  -> atlas manifest/checksums
  -> contact sheet/GIF review
  -> motion, scale, baseline QA
  -> collision/action authoring
  -> runtime playtest
  -> trace/screenshot evidence
  -> Studio asset record
```

## Required Provenance

Each generated character or stage should record:

- concept brief
- identity anchor
- prompt(s)
- source image paths
- generation date/tool
- extraction mode
- atlas manifest path
- output checksums
- QA report paths
- visual signoff notes
- collision/action authoring status
- runtime trace/screenshot evidence when playable

## Fighter QA

| Area | Required Check |
| --- | --- |
| Identity | Character remains recognizable across rows/actions. |
| Walk | Reads as walking, not running; legs alternate positions. |
| Crouch | Does not inflate relative to idle; baseline is stable. |
| Jump | Does not inflate relative to idle; silhouette remains coherent. |
| Attack | Contact pose is readable and maps to authored hitboxes. |
| Hitstun | Pose reads as reaction, not attack/idle duplicate. |
| Scale | Height/width stay within approved variance per action. |
| Baseline | Feet/floor contact remains stable for grounded actions. |
| Alpha/matte | No obvious background contamination. |
| Atlas manifest | Frame rects and action rows match runtime manifest. |
| Collision | Clsn1/Clsn2/action boxes are authored or flagged missing. |

## Regeneration Rule

If source art has bad locomotion, wrong scale, broken pose, or inconsistent identity, regenerate the source row/sheet.

Do not "fix" these by:

- cropping legs into new positions
- stretching jump/crouch frames
- hiding scale inflation with runtime scaling
- marking low-quality motion as OK because the atlas sliced cleanly

Atlas slicing can repair extraction and packing. It cannot repair bad source motion.

## QA Statuses

| Status | Meaning |
| --- | --- |
| `ok` | Required provenance and QA evidence exists; no blocking warnings. |
| `warn` | Playable but visual/motion/scale issue needs human review. |
| `blocked` | Missing source, failed extraction, broken manifest, or bad generated source art. |
| `partial` | Some actions are usable but required rows/actions are missing. |
| `stale` | Runtime asset no longer matches source/provenance/checksum. |
| `unknown` | Asset has not been inspected by the generated-asset pipeline. |

No green badge without evidence.

## Character Studio Hooks

Generated fighter records should appear in Character Studio with:

- action list
- atlas frames
- source prompt/provenance
- contact sheet/GIF
- motion/scale/baseline report
- hitbox/hurtbox authoring state
- playtest route
- related trace/smoke evidence
- next action for any warning

## Stage QA

Generated stages need:

- concept/provenance
- source image
- foreground/background layer notes
- floor line
- camera bounds
- player starts
- parallax/layer plan if any
- screenshot evidence in Runtime Mode
- fallback/unsupported notes if imported into stage pipeline

## Closeout

Generated-asset implementation or regeneration rounds should close with:

- atlas manifest validation
- contact sheet or GIF review
- motion/scale/baseline QA report
- browser visual QA
- trace when the asset is playable
- docs/status update if claims changed

