import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseAuthoritySelectorDocument } from "../mugen/compatibility/AuthoritySelector";
import {
  computeSeriesCursor,
  mayClose,
  type Da29CloseoutRecord,
} from "../mugen/da29/Da29SeriesLedger";
import { assertMeasuredMatchesAcceptance } from "../mugen/da29/AssertMeasuredMatchesAcceptance";
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

  it("status ledger matches closeouts and forbids path-exists / PNG-reuse theater", () => {
    const statusDoc = readJson<{
      records: Array<{
        id: string;
        kind: string;
        status: "closed" | "open";
        evidenceClass: string;
        measuredGate?: boolean;
        gateSha?: string | null;
        hasMeasuredAcceptance?: boolean;
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
        hasMeasuredAcceptance?: boolean;
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
            id: rec.id,
            kind: rec.kind as "R" | "A" | "I" | "G",
            evidenceClass: rec.evidenceClass as Da29CloseoutRecord["evidenceClass"],
            measuredGate: rec.measuredGate,
            status: "closed",
            hasMeasuredAcceptance: rec.hasMeasuredAcceptance,
          }),
        ).toBe(true);

        if (rec.kind === "I" || (rec.kind === "G" && rec.hasMeasuredAcceptance)) {
          if (rec.kind === "I") expect(rec.hasMeasuredAcceptance).toBe(true);
          const measuredPath = `docs/evidence/da29/measured/${rec.id}.json`;
          expect(existsSync(resolve(root, measuredPath))).toBe(true);
          const measured = readJson<{
            id?: string;
            ok: boolean;
            acceptanceExecuted?: boolean;
            liveRenderer?: boolean;
            functionResults?: Record<string, unknown>;
            anchors?: Array<string | { path?: string }>;
          }>(measuredPath);
          expect(measured.ok).toBe(true);
          expect(measured.acceptanceExecuted || measured.liveRenderer).toBeTruthy();
          const registryTask = readJson<{
            tasks: Array<{ id: string; kind: string; acceptance: string; cut: string }>;
          }>("docs/evidence/da29/series-registry-v1.json").tasks.find((t) => t.id === rec.id);
          expect(registryTask).toBeTruthy();
          const check = assertMeasuredMatchesAcceptance({
            id: rec.id,
            kind: rec.kind as "I" | "G",
            acceptance: registryTask!.acceptance,
            cut: registryTask!.cut,
            measured,
          });
          expect(check.ok, `${rec.id}: ${check.reason}`).toBe(true);
        }

        if (rec.kind === "G" && rec.id === "DA29-002") {
          expect(rec.measuredGate).toBe(true);
          expect(rec.gateSha).toMatch(/^[a-f0-9]{7,40}$/);
        }

        if (rec.evidenceClass === "browser-matrix") {
          expect(rec.id).toBe("DA29-003");
          const shots = closeout.artifacts.filter((a) => a.endsWith(".png"));
          expect(shots.length).toBeGreaterThanOrEqual(2);
          for (const shot of shots) {
            expect(existsSync(resolve(root, shot)), shot).toBe(true);
          }
        }

        // No probe-only I closes: if a probe file exists, it must declare closesCut false or not be sole evidence.
        if (rec.kind === "I") {
          const probePath = resolve(root, `docs/evidence/da29/probes/${rec.id.toLowerCase()}.json`);
          if (existsSync(probePath)) {
            const probe = readJson<{ closesCut?: boolean; entryPoints?: string[] }>(
              `docs/evidence/da29/probes/${rec.id.toLowerCase()}.json`,
            );
            // Directory-only probes are insufficient even if present.
            const onlyDirs = (probe.entryPoints || []).every(
              (ep) => ep === "src/mugen" || ep === "src/game" || !ep.includes("."),
            );
            expect(onlyDirs && !rec.hasMeasuredAcceptance).toBe(false);
          }
        }
      }
    }
  });

  it("authority closedThrough equals consecutive watermark and formal pin matches measured DA29-002 when closed", () => {
    const statusDoc = readJson<{
      records: Array<{
        id: string;
        kind: "R" | "A" | "I" | "G";
        status: "closed" | "open";
        evidenceClass: Da29CloseoutRecord["evidenceClass"];
        measuredGate?: boolean;
        gateSha?: string | null;
        hasMeasuredAcceptance?: boolean;
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
      hasMeasuredAcceptance: r.hasMeasuredAcceptance,
    }));
    const computed = computeSeriesCursor(ledgerRecords);
    expect(statusDoc.cursor.closedThrough).toBe(computed.closedThrough);
    expect(statusDoc.cursor.nextQueue).toEqual(computed.nextQueue);

    const drain = readJson<{ closedThrough: string; nextQueue: string[] }>(
      "docs/evidence/da29/drain-state-v1.json",
    );
    expect(drain.closedThrough).toBe(computed.closedThrough);
    expect(drain.nextQueue).toEqual(computed.nextQueue);

    const parsed = parseAuthoritySelectorDocument(
      JSON.parse(readFileSync(resolve(root, "docs/evidence/authority-selector-v1.json"), "utf8")),
    );
    expect(parsed.errors).toEqual([]);
    // Live control may be on DA30 recovery; DA29 computed cursor stays on da29 drain artifacts only.
    expect(parsed.document?.closedThrough).toMatch(/^(DA28-30|DA29-\d{3}|DA30-\d{3})$/);
    expect(Array.isArray(parsed.document?.nextQueue)).toBe(true);
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
    if (gate002?.status === "closed") {
      expect(gate002.measuredGate).toBe(true);
      expect(gate002.gateSha).toMatch(/^[a-f0-9]{7,40}$/);
      // Formal pin may remain the historical measured gate SHA while DA30 advances the queue.
      expect(parsed.document?.cursors.formal.sha).toMatch(/^[a-f0-9]{7,40}$/);
      expect(parsed.document?.cursors.global.sha).toBe(gate002.gateSha);
    }

    // DA29-072 must not close on synthetic seed metrics
    const m072 = readJson<{ ok?: boolean; liveRenderer?: boolean; acceptanceExecuted?: boolean }>(
      "docs/evidence/da29/measured/DA29-072.json",
    );
    if (m072.liveRenderer !== true) {
      const c072 = statusDoc.records.find((r) => r.id === "DA29-072");
      expect(c072?.status).toBe("open");
    }
  });

  it("path-exists probes never alone close [I] cuts", () => {
    const probe041 = resolve(root, "docs/evidence/da29/probes/da29-041.json");
    if (existsSync(probe041)) {
      const probe = readJson<{ id: string; entryPoints: string[]; closesCut?: boolean }>(
        "docs/evidence/da29/probes/da29-041.json",
      );
      expect(probe.entryPoints).toEqual(expect.arrayContaining(["src/mugen", "src/game"]));
      const status = readJson<{ records: Array<{ id: string; status: string; hasMeasuredAcceptance?: boolean }> }>(
        "docs/evidence/da29/closeout-status-v1.json",
      );
      const rec = status.records.find((r) => r.id === "DA29-041");
      // Without measured acceptance, must stay open.
      if (!rec?.hasMeasuredAcceptance) {
        expect(rec?.status).toBe("open");
      }
    }
    // Live probe helper may still map dirs for diagnostics, but mayClose rejects it.
    const live = runDa29ImplementationProbe(
      "DA29-041",
      "Turn Nova's attack-state probe into an actual contact journey.",
    );
    expect(live.entryPoints.length).toBeGreaterThan(0);
    expect(
      mayClose({
        id: "DA29-041",
        kind: "I",
        status: "closed",
        evidenceClass: "implementation-probe",
        hasMeasuredAcceptance: false,
      }),
    ).toBe(false);
  });

  it("closeout files exist for all 200 IDs (closed or open)", () => {
    const dir = resolve(root, "docs/evidence/da29/closeouts");
    const files = readdirSync(dir).filter((f) => /^DA29-\d{3}\.json$/.test(f));
    expect(files).toHaveLength(200);
  });

  it("browser-matrix closeout is exclusive to DA29-003", () => {
    const status = readJson<{ records: Array<{ id: string; status: string; evidenceClass: string }> }>(
      "docs/evidence/da29/closeout-status-v1.json",
    );
    const browserClosed = status.records.filter(
      (r) => r.status === "closed" && r.evidenceClass === "browser-matrix",
    );
    for (const rec of browserClosed) {
      expect(rec.id).toBe("DA29-003");
    }
  });
});
