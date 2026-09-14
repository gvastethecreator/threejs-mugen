import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it, vi } from "vitest";
import {
  MEASURED_EVIDENCE_OUT_ENV,
  assertExistingMeasuredEvidence,
  persistMeasuredEvidence,
  writeMeasuredJson,
} from "./da29/writeMeasuredJson";

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return { ...actual, writeFileSync: vi.fn(actual.writeFileSync) };
});

it("keeps the previous measured JSON readable while publishing its replacement", async () => {
  const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
  const directory = mkdtempSync(join(tmpdir(), "da29-publication-"));
  const destination = join(directory, "DA29-012.json");
  const previous = { id: "DA29-012", revision: 1 };
  const next = { id: "DA29-012", revision: 2, result: "complete" };
  try {
    actual.writeFileSync(destination, JSON.stringify(previous));
    vi.mocked(writeFileSync).mockImplementationOnce((path, data, options) => {
      // Reproduce the partial-write window that previously exposed an empty JSON.
      actual.writeFileSync(path, "{", options);
      expect(JSON.parse(readFileSync(destination, "utf8"))).toEqual(previous);
      actual.writeFileSync(path, String(data).slice(1), { encoding: "utf8", flag: "a" });
    });

    writeMeasuredJson(destination, next);

    expect(JSON.parse(readFileSync(destination, "utf8"))).toEqual(next);
    expect(readdirSync(directory)).toEqual(["DA29-012.json"]);
  } finally {
    vi.mocked(writeFileSync).mockReset();
    rmSync(directory, { recursive: true, force: true });
  }
});

it("rejects a missing generated measured record", () => {
  expect(() => assertExistingMeasuredEvidence(join(tmpdir(), "da29-missing-measured.json"))).toThrow(
    /missing measured evidence/,
  );
});

it("rejects a malformed generated measured record", () => {
  const directory = mkdtempSync(join(tmpdir(), "da29-malformed-"));
  const destination = join(directory, "DA29-012.json");
  try {
    writeFileSync(destination, "{", "utf8");
    expect(() => assertExistingMeasuredEvidence(destination)).toThrow(/malformed measured evidence/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

it("writes only the requested MEASURED_EVIDENCE_OUT directory", () => {
  const trackedDir = mkdtempSync(join(tmpdir(), "da29-tracked-"));
  const destinationDir = mkdtempSync(join(tmpdir(), "da29-dest-"));
  const trackedPath = join(trackedDir, "DA29-012.json");
  const previous = process.env[MEASURED_EVIDENCE_OUT_ENV];
  try {
    process.env[MEASURED_EVIDENCE_OUT_ENV] = destinationDir;
    persistMeasuredEvidence(trackedPath, { id: "DA29-012", ok: true });
    expect(existsSync(trackedPath)).toBe(false);
    expect(JSON.parse(readFileSync(join(destinationDir, "DA29-012.json"), "utf8"))).toEqual({
      id: "DA29-012",
      ok: true,
    });
  } finally {
    if (previous === undefined) {
      delete process.env[MEASURED_EVIDENCE_OUT_ENV];
    } else {
      process.env[MEASURED_EVIDENCE_OUT_ENV] = previous;
    }
    rmSync(trackedDir, { recursive: true, force: true });
    rmSync(destinationDir, { recursive: true, force: true });
  }
});
