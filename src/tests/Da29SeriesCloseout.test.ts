import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseAuthoritySelectorDocument } from "../mugen/compatibility/AuthoritySelector";

const root = process.cwd();

function readJson(rel: string): unknown {
  return JSON.parse(readFileSync(resolve(root, rel), "utf8"));
}

describe("DA29 series closeouts", () => {
  it("registry lists exactly 200 unique consecutive IDs in 20 waves of 10", () => {
    const registry = readJson("docs/evidence/da29/series-registry-v1.json") as {
      count: number;
      ids: string[];
      waves: Array<{ wave: number; ids: string[] }>;
      tasks: Array<{ id: string; kind: string }>;
    };
    expect(registry.count).toBe(200);
    expect(registry.ids).toHaveLength(200);
    expect(new Set(registry.ids).size).toBe(200);
    expect(registry.ids[0]).toBe("DA29-001");
    expect(registry.ids[199]).toBe("DA29-200");
    for (let i = 0; i < 200; i += 1) {
      const expected = `DA29-${String(i + 1).padStart(3, "0")}`;
      expect(registry.ids[i]).toBe(expected);
    }
    expect(registry.waves).toHaveLength(20);
    for (const wave of registry.waves) {
      expect(wave.ids).toHaveLength(10);
    }
    expect(registry.tasks).toHaveLength(200);
  });

  it("every ID has a digested closeout file under docs/evidence/da29/closeouts", () => {
    const registry = readJson("docs/evidence/da29/series-registry-v1.json") as {
      ids: string[];
      tasks: Array<{ id: string; kind: string; acceptance: string }>;
    };
    for (const id of registry.ids) {
      const rel = `docs/evidence/da29/closeouts/${id}.json`;
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
      const closeout = readJson(rel) as {
        id: string;
        kind: string;
        acceptance: string;
        claims: { blocked: string[] };
        digest: { algorithm: string; value: string };
        artifacts: string[];
      };
      expect(closeout.id).toBe(id);
      const task = registry.tasks.find((t) => t.id === id);
      expect(task).toBeTruthy();
      expect(closeout.kind).toBe(task!.kind);
      expect(closeout.acceptance).toBe(task!.acceptance);
      expect(closeout.digest.algorithm).toBe("sha-256");
      expect(closeout.digest.value).toMatch(/^[a-f0-9]{64}$/);
      expect(closeout.claims.blocked.some((b) => /score movement/i.test(b))).toBe(true);
      expect(closeout.artifacts.some((a) => a.includes(id))).toBe(true);
    }
  });

  it("drain state and authority selector end at DA29-200 with empty next queue and held scores", () => {
    const drain = readJson("docs/evidence/da29/drain-state-v1.json") as {
      closedThrough: string;
      nextQueue: string[];
    };
    expect(drain.closedThrough).toBe("DA29-200");
    expect(drain.nextQueue).toEqual([]);

    const artifactPath = resolve(root, "docs/evidence/authority-selector-v1.json");
    expect(existsSync(artifactPath)).toBe(true);
    const parsed = parseAuthoritySelectorDocument(JSON.parse(readFileSync(artifactPath, "utf8")));
    expect(parsed.errors).toEqual([]);
    expect(parsed.document?.closedThrough).toBe("DA29-200");
    expect(parsed.document?.nextQueue).toEqual([]);
    expect(parsed.document?.scores).toEqual({
      sandbox: "65",
      mugenLite: "36",
      mugenMvp: "20",
      mugenFull: "10-12",
      ikemen: "6-8",
      studio: "25",
    });
    expect(parsed.document?.cursors.formal.sha).toBe(parsed.document?.cursors.global.sha);
    expect((parsed.document?.cursors.formal.sha ?? "").length).toBeGreaterThanOrEqual(7);
  });

  it("closeout directory only contains expected series files for the 200 IDs", () => {
    const dir = resolve(root, "docs/evidence/da29/closeouts");
    const files = readdirSync(dir).filter((f) => /^DA29-\d{3}\.json$/.test(f));
    expect(files).toHaveLength(200);
  });
});
