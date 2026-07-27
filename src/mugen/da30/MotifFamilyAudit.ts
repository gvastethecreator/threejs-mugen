/**
 * DA30-067: motif/screenpack/lifebar/storyboard research map.
 */

export type MotifFamilyRow = {
  family: string;
  formats: string[];
  sections: string[];
  assets: string[];
  transforms: string[];
  timing: string;
  modes: string[];
  scannerState: "recognized" | "partial" | "unknown";
  runtimeOwner: string;
  openRisk: string;
  extensionLane: "mugen" | "ikemen" | "both";
};

export function buildMotifFamilyAudit(): {
  schema: "Da30MotifFamilyAudit/v1";
  rows: MotifFamilyRow[];
  ok: boolean;
} {
  const rows: MotifFamilyRow[] = [
    {
      family: "system.def motif",
      formats: ["def"],
      sections: ["Info", "Files", "Title Info", "Select Info"],
      assets: ["sff", "snd", "fnt"],
      transforms: ["localcoord", "offset"],
      timing: "fade/input windows",
      modes: ["title", "select", "versus"],
      scannerState: "partial",
      runtimeOwner: "app/motif",
      openRisk: "full screenpack fidelity",
      extensionLane: "mugen",
    },
    {
      family: "fight.def lifebar",
      formats: ["def"],
      sections: ["Lifebar", "Powerbar", "Face", "Name", "Time"],
      assets: ["sff", "fnt"],
      transforms: ["scale", "offset"],
      timing: "round display",
      modes: ["fight"],
      scannerState: "partial",
      runtimeOwner: "hud",
      openRisk: "team slots",
      extensionLane: "mugen",
    },
    {
      family: "storyboard",
      formats: ["def", "air"],
      sections: ["SceneDef", "Scene"],
      assets: ["sff", "snd"],
      transforms: ["layer order"],
      timing: "scene duration",
      modes: ["intro", "ending"],
      scannerState: "recognized",
      runtimeOwner: "storyboard",
      openRisk: "ikemen extensions",
      extensionLane: "both",
    },
    {
      family: "ikemen screenpack ext",
      formats: ["def", "zss"],
      sections: ["ext.*"],
      assets: ["lua?", "external"],
      transforms: ["module hooks"],
      timing: "unknown",
      modes: ["title+"],
      scannerState: "unknown",
      runtimeOwner: "blocked",
      openRisk: "lua host",
      extensionLane: "ikemen",
    },
  ];
  return {
    schema: "Da30MotifFamilyAudit/v1",
    rows,
    ok: rows.length >= 4 && rows.some((r) => r.extensionLane === "ikemen") && rows.some((r) => r.extensionLane === "mugen"),
  };
}
