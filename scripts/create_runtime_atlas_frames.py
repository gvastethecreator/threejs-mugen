#!/usr/bin/env python3
"""Create deterministic curated frames for runtime atlas characters."""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]


@dataclass(frozen=True)
class Theme:
    skin: tuple[int, int, int, int]
    hair: tuple[int, int, int, int]
    body: tuple[int, int, int, int]
    accent: tuple[int, int, int, int]
    leg_a: tuple[int, int, int, int]
    leg_b: tuple[int, int, int, int]
    glove: tuple[int, int, int, int]
    shoe: tuple[int, int, int, int]


THEMES = {
    "nova-boxer": Theme(
        skin=(230, 165, 105, 255),
        hair=(28, 31, 42, 255),
        body=(34, 86, 204, 255),
        accent=(245, 248, 255, 255),
        leg_a=(34, 86, 204, 255),
        leg_b=(245, 248, 255, 255),
        glove=(245, 248, 255, 255),
        shoe=(250, 196, 55, 255),
    ),
    "mira-volt": Theme(
        skin=(236, 185, 145, 255),
        hair=(28, 24, 32, 255),
        body=(185, 47, 126, 255),
        accent=(34, 218, 231, 255),
        leg_a=(30, 30, 40, 255),
        leg_b=(185, 47, 126, 255),
        glove=(30, 30, 40, 255),
        shoe=(34, 218, 231, 255),
    ),
    "rook-apprentice": Theme(
        skin=(232, 166, 112, 255),
        hair=(22, 24, 26, 255),
        body=(18, 132, 116, 255),
        accent=(243, 115, 38, 255),
        leg_a=(24, 42, 76, 255),
        leg_b=(18, 132, 116, 255),
        glove=(243, 115, 38, 255),
        shoe=(245, 246, 238, 255),
    ),
}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-dir", required=True, type=Path)
    parser.add_argument("--theme", required=True, choices=sorted(THEMES))
    args = parser.parse_args()

    run_dir = args.run_dir.expanduser().resolve()
    request = json.loads((run_dir / "sprite-request.json").read_text(encoding="utf-8"))
    cell = request["cell"]
    width = int(cell.get("width", cell.get("size", 128)))
    height = int(cell.get("height", cell.get("size", 128)))
    frames_root = run_dir / "frames"
    frames_root.mkdir(parents=True, exist_ok=True)

    rows: list[dict[str, object]] = []
    theme = THEMES[args.theme]
    for state, spec in request["states"].items():
        count = int(spec["frames"])
        state_dir = frames_root / state
        state_dir.mkdir(parents=True, exist_ok=True)
        files = []
        for frame in range(count):
            image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
            draw_frame(image, state, frame, count, theme)
            rel = f"frames/{state}/frame-{frame}.png"
            image.save(run_dir / rel)
            files.append(rel)
        rows.append({"state": state, "ok": True, "frames": count, "files": files})

    manifest = {
        "ok": True,
        "engine": "deterministic-curated-frames",
        "source": "imagegen concept plus procedural frame curation",
        "rows": rows,
    }
    (frames_root / "frames-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"ok": True, "run_dir": str(run_dir), "states": [row["state"] for row in rows]}, indent=2))
    return 0


def draw_frame(image: Image.Image, state: str, frame: int, count: int, theme: Theme) -> None:
    draw = ImageDraw.Draw(image)
    w, h = image.size
    cx = w // 2
    floor = h - 10
    phase = frame / max(1, count - 1)
    wave = (frame % 2) * 2 - 1

    crouch = state == "crouch"
    jump = state == "jump"
    punch = state == "punch"
    kick = state == "kick"
    hit = state == "hitstun"
    walk = state == "walk-forward"

    hip_y = floor - (32 if crouch else 48)
    if jump:
        hip_y -= int(8 + 10 * phase)
    if walk:
        hip_y += wave * 2
    chest_y = hip_y - (24 if crouch else 30)
    head_y = chest_y - 15
    lean = -12 if hit else 6 if punch else 0

    dark = (25, 27, 42, 255)
    outline = (238, 241, 255, 255)

    draw.ellipse((cx - 38, floor - 3, cx + 40, floor + 6), fill=(0, 0, 0, 45))

    right_leg_x = cx + 16 + (10 * wave if walk else 0)
    left_leg_x = cx - 14 - (8 * wave if walk else 0)
    if kick:
        right_leg_x = cx + int(62 * min(1, phase + 0.25))
    draw_limb(draw, (cx - 12 + lean, hip_y), (left_leg_x, floor - 6), theme.leg_a, 14)
    draw_limb(draw, (cx + 12 + lean, hip_y), (right_leg_x, floor - (32 if kick else 6)), theme.leg_b, 14)

    left_arm_end = (cx - 36 + lean, chest_y + 28)
    right_arm_end = (cx + 34 + lean, chest_y + 24)
    if punch:
        right_arm_end = (cx + int(68 * min(1, phase + 0.35)), chest_y + 8)
    if hit:
        right_arm_end = (cx - 8, chest_y + 42)
        left_arm_end = (cx - 44, chest_y + 12)
    draw_limb(draw, (cx - 18 + lean, chest_y + 18), left_arm_end, theme.glove, 10)
    draw_limb(draw, (cx + 18 + lean, chest_y + 18), right_arm_end, theme.glove, 10)

    body = (cx - 22 + lean, chest_y - 2, cx + 22 + lean, hip_y + 16)
    draw.rounded_rectangle(body, radius=13, fill=dark, outline=outline, width=3)
    draw.rounded_rectangle((body[0] + 8, body[1] + 13, body[2] - 8, body[3] - 10), radius=8, fill=theme.body)
    draw.line((body[0] + 10, body[1] + 12, body[2] - 8, body[1] + 26), fill=theme.accent, width=4)

    draw.ellipse((cx - 14 + lean, head_y - 12, cx + 14 + lean, head_y + 16), fill=theme.skin, outline=dark, width=3)
    draw.polygon(
        [
            (cx - 12 + lean, head_y - 10),
            (cx + 12 + lean, head_y - 16),
            (cx + 18 + lean, head_y - 3),
            (cx - 3 + lean, head_y - 1),
        ],
        fill=theme.hair,
    )
    draw.rectangle((cx + 6 + lean, head_y + 2, cx + 14 + lean, head_y + 5), fill=dark)
    draw.rounded_rectangle((cx - 28 + lean, floor - 9, cx - 4 + lean, floor - 2), radius=4, fill=theme.shoe)
    draw.rounded_rectangle((right_leg_x - 10, floor - (35 if kick else 9), right_leg_x + 18, floor - (27 if kick else 2)), radius=4, fill=theme.shoe)


def draw_limb(draw: ImageDraw.ImageDraw, start: tuple[int, int], end: tuple[int, int], fill: tuple[int, int, int, int], width: int) -> None:
    draw.line((*start, *end), fill=fill, width=width)
    radius = width // 2
    draw.ellipse((end[0] - radius, end[1] - radius, end[0] + radius, end[1] + radius), fill=fill)


if __name__ == "__main__":
    raise SystemExit(main())
