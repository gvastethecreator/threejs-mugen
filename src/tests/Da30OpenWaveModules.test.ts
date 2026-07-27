import { describe, expect, it } from "vitest";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
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
import { runMiraContactCases } from "../mugen/da30/MiraContactRevalidation";
import { runGuardPriorityMatrix } from "../mugen/da30/GuardPriorityMatrix";
import { buildRoundResetLedger } from "../mugen/da30/RoundResetLedger";
import { runNovaContactCases } from "../mugen/da30/CombatJourneyRevalidation";
import { existsSync, readFileSync, readdirSync } from "node:fs";

const evidence = resolve(process.cwd(), "docs/evidence/da30");
function persist(name: string, body: unknown) {
  mkdirSync(evidence, { recursive: true });
  writeFileSync(resolve(evidence, name), `${JSON.stringify(body, null, 2)}\n`, "utf8");
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
    persist("da30-033-socd-profile-store.json", { ok: true, swapped: true, corruptReason: corrupt.reason });
  });

  it("DA30-036 clock domain audit inventory", () => {
    const audit = buildClockDomainAudit();
    expect(audit.domains.length).toBeGreaterThanOrEqual(10);
    expect(audit.domains.some((d) => d.id === "hitpause")).toBe(true);
    persist("da30-036-clock-domain-audit.json", audit);
  });

  it("DA30-042 Mira reciprocal contact/guard", () => {
    const r = runMiraContactCases();
    expect(r.ok).toBe(true);
    persist("da30-042-mira-contact.json", r);
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

  it("DA30-041 still green for nova contact", () => {
    expect(runNovaContactCases().ok).toBe(true);
  });

  it("DA30-043 rook package files distinct from nova/mira", () => {
    const rook = resolve(process.cwd(), "public/characters/rook-apprentice/mugen");
    expect(existsSync(rook)).toBe(true);
    const files = readdirSync(rook);
    expect(files.some((f) => f.endsWith(".cns"))).toBe(true);
    expect(files.some((f) => f.endsWith(".air"))).toBe(true);
    expect(files.some((f) => f.endsWith(".cmd"))).toBe(true);
    const cns = readFileSync(resolve(rook, files.find((f) => f.endsWith(".cns"))!), "utf8");
    const nova = readFileSync(resolve(process.cwd(), "public/characters/nova-boxer/mugen/nova.cns"), "utf8");
    const mira = readFileSync(resolve(process.cwd(), "public/characters/mira-volt/mugen/mira.cns"), "utf8");
    expect(cns.length).not.toBe(nova.length);
    expect(cns.includes("rook") || cns.length !== mira.length).toBe(true);
    persist("da30-043-rook-package.json", {
      ok: true,
      files: files.slice(0, 20),
      cnsBytes: cns.length,
      novaBytes: nova.length,
      miraBytes: mira.length,
      distinctSizeFromNova: cns.length !== nova.length,
    });
  });
});
