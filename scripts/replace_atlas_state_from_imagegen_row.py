#!/usr/bin/env python3
"""Replace one runtime atlas animation row from a freshly generated image row."""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from build_character_from_imagegen_sheet import (  # noqa: E402
    CELL_H,
    CELL_W,
    SHEET_COLS,
    compute_reference_scale,
    extract_components,
    fit_count,
    normalize_component,
    remove_green_background,
)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--character-dir", required=True, type=Path)
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--state", default="walk-forward")
    parser.add_argument("--frames", type=int, default=8)
    args = parser.parse_args()

    character_dir = args.character_dir.resolve()
    source = args.source.resolve()
    if not character_dir.exists():
        raise FileNotFoundError(character_dir)
    if not source.exists():
        raise FileNotFoundError(source)

    image = Image.open(source).convert("RGBA")
    alpha_image = remove_green_background(image)
    components = sorted(extract_components(alpha_image), key=lambda comp: comp["bbox"][0])
    selected = fit_count(components, args.frames)
    reference_scale = compute_reference_scale([selected])

    source_dir = character_dir / "source"
    source_dir.mkdir(parents=True, exist_ok=True)
    row_source_name = f"{character_dir.name}-{args.state}-imagegen-row.png"
    shutil.copy2(source, source_dir / row_source_name)

    raw_dir = character_dir / "raw"
    frames_dir = character_dir / "frames" / args.state
    qa_dir = character_dir / "qa"
    raw_dir.mkdir(parents=True, exist_ok=True)
    frames_dir.mkdir(parents=True, exist_ok=True)
    qa_dir.mkdir(parents=True, exist_ok=True)

    for old_frame in frames_dir.glob("frame-*.png"):
        old_frame.unlink()

    raw_contact = Image.new("RGBA", (args.frames * CELL_W, CELL_H), (0, 0, 0, 0))
    files: list[str] = []
    for frame_index, component in enumerate(selected):
        frame = normalize_component(alpha_image, component["bbox"], reference_scale)
        frame_path = frames_dir / f"frame-{frame_index}.png"
        frame.save(frame_path)
        files.append(str(frame_path.relative_to(character_dir)).replace("\\", "/"))
        raw_contact.alpha_composite(frame, (frame_index * CELL_W, 0))

    raw_contact.save(raw_dir / f"{args.state}.png")
    create_contact_sheet(raw_contact, args.frames).save(qa_dir / f"{args.state}-contact.png")

    update_frames_manifest(character_dir, args.state, args.frames, files)
    recompose_atlas(character_dir)
    update_report(character_dir, args.state, len(components), len(selected), row_source_name, reference_scale)

    print(
        json.dumps(
            {
                "ok": True,
                "character_dir": str(character_dir),
                "state": args.state,
                "detected_components": len(components),
                "used": len(selected),
                "reference_scale": reference_scale,
            },
            indent=2,
        )
    )
    return 0


def update_frames_manifest(character_dir: Path, state: str, frames: int, files: list[str]) -> None:
    manifest_path = character_dir / "frames" / "frames-manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    rows = manifest.setdefault("rows", [])
    replacement = {"state": state, "ok": True, "frames": frames, "files": files}
    for index, row in enumerate(rows):
        if row.get("state") == state:
            rows[index] = replacement
            break
    else:
        rows.append(replacement)
    manifest["source"] = "imagegen row replacement plus deterministic atlas composition"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


def recompose_atlas(character_dir: Path) -> None:
    manifest_path = character_dir / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    layout = manifest["frame_layout"]
    atlas = Image.new("RGBA", (layout["sheetWidth"], layout["sheetHeight"]), (0, 0, 0, 0))
    for state, rects in layout["rows"].items():
        state_dir = character_dir / "frames" / state
        for index, rect in enumerate(rects):
            frame_path = state_dir / f"frame-{index}.png"
            if not frame_path.exists():
                continue
            frame = Image.open(frame_path).convert("RGBA")
            atlas.alpha_composite(frame, (rect["x"], rect["y"]))
    atlas.save(character_dir / "sprite-sheet-alpha.png")
    create_all_contact(atlas, layout["rows"]).save(character_dir / "qa" / "all-contact.png")


def update_report(character_dir: Path, state: str, detected: int, used: int, source_name: str, reference_scale: float) -> None:
    report_path = character_dir / "sprite-sheet-alpha.report.json"
    report = json.loads(report_path.read_text(encoding="utf-8"))
    for row in report.get("rows", []):
        if row.get("state") == state:
            row["detected"] = detected
            row["used"] = used
            row["regenerated"] = True
            row["source_row"] = f"source/{source_name}"
            row["reference_scale"] = reference_scale
            break
    report.setdefault("row_replacements", []).append(
        {
            "state": state,
            "source": f"source/{source_name}",
            "detected": detected,
            "used": used,
            "reference_scale": reference_scale,
        }
    )
    report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")


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


if __name__ == "__main__":
    raise SystemExit(main())
