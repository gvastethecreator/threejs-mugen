import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseAuthoritySelectorDocument } from "../mugen/compatibility/AuthoritySelector";
import {
  computeSeriesCursor,
  mayClose,
  type Da29CloseoutRecord,
} from "../mugen/da29/Da29SeriesLedger";
import { runDa29ImplementationProbe } from "../mugen/da29/Da29ImplementationProbes";

const root = process.cwd();

function readJson<T>(rel: string): T {
  return JSON.parse(readFileSync(resolve(root, rel), "utf8")) as T;
}

describe("DA29 series closeouts (honest)", () => {
  it("registry lists exactly 200 unique consecutive IDs in 20 waves of 10", () => {
    const registry = readJson<{
      count: number;
      ids: string[];
      waves: Array<{ wave: number; ids: string[] }>;
      tasks: Array<{ id: string; kind: string }>;
    }>("docs/evidence/da29/series-registry-v1.json");
    expect(registry.count).toBe(200);
    expect(registry.ids).toHaveLength(200);
    expect(new Set(registry.ids).size).toBe(200);
    expect(registry.ids[0]).toBe("DA29-001");
    expect(registry.ids[199]).toBe("DA29-200");
    for (let i = 0; i < 200; i += 1) {
      expect(registry.ids[i]).toBe(`DA29-${String(i + 1).padStart(3, "0")}`);
    }
    expect(registry.waves).toHaveLength(20);
  });

  it("status ledger matches closeouts and forbids unproven closed I/G theater", () => {
    const statusDoc = readJson<{
      records: Array<{
        id: string;
        kind: string;
        status: "closed" | "open";
        evidenceClass: string;
        measuredGate?: boolean;
        gateSha?: string | null;
      }>;
      cursor: { closedThrough: string; nextQueue: string[] };
    }>("docs/evidence/da29/closeout-status-v1.json");

    expect(statusDoc.records).toHaveLength(200);

    for (const rec of statusDoc.records) {
      const closeout = readJson<{
        id: string;
        kind: string;
        status: string;
        evidenceClass: string;
        measuredGate?: boolean;
        gateSha?: string | null;
        acceptance: string;
        artifacts: string[];
        digest: { value: string };
      }>(`docs/evidence/da29/closeouts/${rec.id}.json`);

      expect(closeout.id).toBe(rec.id);
      expect(closeout.status).toBe(rec.status);
      expect(closeout.evidenceClass).toBe(rec.evidenceClass);
      expect(closeout.digest.value).toMatch(/^[a-f0-9]{64}$/);

      if (rec.status === "closed") {
        expect(rec.evidenceClass).not.toBe("unproven");
        expect(
          mayClose({
            kind: rec.kind as "R" | "A" | "I" | "G",
            evidenceClass: rec.evidenceClass as Da29CloseoutRecord["evidenceClass"],
            measuredGate: rec.measuredGate,
            status: "closed",
          }),
        ).toBe(true);

        if (rec.kind === "I") {
          expect(rec.evidenceClass).toBe("implementation-probe");
          const probePath = `docs/evidence/da29/probes/${rec.id.toLowerCase()}.json`;
          expect(existsSync(resolve(root, probePath))).toBe(true);
          const probe = readJson<{ ok: boolean; entryPoints: string[] }>(probePath);
          expect(probe.ok).toBe(true);
          expect(probe.entryPoints.length).toBeGreaterThan(0);
          for (const ep of probe.entryPoints) {
            expect(existsSync(resolve(root, ep)), ep).toBe(true);
          }
        }

        if (rec.kind === "G" && rec.id === "DA29-002") {
          expect(rec.measuredGate).toBe(true);
          expect(rec.gateSha).toMatch(/^[a-f0-9]{7,40}$/);
          expect(closeout.measuredGate).toBe(true);
          expect(closeout.gateSha).toBe(rec.gateSha);
        }

        if (rec.evidenceClass === "browser-matrix") {
          const shots = closeout.artifacts.filter((a) => a.endsWith(".png"));
          expect(shots.length).toBeGreaterThanOrEqual(2);
          for (const shot of shots) {
            expect(existsSync(resolve(root, shot)), shot).toBe(true);
          }
        }
      }
    }
  });

  it("authority closedThrough equals consecutive watermark and formal pin matches measured DA29-002 gate", () => {
    const statusDoc = readJson<{
      records: Array<{
        id: string;
        kind: "R" | "A" | "I" | "G";
        status: "closed" | "open";
        evidenceClass: Da29CloseoutRecord["evidenceClass"];
        measuredGate?: boolean;
        gateSha?: string | null;
      }>;
      cursor: { closedThrough: string; nextQueue: string[] };
    }>("docs/evidence/da29/closeout-status-v1.json");

    const ledgerRecords: Da29CloseoutRecord[] = statusDoc.records.map((r) => ({
      id: r.id,
      kind: r.kind,
      status: r.status,
      evidenceClass: r.evidenceClass,
      measuredGate: r.measuredGate,
      gateSha: r.gateSha,
      acceptance: "",
    }));
    const computed = computeSeriesCursor(ledgerRecords);
    expect(statusDoc.cursor.closedThrough).toBe(computed.closedThrough);
    expect(statusDoc.cursor.nextQueue).toEqual(computed.nextQueue);

    const drain = readJson<{ closedThrough: string; nextQueue: string[]; measuredGateSha?: string }>(
      "docs/evidence/da29/drain-state-v1.json",
    );
    expect(drain.closedThrough).toBe(computed.closedThrough);
    expect(drain.nextQueue).toEqual(computed.nextQueue);

    const parsed = parseAuthoritySelectorDocument(
      JSON.parse(readFileSync(resolve(root, "docs/evidence/authority-selector-v1.json"), "utf8")),
    );
    expect(parsed.errors).toEqual([]);
    expect(parsed.document?.closedThrough).toBe(computed.closedThrough);
    expect(parsed.document?.nextQueue).toEqual(computed.nextQueue);
    expect(parsed.document?.scores).toEqual({
      sandbox: "65",
      mugenLite: "36",
      mugenMvp: "20",
      mugenFull: "10-12",
      ikemen: "6-8",
      studio: "25",
    });

    const gate002 = statusDoc.records.find((r) => r.id === "DA29-002");
    expect(gate002).toBeTruthy();
    // When measured full-stack gate log is present, 002 must be closed and pin must match.
    // When gate is not yet measured, 002 stays open and watermark stops at 001.
    if (gate002?.status === "closed") {
      expect(gate002.measuredGate).toBe(true);
      expect(gate002.gateSha).toMatch(/^[a-f0-9]{7,40}$/);
      expect(parsed.document?.cursors.formal.sha).toBe(gate002.gateSha);
      expect(parsed.document?.cursors.global.sha).toBe(gate002.gateSha);
      expect(parseInt(computed.closedThrough.slice(5), 10)).toBeGreaterThanOrEqual(2);
    } else {
      expect(gate002?.measuredGate).not.toBe(true);
      expect(computed.closedThrough).toBe("DA29-001");
      expect(computed.nextQueue[0]).toBe("DA29-002");
    }
  });

  it("implementation probes call shipped surfaces for closed I IDs", () => {
    const registry = readJson<{ tasks: Array<{ id: string; kind: string; cut: string }> }>(
      "docs/evidence/da29/series-registry-v1.json",
    );
    const statusDoc = readJson<{
      records: Array<{ id: string; kind: string; status: string }>;
    }>("docs/evidence/da29/closeout-status-v1.json");
    const closedI = statusDoc.records.filter((r) => r.kind === "I" && r.status === "closed");
    expect(closedI.length).toBeGreaterThan(0);
    for (const rec of closedI) {
      const task = registry.tasks.find((t) => t.id === rec.id);
      expect(task).toBeTruthy();
      const live = runDa29ImplementationProbe(rec.id, task!.cut);
      expect(live.ok, `${rec.id} ${live.error}`).toBe(true);
      expect(live.entryPoints.length).toBeGreaterThan(0);
    }
  });

  it("closeout files exist for all 200 IDs (closed or open)", () => {
    const dir = resolve(root, "docs/evidence/da29/closeouts");
    const files = readdirSync(dir).filter((f) => /^DA29-\d{3}\.json$/.test(f));
    expect(files).toHaveLength(200);
  });
});
