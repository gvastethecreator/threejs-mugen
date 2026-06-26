#!/usr/bin/env python3
"""Build a runtime/MUGEN-lite atlas from an imagegen fighting-game sprite sheet."""

from __future__ import annotations

import argparse
import json
import shutil
from collections import deque
from io import BytesIO
from statistics import median
from pathlib import Path

from PIL import Image, ImageDraw


STATES = [
    ("idle", 4, 8, True, 0, [7, 7, 7, 7]),
    ("walk-forward", 8, 6, True, 20, [10, 10, 10, 10, 10, 10, 10, 10]),
    ("crouch", 3, 8, True, 10, [5, 7, 7]),
    ("jump", 4, 8, False, 40, [6, 7, 8, 8]),
    ("punch", 4, 12, False, 200, [4, 4, 5, 7]),
    ("kick", 5, 12, False, 210, [5, 5, 5, 8, 8]),
    ("hitstun", 3, 8, False, 500, [6, 6, 6]),
]

CELL_W = 128
CELL_H = 128
SHEET_COLS = 8
TARGET_STANDING_HEIGHT = 104
TARGET_STANDING_WIDTH = 74
MAX_REFERENCE_UPSCALE = 1.18


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--character-id", default="rook-apprentice")
    parser.add_argument("--display-name", default="Rook Apprentice")
    parser.add_argument("--mugen-prefix")
    parser.add_argument("--prompt-summary")
    parser.add_argument("--out-dir", type=Path)
    args = parser.parse_args()

    character_id = args.character_id
    display_name = args.display_name
    mugen_prefix = args.mugen_prefix or character_id.replace("-", "_")
    source_filename = f"{character_id}-imagegen-sheet.png"
    prompt_summary = args.prompt_summary or (
        f"{display_name}: original side-view fighting game character. "
        "Generated with built-in imagegen as a private/local runtime sprite source."
    )
    out_dir = (args.out_dir or Path("public/characters") / character_id).resolve()
    source = args.source.resolve()
    if not source.exists():
        raise FileNotFoundError(source)
    source_bytes = source.read_bytes()
    image = Image.open(BytesIO(source_bytes)).convert("RGBA")

    reset_dirs(out_dir)
    source_dir = out_dir / "source"
    source_dir.mkdir(parents=True, exist_ok=True)
    (source_dir / source_filename).write_bytes(source_bytes)

    alpha_image = remove_green_background(image)
    components = extract_components(alpha_image)
    rows = cluster_rows(components, len(STATES))

    frames_root = out_dir / "frames"
    raw_root = out_dir / "raw"
    qa_root = out_dir / "qa"
    frames_root.mkdir(parents=True, exist_ok=True)
    raw_root.mkdir(parents=True, exist_ok=True)
    qa_root.mkdir(parents=True, exist_ok=True)

    sheet_rows = len(STATES)
    atlas = Image.new("RGBA", (SHEET_COLS * CELL_W, sheet_rows * CELL_H), (0, 0, 0, 0))
    frame_layout: dict[str, list[dict[str, int]]] = {}
    frame_manifest_rows = []
    report_rows = []

    reference_scale = compute_reference_scale(rows)

    for row_index, (state, expected, fps, loop, action_id, durations) in enumerate(STATES):
        row_components = rows[row_index] if row_index < len(rows) else []
        row_components = sorted(row_components, key=lambda comp: comp["bbox"][0])
        selected = fit_count(row_components, expected)
        state_dir = frames_root / state
        state_dir.mkdir(parents=True, exist_ok=True)
        frame_layout[state] = []
        raw_contact = Image.new("RGBA", (expected * CELL_W, CELL_H), (0, 0, 0, 0))
        files = []

        for frame_index, component in enumerate(selected):
            frame = normalize_component(alpha_image, component["bbox"], reference_scale)
            frame_path = state_dir / f"frame-{frame_index}.png"
            frame.save(frame_path)
            files.append(str(frame_path.relative_to(out_dir)).replace("\\", "/"))

            x = frame_index * CELL_W
            y = row_index * CELL_H
            atlas.alpha_composite(frame, (x, y))
            raw_contact.alpha_composite(frame, (x, 0))
            frame_layout[state].append({"x": x, "y": y, "w": CELL_W, "h": CELL_H})

        raw_contact.save(raw_root / f"{state}.png")
        create_contact_sheet(raw_contact, expected).save(qa_root / f"{state}-contact.png")
        frame_manifest_rows.append({"state": state, "ok": True, "frames": expected, "files": files})
        report_rows.append(
            {
                "state": state,
                "expected": expected,
                "detected": len(row_components),
                "used": len(selected),
                "action": action_id,
                "durations": durations,
            }
        )

    atlas.save(out_dir / "sprite-sheet-alpha.png")
    manifest = {
        "characterId": character_id,
        "engine": "imagegen-sheet-normalizer",
        "game_input": "sprite-sheet-alpha.png",
        "degraded_static_fallback": False,
        "curation_applied": False,
        "sprite_sheet_alpha": "sprite-sheet-alpha.png",
        "sprite_sheet_alpha_report": "sprite-sheet-alpha.report.json",
        "base_image": f"source/{source_filename}",
        "cell": {
            "shape": "square",
            "width": CELL_W,
            "height": CELL_H,
            "safe_margin_x": 16,
            "safe_margin_y": 16,
            "size": CELL_W,
            "safe_margin": 16,
        },
        "animation": {
            "cellWidth": CELL_W,
            "cellHeight": CELL_H,
            "columns": SHEET_COLS,
            "rows": {
                state: {"row": index, "frames": expected, "fps": fps, "loop": loop}
                for index, (state, expected, fps, loop, _, _) in enumerate(STATES)
            },
        },
        "frame_layout": {
            "sheetWidth": SHEET_COLS * CELL_W,
            "sheetHeight": sheet_rows * CELL_H,
            "cellWidth": CELL_W,
            "cellHeight": CELL_H,
            "rows": frame_layout,
        },
        "preset": {
            "id": "custom-atlas",
            "camera": "custom",
            "columns": SHEET_COLS,
            "formats": ["png"],
            "compatibility": [],
            "asset_kind": "sprite",
        },
        "asset_kind": "sprite",
        "extraction_mode": "imagegen-components",
    }
    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    (frames_root / "frames-manifest.json").write_text(
        json.dumps(
            {
                "ok": True,
                "engine": "imagegen-sheet-normalizer",
                "source": "built-in imagegen sheet with chroma cleanup and component extraction",
                "rows": frame_manifest_rows,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    (out_dir / "sprite-sheet-alpha.report.json").write_text(
        json.dumps(
            {
                "ok": True,
                "source": str(source),
                "manifest": "manifest.json",
                "detected_components": len(components),
                "scale_policy": {
                    "mode": "character-reference-scale",
                    "reference_scale": reference_scale,
                    "target_standing_height": TARGET_STANDING_HEIGHT,
                    "target_standing_width": TARGET_STANDING_WIDTH,
                    "notes": [
                        "Every state uses the same character-scale reference instead of fitting each pose independently.",
                        "Crouch and jump frames stay physically smaller/larger only if the generated source art actually changes scale.",
                    ],
                },
                "rows": report_rows,
                "frame_layout": manifest["frame_layout"],
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    write_prompts(out_dir, display_name, prompt_summary)
    write_runtime_states(out_dir, character_id, display_name)
    write_mugen_template(out_dir, display_name, mugen_prefix)
    write_readme(out_dir, display_name, source_filename)
    create_all_contact(atlas, frame_layout).save(qa_root / "all-contact.png")

    print(json.dumps({"ok": True, "out_dir": str(out_dir), "components": len(components)}, indent=2))
    return 0


def reset_dirs(out_dir: Path) -> None:
    for name in ["frames", "raw", "qa", "source", "prompts", "mugen"]:
        target = out_dir / name
        if target.exists():
            shutil.rmtree(target)
    out_dir.mkdir(parents=True, exist_ok=True)


def remove_green_background(image: Image.Image) -> Image.Image:
    pixels = image.load()
    out = Image.new("RGBA", image.size, (0, 0, 0, 0))
    out_pixels = out.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            greenish = g > 90 and g - max(r, b) > 34
            if greenish:
                continue
            if g > max(r, b) + 18:
                g = max(r, b)
            out_pixels[x, y] = (r, g, b, a)
    return out


def extract_components(image: Image.Image) -> list[dict[str, object]]:
    alpha = image.getchannel("A")
    width, height = image.size
    data = alpha.load()
    seen = bytearray(width * height)
    components: list[dict[str, object]] = []

    for y in range(height):
        for x in range(width):
            index = y * width + x
            if seen[index] or data[x, y] == 0:
                continue
            queue = deque([(x, y)])
            seen[index] = 1
            min_x = max_x = x
            min_y = max_y = y
            area = 0
            while queue:
                cx, cy = queue.popleft()
                area += 1
                min_x = min(min_x, cx)
                max_x = max(max_x, cx)
                min_y = min(min_y, cy)
                max_y = max(max_y, cy)
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if nx < 0 or ny < 0 or nx >= width or ny >= height:
                        continue
                    nindex = ny * width + nx
                    if seen[nindex] or data[nx, ny] == 0:
                        continue
                    seen[nindex] = 1
                    queue.append((nx, ny))
            box_w = max_x - min_x + 1
            box_h = max_y - min_y + 1
            if area < 700 or box_w < 24 or box_h < 40:
                continue
            components.append({"bbox": (min_x, min_y, max_x + 1, max_y + 1), "area": area})
    return components


def cluster_rows(components: list[dict[str, object]], row_count: int) -> list[list[dict[str, object]]]:
    sorted_components = sorted(components, key=lambda comp: center_y(comp["bbox"]))
    rows: list[list[dict[str, object]]] = []
    for component in sorted_components:
        cy = center_y(component["bbox"])
        if not rows:
            rows.append([component])
            continue
        current_mean = sum(center_y(comp["bbox"]) for comp in rows[-1]) / len(rows[-1])
        if abs(cy - current_mean) > 80 and len(rows) < row_count:
            rows.append([component])
        else:
            rows[-1].append(component)
    return rows


def fit_count(components: list[dict[str, object]], expected: int) -> list[dict[str, object]]:
    if len(components) >= expected:
        return components[:expected]
    if not components:
        raise ValueError("No components available for row")
    selected = list(components)
    while len(selected) < expected:
        duplicate_index = 1 if len(components) > 2 else len(components) - 1
        selected.append(components[duplicate_index])
    return selected


def compute_reference_scale(rows: list[list[dict[str, object]]]) -> float:
    reference_components: list[dict[str, object]] = []
    for row_index in (0, 1):
        if row_index < len(rows):
            reference_components.extend(rows[row_index])
    if not reference_components:
        reference_components = [component for row in rows for component in row]
    if not reference_components:
        return 1.0

    heights = sorted((box_height(component["bbox"]) for component in reference_components), reverse=True)
    widths = sorted((box_width(component["bbox"]) for component in reference_components), reverse=True)
    sample_count = min(6, len(heights))
    reference_height = median(heights[:sample_count])
    reference_width = median(widths[:sample_count])
    if reference_height <= 0 or reference_width <= 0:
        return 1.0
    return min(
        TARGET_STANDING_HEIGHT / reference_height,
        TARGET_STANDING_WIDTH / reference_width,
        MAX_REFERENCE_UPSCALE,
    )


def normalize_component(image: Image.Image, bbox: tuple[int, int, int, int], reference_scale: float) -> Image.Image:
    cropped = image.crop(expand_box(bbox, image.size, 8))
    cell = Image.new("RGBA", (CELL_W, CELL_H), (0, 0, 0, 0))
    fit_scale = min((CELL_W - 12) / cropped.width, (CELL_H - 8) / cropped.height)
    scale = min(reference_scale, fit_scale)
    resized = cropped.resize((max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale))), Image.Resampling.LANCZOS)
    x = (CELL_W - resized.width) // 2
    y = CELL_H - resized.height - 4
    cell.alpha_composite(resized, (x, y))
    remove_small_alpha_components(cell, min_area=280)
    return cell


def remove_small_alpha_components(image: Image.Image, min_area: int) -> None:
    alpha = image.getchannel("A")
    width, height = image.size
    data = alpha.load()
    seen = bytearray(width * height)
    clear_points: list[tuple[int, int]] = []
    for y in range(height):
        for x in range(width):
            index = y * width + x
            if seen[index] or data[x, y] == 0:
                continue
            queue = deque([(x, y)])
            points: list[tuple[int, int]] = []
            seen[index] = 1
            while queue:
                cx, cy = queue.popleft()
                points.append((cx, cy))
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if nx < 0 or ny < 0 or nx >= width or ny >= height:
                        continue
                    nindex = ny * width + nx
                    if seen[nindex] or data[nx, ny] == 0:
                        continue
                    seen[nindex] = 1
                    queue.append((nx, ny))
            if len(points) < min_area:
                clear_points.extend(points)

    pixels = image.load()
    for x, y in clear_points:
        pixels[x, y] = (0, 0, 0, 0)


def expand_box(bbox: tuple[int, int, int, int], size: tuple[int, int], pad: int) -> tuple[int, int, int, int]:
    return (max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(size[0], bbox[2] + pad), min(size[1], bbox[3] + pad))


def center_y(bbox: tuple[int, int, int, int]) -> float:
    return (bbox[1] + bbox[3]) / 2


def box_width(bbox: tuple[int, int, int, int]) -> int:
    return bbox[2] - bbox[0]


def box_height(bbox: tuple[int, int, int, int]) -> int:
    return bbox[3] - bbox[1]


def create_contact_sheet(row: Image.Image, frames: int) -> Image.Image:
    contact = Image.new("RGBA", row.size, (24, 28, 36, 255))
    draw = ImageDraw.Draw(contact)
    for index in range(frames):
        x = index * CELL_W
        draw.rectangle((x, 0, x + CELL_W - 1, CELL_H - 1), outline=(255, 255, 255, 55), width=1)
    contact.alpha_composite(row)
    return contact


def create_all_contact(atlas: Image.Image, frame_layout: dict[str, list[dict[str, int]]]) -> Image.Image:
    contact = Image.new("RGBA", atlas.size, (24, 28, 36, 255))
    draw = ImageDraw.Draw(contact)
    for rects in frame_layout.values():
        for rect in rects:
            draw.rectangle((rect["x"], rect["y"], rect["x"] + rect["w"] - 1, rect["y"] + rect["h"] - 1), outline=(255, 255, 255, 50), width=1)
    contact.alpha_composite(atlas)
    return contact


def write_prompts(out_dir: Path, display_name: str, prompt_summary: str) -> None:
    prompts = out_dir / "prompts"
    prompts.mkdir(parents=True, exist_ok=True)
    for state, expected, *_ in STATES:
        (prompts / f"{state}.txt").write_text(
            f"{prompt_summary}\nCharacter: {display_name}.\nState: {state}. Frames normalized: {expected}.\n",
            encoding="utf-8",
        )


def write_runtime_states(out_dir: Path, character_id: str, display_name: str) -> None:
    states = {
        "id": character_id,
        "displayName": display_name,
        "source": "imagegen + MUGEN 1.1 KFM structure reference",
        "states": [
            {"state": state, "frames": expected, "action": action_id, "durations": durations}
            for state, expected, _, _, action_id, durations in STATES
        ],
    }
    (out_dir / "runtime-states.json").write_text(json.dumps(states, indent=2) + "\n", encoding="utf-8")


def write_mugen_template(out_dir: Path, display_name: str, mugen_prefix: str) -> None:
    mugen = out_dir / "mugen"
    mugen.mkdir(parents=True, exist_ok=True)
    (mugen / f"{mugen_prefix}.def").write_text(
        f"""; Original local test character template for MUGEN Web Sandbox
[Info]
name = "{display_name}"
displayname = "{display_name}"
versiondate = 06,24,2026
mugenversion = 1.0
author = "Codex + imagegen"
localcoord = 320,240

[Files]
cmd = {mugen_prefix}.cmd
cns = {mugen_prefix}.cns
st = {mugen_prefix}.cns
sprite = {mugen_prefix}.sff ; not shipped yet; browser runtime uses ../sprite-sheet-alpha.png
anim = {mugen_prefix}.air
sound =
""",
        encoding="utf-8",
    )
    (mugen / f"{mugen_prefix}.air").write_text(make_air(), encoding="utf-8")
    (mugen / f"{mugen_prefix}.cmd").write_text(
        """[Defaults]
command.time = 15
command.buffer.time = 3

[Command]
name = "x"
command = x
time = 5

[Command]
name = "a"
command = a
time = 5

[Statedef -1]
[State -1, Stand Punch]
type = ChangeState
value = 200
triggerall = command = "x"
trigger1 = statetype = S
trigger1 = ctrl

[State -1, Stand Kick]
type = ChangeState
value = 210
triggerall = command = "a"
trigger1 = statetype = S
trigger1 = ctrl
""",
        encoding="utf-8",
    )
    (mugen / f"{mugen_prefix}.cns").write_text(
        """[Statedef 0]
type = S
movetype = I
physics = S
anim = 0
ctrl = 1

[Statedef 200]
type = S
movetype = A
physics = S
anim = 200
ctrl = 0
velset = 0,0

[State 200, HitDef]
type = HitDef
trigger1 = Time = 1
damage = 42,4
guardflag = MA
pausetime = 7,7
guard.pausetime = 4,4
ground.hittime = 14
guard.hittime = 9
ground.velocity = -4
guard.velocity = -2

[State 200, End]
type = ChangeState
trigger1 = AnimTime = 0
value = 0
ctrl = 1

[Statedef 210]
type = S
movetype = A
physics = S
anim = 210
ctrl = 0
velset = 0,0

[State 210, HitDef]
type = HitDef
trigger1 = Time = 1
damage = 58,6
guardflag = MA
pausetime = 9,9
guard.pausetime = 5,5
ground.hittime = 18
guard.hittime = 11
ground.velocity = -6
guard.velocity = -3

[State 210, End]
type = ChangeState
trigger1 = AnimTime = 0
value = 0
ctrl = 1
""",
        encoding="utf-8",
    )


def make_air() -> str:
    parts = []
    for state, _, _, loop, action_id, durations in STATES:
        parts.append(f"; {state}\n[Begin Action {action_id}]")
        if loop:
            parts.append("Loopstart")
        for index, duration in enumerate(durations):
            parts.append("Clsn2Default: 1")
            parts.append(" Clsn2[0] = -24,-96,24,0")
            if action_id == 200 and index == 2:
                parts.append("Clsn1: 1")
                parts.append(" Clsn1[0] = 18,-72,86,-42")
            if action_id == 210 and index == 2:
                parts.append("Clsn1: 1")
                parts.append(" Clsn1[0] = 12,-54,96,-18")
            parts.append(f"{action_id},{index},0,0,{duration}")
        parts.append("")
    return "\n".join(parts)


def write_readme(out_dir: Path, display_name: str, source_filename: str) -> None:
    (out_dir / "README.md").write_text(
        f"""# {display_name} Runtime Atlas

Original local/private test character for `mugen-web-sandbox`.

- Visual source: built-in `imagegen` sprite sheet copied to `source/{source_filename}`.
- Normalized runtime atlas: `sprite-sheet-alpha.png` + `manifest.json.frame_layout`.
- `walk-forward` is an 8-frame, slow-cadence grounded walk generated as new sprite art, not a mechanical repair of older frames.
- QA outputs live in `qa/`; the current motion heuristic can warn on low body-center drift for deliberate short-step walks, so visual contact-sheet/browser review remains part of acceptance.
- MUGEN-lite template files live in `mugen/` and are based structurally on the official KFM-style DEF/AIR/CMD/CNS contract, without copying KFM art.
- This folder intentionally does not include commercial or third-party character assets.
""",
        encoding="utf-8",
    )


if __name__ == "__main__":
    raise SystemExit(main())
