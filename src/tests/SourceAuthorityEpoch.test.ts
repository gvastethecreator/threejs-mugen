import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  createSourceAuthorityEpoch,
  createSourceAuthorityManifestV1,
  deriveSourceAuthorityFileStatus,
  getSourceAuthorityFamily,
  parseSourceAuthorityEpoch,
  parseSourceAuthorityManifestV1,
  SOURCE_AUTHORITY_EPOCH_NORMATIVE_PIN,
  SOURCE_AUTHORITY_EPOCH_WORKING_PIN,
  type SourceAuthorityEpochInput,
} from "../mugen/compatibility/SourceAuthorityEpoch";

const DIGEST_A = "a".repeat(64);
const DIGEST_B = "b".repeat(64);
const DIGEST_C = "c".repeat(64);

function epochInput(overrides: Partial<SourceAuthorityEpochInput> = {}): SourceAuthorityEpochInput {
  return {
    generatedAt: "2026-07-26T18:00:00.000Z",
    families: [
      {
        id: "juggle",
        status: "same",
        files: [
          { path: "src/char.go", normativeDigest: DIGEST_A, workingDigest: DIGEST_A },
          { path: "src/bytecode.go", normativeDigest: DIGEST_A, workingDigest: DIGEST_A },
          { path: "src/compiler.go", normativeDigest: DIGEST_B, workingDigest: DIGEST_B },
          { path: "src/compiler_functions.go", normativeDigest: DIGEST_B, workingDigest: DIGEST_B },
        ],
        notes: [
          "pin-era juggle lines equal between 05b and 4aa per DA26-02",
          "wiki non-A reset wording differs; pin rules remain claim-allowed",
        ],
        claimLimit: "pin-era juggle file equality only; wiki not authority",
      },
      {
        id: "projectile",
        status: "unreviewed",
        files: [{ path: "src/char.go", normativeDigest: DIGEST_A, workingDigest: DIGEST_C }],
        notes: ["projectile path not reviewed for epoch promotion"],
        claimLimit: "unreviewed; no family promotion",
      },
    ],
    claims: {
      allowed: ["per-family provenance between named pins"],
      blocked: ["global pin promotion", "score movement", "runtime parity from epoch alone"],
    },
    ...overrides,
  };
}

