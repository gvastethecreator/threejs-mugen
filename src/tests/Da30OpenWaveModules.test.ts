import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { persistMeasuredEvidence } from "./da29/writeMeasuredJson";
import {
  applyGamepadEvent,
  createSeatBindings,
  visibleStatus,
} from "../mugen/da30/GamepadLifecycle";
import {
  createStore,
  openStore,
  resetSeat,
  serializeStore,
  swapSeats,
} from "../mugen/da30/SocdProfileStore";
import { buildClockDomainAudit } from "../mugen/da30/ClockDomainAudit";
import { runNadiaContactCases } from "../mugen/da30/MiraContactRevalidation";
import { runGuardPriorityMatrix } from "../mugen/da30/GuardPriorityMatrix";
import { buildRoundResetLedger } from "../mugen/da30/RoundResetLedger";
import { runRoccoContactCases } from "../mugen/da30/CombatJourneyRevalidation";

const evidence = resolve(process.cwd(), "docs/evidence/da30");
function persist(name: string, body: unknown) {
  persistMeasuredEvidence(resolve(evidence, name), body);
}

describe("DA30 open-wave modules", () => {
  it("DA30-032 gamepad lifecycle mid-hold unplug and reconnect", () => {
    let b = createSeatBindings();
    b = applyGamepadEvent(b, { type: "connect", index: 0, mapping: "standard" });
    b = applyGamepadEvent(b, { type: "button", index: 0, button: 0, pressed: true });
    expect(b[0]!.lastButtons[0]).toBe(true);
    b = applyGamepadEvent(b, { type: "disconnect", index: 0 });
    expect(b[0]!.status).toBe("fallback-keyboard");
    expect(b[0]!.lastButtons[0]).toBe(false);
    b = applyGamepadEvent(b, { type: "connect", index: 1, mapping: "non-standard" });
    expect(b.some((x) => x.status === "mapping-failed")).toBe(true);
    b = applyGamepadEvent(b, { type: "connect", index: 2, mapping: "standard" });
    expect(visibleStatus(b).length).toBe(2);
    persist("da30-032-gamepad-lifecycle.json", { bindings: b, status: visibleStatus(b), ok: true });
  });

  it("DA30-033 SOCD profile store reopen/swap/reset/corrupt", () => {
    const store = createStore();
    const raw = serializeStore(store);
    const opened = openStore(raw);
    expect(opened.ok).toBe(true);
    const swapped = swapSeats(store);
    expect(swapped.profiles.p1?.seat).toBe(1);
    const reset = resetSeat(store, "p1");
    expect(reset.profiles.p1?.revision).toBeGreaterThan(store.profiles.p1!.revision);
    const corrupt = openStore("{not-json");
    expect(corrupt.ok).toBe(false);
    expect(corrupt.store.profiles.p1).toBeTruthy();
    persist("da30-033-socd-profile-store.json", {
      ok: true,
      swapped: true,
      corruptReason: corrupt.ok ? null : corrupt.reason,
    });
  });

  it("DA30-036 clock domain audit inventory", () => {
    const audit = buildClockDomainAudit();
    expect(audit.domains.length).toBeGreaterThanOrEqual(10);
    expect(audit.domains.some((d) => d.id === "hitpause")).toBe(true);
    persist("da30-036-clock-domain-audit.json", audit);
  });

  it("DA30-042 Nadia reciprocal contact/guard", () => {
    const r = runNadiaContactCases();
    expect(r.ok).toBe(true);
    persist("da30-042-nadia-contact.json", r);
  });

  it("DA30-044 guard/priority matrix cases", () => {
    const r = runGuardPriorityMatrix();
    expect(r.ok).toBe(true);
    persist("da30-044-guard-priority-matrix.json", r);
  });

  it("DA30-049 round reset ledger", () => {
    const ledger = buildRoundResetLedger();
    expect(ledger.owners.length).toBeGreaterThanOrEqual(10);
    persist("da30-049-round-reset-ledger.json", ledger);
  });

  it("DA30-041 still green for Rocco contact", () => {
    expect(runRoccoContactCases().ok).toBe(true);
  });

  it("DA30-043 Rocco and Nadia package files are complete and distinct", () => {
    const packages = [
      { id: "rocco-vidal", base: "rocco" },
      { id: "nadia-arce", base: "nadia" },
    ];
    const digests = packages.map(({ id, base }) => {
      const mugen = resolve(process.cwd(), "public/characters", id, "mugen");
      expect(existsSync(mugen)).toBe(true);
      const files = readdirSync(mugen);
      for (const extension of [".def", ".cmd", ".cns", ".air"]) {
        expect(files).toContain(`${base}${extension}`);
      }
      const hash = createHash("sha256");
      for (const file of files.sort()) {
        hash.update(file);
        hash.update("\0");
        hash.update(readFileSync(resolve(mugen, file)));
      }
      return { id, files, digest: hash.digest("hex") };
    });
    expect(digests[0]!.digest).not.toBe(digests[1]!.digest);
    persist("da30-043-current-roster-packages.json", {
      ok: true,
      packages: digests,
      independentDigests: digests[0]!.digest !== digests[1]!.digest,
    });
  });
});
