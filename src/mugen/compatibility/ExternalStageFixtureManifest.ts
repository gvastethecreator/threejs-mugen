export type ExternalStageFixtureManifest = Readonly<{
  schema: "ExternalStageFixtureManifest/v1";
  id: string;
  displayName: string;
  source: Readonly<{
    url: string;
    licenseSpdx: string;
    licensePath: string;
    readmePath: string;
  }>;
  directory: Readonly<{
    relativePath: string;
    definitionPath: string;
    spritePath: string;
    requiredFiles: readonly string[];
  }>;
  expected: Readonly<{
    stageDisplayName: string;
    resetBackgroundBetweenRounds: boolean;
    localCoord: readonly [number, number];
    minimumLayers: number;
  }>;
}>;

export const OFFICIAL_MUGEN_STAGE_FIXTURE_MANIFEST = {
  schema: "ExternalStageFixtureManifest/v1",
  id: "mugen-official-stage0",
  displayName: "Elecbyte MUGEN 1.1b1 Training Room stage",
  source: {
    url: "https://www.elecbyte.com/mugenfiles/1.1/mugen-1.1b1.zip",
    licenseSpdx: "CC-BY-NC-3.0",
    licensePath: "readme.txt",
    readmePath: "readme.txt",
  },
  directory: {
    relativePath: ".scratch/external/mugen-1.1b1",
    definitionPath: "stages/stage0.def",
    spritePath: "stages/stage0.sff",
    requiredFiles: ["readme.txt", "stages/stage0.def", "stages/stage0.sff"],
  },
  expected: {
    stageDisplayName: "Training Room",
    resetBackgroundBetweenRounds: true,
    localCoord: [320, 240],
    minimumLayers: 2,
  },
} as const satisfies ExternalStageFixtureManifest;
