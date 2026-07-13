export type ExternalFixtureManifest = Readonly<{
  schema: "ExternalFixtureManifest/v1";
  id: string;
  displayName: string;
  source: Readonly<{
    url: string;
    licenseSpdx: string;
    licensePath: string;
    readmePath: string;
  }>;
  archive: Readonly<{
    relativePath: string;
    sha256: string;
    sizeBytes: number;
    definitionPath: string;
    requiredEntries: readonly string[];
  }>;
  expected: Readonly<{
    displayName: string;
    author: string;
    paletteCount: number;
    requiredAnimations: readonly number[];
    requiredCommands: readonly string[];
    requiredStates: readonly number[];
  }>;
}>;

export const CODE_FUMAN_FIXTURE_MANIFEST = {
  schema: "ExternalFixtureManifest/v1",
  id: "codefuman",
  displayName: "Code Fu Man",
  source: {
    url: "https://github.com/Jesuszilla/CodeFuMan",
    licenseSpdx: "MIT",
    licensePath: "chars/cfm/LICENSE",
    readmePath: "chars/cfm/README.md",
  },
  archive: {
    relativePath: ".scratch/fixtures/codefuman.zip",
    sha256: "7974f5101a3f3bca0ef3aef3b491fc34d81cbc132d91b53a51b78f34819b1ca0",
    sizeBytes: 307511,
    definitionPath: "chars/cfm/cfm.def",
    requiredEntries: [
      "chars/cfm/LICENSE",
      "chars/cfm/README.md",
      "chars/cfm/cfm.def",
      "chars/cfm/ending.def",
      "chars/cfm/ending.sff",
      "chars/cfm/intro.def",
      "chars/cfm/intro.sff",
      "chars/cfm/kfm.act",
      "chars/cfm/kfm.ai",
      "chars/cfm/kfm.air",
      "chars/cfm/kfm.cmd",
      "chars/cfm/kfm.cns",
      "chars/cfm/kfm.sff",
      "chars/cfm/kfm.snd",
      "chars/cfm/kfm2.act",
      "chars/cfm/kfm3.act",
      "chars/cfm/kfm4.act",
      "chars/cfm/kfm5.act",
      "chars/cfm/kfm6.act",
      "data/common1.cns",
    ],
  },
  expected: {
    displayName: "Code Fu Man",
    author: "Trinity MUGEN",
    paletteCount: 6,
    requiredAnimations: [0, 11, 20, 40, 200, 210, 5000],
    requiredCommands: ["x", "QCF_x"],
    requiredStates: [0, 200, 210, 5000],
  },
} as const satisfies ExternalFixtureManifest;
