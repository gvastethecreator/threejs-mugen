import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it, vi } from "vitest";
import { writeMeasuredJson } from "./da29/writeMeasuredJson";

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