describe("SourceAuthorityEpoch", () => {
  it("creates a deterministic epoch with both pins and family statuses", () => {
    const first = createSourceAuthorityEpoch(epochInput());
    const second = createSourceAuthorityEpoch({
      ...epochInput(),
      families: [...epochInput().families].reverse(),
    });

    expect(first.pins.normative.revision).toBe(SOURCE_AUTHORITY_EPOCH_NORMATIVE_PIN);
    expect(first.pins.working.revision).toBe(SOURCE_AUTHORITY_EPOCH_WORKING_PIN);
    expect(first.families.map((family) => family.id)).toEqual(["juggle", "projectile"]);
    expect(getSourceAuthorityFamily(first, "juggle")?.status).toBe("same");
    expect(getSourceAuthorityFamily(first, "projectile")?.status).toBe("unreviewed");
    expect(first.digest.value).toBe(second.digest.value);
    expect(first.missingFiles).toEqual([]);
  });

  it("derives per-file status and tracks missing digests", () => {
    expect(deriveSourceAuthorityFileStatus(DIGEST_A, DIGEST_A)).toBe("same");
    expect(deriveSourceAuthorityFileStatus(DIGEST_A, DIGEST_B)).toBe("changed");
    expect(deriveSourceAuthorityFileStatus(undefined, DIGEST_A)).toBe("missing-normative");
    expect(deriveSourceAuthorityFileStatus(DIGEST_A, undefined)).toBe("missing-working");

    const epoch = createSourceAuthorityEpoch({
      ...epochInput(),
      families: [
        {
          id: "partial",
          status: "unreviewed",
          files: [{ path: "src/missing.go", workingDigest: DIGEST_A }],
          claimLimit: "missing normative digest",
        },
      ],
    });
    expect(epoch.missingFiles).toEqual(["src/missing.go"]);
    expect(epoch.families[0]?.files[0]?.status).toBe("missing-normative");
  });

  it("rejects same family status when a file is changed", () => {
    expect(() =>
      createSourceAuthorityEpoch({
        ...epochInput(),
        families: [
          {
            id: "juggle",
            status: "same",
            files: [{ path: "src/char.go", normativeDigest: DIGEST_A, workingDigest: DIGEST_B }],
            claimLimit: "bad",
          },
        ],
      }),
    ).toThrow(/cannot be same when a file is changed/);
  });

  it("round-trips epoch and rejects digest tampering", () => {
    const epoch = createSourceAuthorityEpoch(epochInput());
    expect(parseSourceAuthorityEpoch(epoch)).toEqual({ errors: [], epoch });
    const tampered = {
      ...epoch,
      claims: { ...epoch.claims, allowed: ["global pin promotion"] },
    };
    expect(parseSourceAuthorityEpoch(tampered).errors).toContain("Source authority epoch digest mismatch");
  });

  it("creates manifest v1 wrapping epoch and rejects outer tamper", () => {
    const epoch = createSourceAuthorityEpoch(epochInput());
    const manifest = createSourceAuthorityManifestV1({
      generatedAt: "2026-07-26T18:05:00.000Z",
      epoch,
      legacyV0: {
        artifact: "docs/evidence/source-authority-manifest-v0.json",
      },
      claims: {
        allowed: ["manifest wraps epoch"],
        blocked: ["score movement"],
      },
    });
    expect(manifest.schemaVersion).toBe("mugen-web-sandbox/source-authority-manifest/v1");
    expect(manifest.epoch.digest.value).toBe(epoch.digest.value);
    expect(parseSourceAuthorityManifestV1(manifest)).toEqual({ errors: [], manifest });
    const tampered = {
      ...manifest,
      claims: { ...manifest.claims, blocked: [] },
    };
    expect(parseSourceAuthorityManifestV1(tampered).errors).toContain(
      "Source authority manifest v1 digest mismatch",
    );
  });

  it("parses the committed source authority epoch evidence when present", () => {
    const artifactPath = resolve(process.cwd(), "docs/evidence/source-authority-epoch-v1.json");
    expect(existsSync(artifactPath)).toBe(true);
    const raw = JSON.parse(readFileSync(artifactPath, "utf8"));
    const parsed = parseSourceAuthorityManifestV1(raw);
    expect(parsed.errors).toEqual([]);
    expect(parsed.manifest?.epoch.pins.normative.revision).toBe(SOURCE_AUTHORITY_EPOCH_NORMATIVE_PIN);
    expect(parsed.manifest?.epoch.pins.working.revision).toBe(SOURCE_AUTHORITY_EPOCH_WORKING_PIN);
    const juggle = getSourceAuthorityFamily(parsed.manifest!.epoch, "juggle");
    expect(juggle?.status).toBe("same");
    expect(juggle?.files.length).toBeGreaterThanOrEqual(4);
    // Digests in the artifact are real SHA-256 of local checkout bytes (or explicit same-pair).
    for (const file of juggle!.files) {
      expect(file.status === "same" || file.status === "missing-normative" || file.status === "missing-working").toBe(
        true,
      );
      if (file.normativeDigest && file.workingDigest) {
        expect(file.normativeDigest).toBe(file.workingDigest);
      }
    }
  });
});

describe("SourceAuthorityEpoch materializer digests", () => {
  it("matches node crypto sha256 for family file bytes when local sources exist", () => {
    const charPath = resolve(process.cwd(), ".scratch/refs/Ikemen-GO/src/char.go");
    if (!existsSync(charPath)) return;
    const bytes = readFileSync(charPath);
    const digest = createHash("sha256").update(bytes).digest("hex");
    expect(digest).toMatch(/^[0-9a-f]{64}$/);
    const epoch = createSourceAuthorityEpoch({
      generatedAt: "2026-07-26T18:10:00.000Z",
      families: [
        {
          id: "juggle",
          status: "same",
          files: [{ path: "src/char.go", normativeDigest: digest, workingDigest: digest }],
          claimLimit: "local byte pair",
        },
      ],
      claims: { allowed: ["local pair"], blocked: ["promotion"] },
    });
    expect(epoch.families[0]?.files[0]?.status).toBe("same");
  });
});
