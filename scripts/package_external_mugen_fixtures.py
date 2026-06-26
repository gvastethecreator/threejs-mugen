from __future__ import annotations

import json
import zipfile
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRATCH = ROOT / ".scratch"
EXTERNAL = SCRATCH / "external"
FIXTURES = SCRATCH / "fixtures"


@dataclass(frozen=True)
class FixtureSpec:
    fixture_id: str
    display_name: str
    source_url: str
    zip_name: str
    def_path: str
    notes: list[str]
    tree_copies: list[tuple[Path, str]]
    file_copies: list[tuple[Path, str]] = field(default_factory=list)


def main() -> None:
    FIXTURES.mkdir(parents=True, exist_ok=True)
    specs = build_specs()
    results = []

    for spec in specs:
        zip_path = FIXTURES / spec.zip_name
        missing = missing_inputs(spec)
        if missing:
            results.append(
                {
                    "id": spec.fixture_id,
                    "displayName": spec.display_name,
                    "status": "missing-inputs",
                    "zipPath": str(zip_path.relative_to(ROOT)),
                    "defPath": spec.def_path,
                    "sourceUrl": spec.source_url,
                    "missing": [str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path) for path in missing],
                    "notes": spec.notes,
                }
            )
            continue

        with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
            for source_dir, target_dir in spec.tree_copies:
                add_tree(archive, source_dir, target_dir)
            for source_file, target_file in spec.file_copies:
                add_file(archive, source_file, target_file)

        results.append(
            {
                "id": spec.fixture_id,
                "displayName": spec.display_name,
                "status": "ready",
                "zipPath": str(zip_path.relative_to(ROOT)),
                "defPath": spec.def_path,
                "sourceUrl": spec.source_url,
                "sizeBytes": zip_path.stat().st_size,
                "notes": spec.notes,
            }
        )

    manifest = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "outputDirectory": str(FIXTURES.relative_to(ROOT)),
        "fixtures": results,
    }
    manifest_path = FIXTURES / "external-fixtures.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(json.dumps(manifest, indent=2))


def build_specs() -> list[FixtureSpec]:
    mugen_root = EXTERNAL / "mugen-1.1b1"
    codefuman_root = EXTERNAL / "CodeFuMan-master" / "CodeFuMan-master"
    ryu_root = EXTERNAL / "demo_mugenJS-master" / "demo_mugenJS-master" / "chars" / "SF3_Ryu"
    common1 = mugen_root / "data" / "common1.cns"

    return [
        FixtureSpec(
            fixture_id="kfm-official",
            display_name="Kung Fu Man",
            source_url="https://www.elecbyte.com/mugenfiles/1.1/mugen-1.1b1.zip",
            zip_name="kfm-official.zip",
            def_path="chars/kfm/kfm.def",
            tree_copies=[
                (mugen_root / "chars" / "kfm", "chars/kfm"),
            ],
            file_copies=[
                (common1, "data/common1.cns"),
                (mugen_root / "stages" / "kfm.def", "stages/kfm.def"),
                (mugen_root / "stages" / "kfm.sff", "stages/kfm.sff"),
            ],
            notes=[
                "Official MUGEN 1.1 beta 1 default character package.",
                "Includes data/common1.cns so stcommon resolves like a normal MUGEN install.",
            ],
        ),
        FixtureSpec(
            fixture_id="kfm720-official",
            display_name="Kung Fu Man 720",
            source_url="https://www.elecbyte.com/mugenfiles/1.1/mugen-1.1b1.zip",
            zip_name="kfm720-official.zip",
            def_path="chars/kfm720/kfm720.def",
            tree_copies=[
                (mugen_root / "chars" / "kfm720", "chars/kfm720"),
            ],
            file_copies=[
                (common1, "data/common1.cns"),
                (mugen_root / "stages" / "stage0-720.def", "stages/stage0-720.def"),
                (mugen_root / "stages" / "stage0-720.sff", "stages/stage0-720.sff"),
            ],
            notes=[
                "Official 720p KFM variant from the MUGEN 1.1 beta 1 package.",
                "Useful for localcoord and larger sprite compatibility checks.",
            ],
        ),
        FixtureSpec(
            fixture_id="codefuman",
            display_name="Code Fu Man",
            source_url="https://github.com/Jesuszilla/CodeFuMan",
            zip_name="codefuman.zip",
            def_path="chars/cfm/cfm.def",
            tree_copies=[
                (codefuman_root, "chars/cfm"),
            ],
            file_copies=[
                (common1, "data/common1.cns"),
            ],
            notes=[
                "Community KFM derivative with palettes and classic CNS/CMD data.",
                "Packaged under chars/cfm so its cfm.def resolves local kfm.* references.",
            ],
        ),
        FixtureSpec(
            fixture_id="sf3-ryu-demo-mugenjs",
            display_name="SF3 Ryu",
            source_url="https://github.com/Tatayecorp/demo_mugenJS",
            zip_name="sf3-ryu-demo-mugenjs.zip",
            def_path="chars/SF3_Ryu/SF3_Ryu.def",
            tree_copies=[
                (ryu_root, "chars/SF3_Ryu"),
            ],
            notes=[
                "External parser stress fixture with CODE/ and ACT/ subfolders.",
                "Uses .txt CNS/CMD filenames, which exercises DEF path resolution beyond fixed extensions.",
            ],
        ),
    ]


def missing_inputs(spec: FixtureSpec) -> list[Path]:
    missing: list[Path] = []
    for source_dir, _target_dir in spec.tree_copies:
        if not source_dir.is_dir():
            missing.append(source_dir)
    for source_file, _target_file in spec.file_copies:
        if not source_file.is_file():
            missing.append(source_file)
    return missing


def add_tree(archive: zipfile.ZipFile, source_dir: Path, target_dir: str) -> None:
    for source_file in sorted(path for path in source_dir.rglob("*") if path.is_file()):
        relative = source_file.relative_to(source_dir).as_posix()
        add_file(archive, source_file, f"{target_dir}/{relative}")


def add_file(archive: zipfile.ZipFile, source_file: Path, target_file: str) -> None:
    info = zipfile.ZipInfo(target_file.replace("\\", "/"))
    info.date_time = (2026, 1, 1, 0, 0, 0)
    info.compress_type = zipfile.ZIP_DEFLATED
    with source_file.open("rb") as handle:
        archive.writestr(info, handle.read())


if __name__ == "__main__":
    main()
