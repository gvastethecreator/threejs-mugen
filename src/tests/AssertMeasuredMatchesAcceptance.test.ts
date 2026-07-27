import { describe, expect, it } from "vitest";
import {
  assertMeasuredMatchesAcceptance,
  isAdjudicationReleaseCut,
  isCombatContactJourneyCut,
} from "../mugen/da29/AssertMeasuredMatchesAcceptance";

describe("assertMeasuredMatchesAcceptance", () => {
  it("rejects DA29-041 HitDef-count-only theater", () => {
    const result = assertMeasuredMatchesAcceptance({
      id: "DA29-041",
      kind: "I",
      acceptance:
        "Imported route proves command, state entry, collision, HitDef admission, contact, damage, hitpause, target state, telemetry, and final checksum without synthetic sprites.",
      cut: "Turn Nova's attack-state probe into an actual contact journey.",
      measured: {
        id: "DA29-041",
        ok: true,
        acceptanceExecuted: true,
        functionResults: {
          hitDefCount: 12,
          states: 40,
          sampleHitDefLines: [100, 200],
        },
        anchors: ["public/characters/nova-boxer/mugen/nova.cns"],
      },
    });
    expect(result.ok).toBe(false);
    expect(result.class).toBe("combat-journey");
    expect(result.reason).toMatch(/HitDef-count-only|missing facts|parse-only/i);
  });

  it("rejects circular DA29-150/200 ledger re-read", () => {
    for (const id of ["DA29-150", "DA29-200"] as const) {
      const result = assertMeasuredMatchesAcceptance({
        id,
        kind: "G",
        acceptance: "Independent evidence review records accepted/rejected facts and release decision.",
        cut: "Run final score, compatibility, product, and release adjudication.",
        measured: {
          id,
          ok: true,
          acceptanceExecuted: true,
          functionResults: {
            scores: { sandbox: "65" },
            held: true,
            closedThroughAtAdjudication: "DA29-149",
            closedCount: 149,
          },
          anchors: [
            "docs/evidence/authority-selector-v1.json",
            "docs/evidence/da29/closeout-status-v1.json",
          ],
        },
      });
      expect(result.ok, id).toBe(false);
      expect(result.class, id).toBe("adjudication-review");
    }
  });

  it("accepts minimal valid combat journey fixture", () => {
    const result = assertMeasuredMatchesAcceptance({
      id: "DA29-041",
      kind: "I",
      acceptance: "Imported route proves command, state entry, collision, HitDef admission, contact, damage, hitpause, target state, telemetry, and final checksum.",
      measured: {
        id: "DA29-041",
        ok: true,
        acceptanceExecuted: true,
        functionResults: {
          command: "a",
          stateEntry: 200,
          collision: true,
          hitDefAdmission: true,
          contact: true,
          damage: 20,
          hitpause: 4,
          targetState: 5000,
          checksum: "abc123",
        },
        anchors: ["src/mugen/runtime/CombatResolver.ts"],
      },
    });
    expect(result.ok).toBe(true);
    expect(result.class).toBe("combat-journey");
  });

  it("accepts independent review fixture for adjudication", () => {
    const result = assertMeasuredMatchesAcceptance({
      id: "DA29-150",
      kind: "G",
      acceptance: "Independent evidence review records accepted/rejected facts, exact score changes, release decision, known gaps.",
      measured: {
        id: "DA29-150",
        ok: true,
        acceptanceExecuted: true,
        functionResults: {
          accepted: ["scores-held"],
          rejected: ["score-inflation"],
          gaps: ["browser-breadth"],
          decision: "hold-release",
        },
        anchors: ["docs/evidence/da29/reviews/da29-150-adjudication-review.json"],
      },
    });
    expect(result.ok).toBe(true);
    expect(result.class).toBe("adjudication-review");
  });

  it("classifies combat and adjudication cuts", () => {
    expect(
      isCombatContactJourneyCut({
        id: "DA29-041",
        kind: "I",
        acceptance: "x",
      }),
    ).toBe(true);
    expect(
      isAdjudicationReleaseCut({
        id: "DA29-150",
        kind: "G",
        acceptance: "x",
      }),
    ).toBe(true);
  });
});
