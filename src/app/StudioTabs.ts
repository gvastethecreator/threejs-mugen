export type StudioTab = "workbench" | "assets" | "inspector" | "stage" | "debug" | "evidence" | "modules" | "build";

export type StudioTabDefinition = {
  id: StudioTab;
  label: string;
  summary: string;
};

export const STUDIO_TABS: StudioTabDefinition[] = [
  { id: "workbench", label: "Workbench", summary: "Project playtest, manifests, assets, and gates" },
  { id: "assets", label: "Assets", summary: "Project asset library, provenance, validation status, and blocked records" },
  { id: "inspector", label: "Inspector", summary: "AIR timeline, parsed data, and package diagnostics" },
  { id: "stage", label: "Stage", summary: "Stage floor, bounds, camera, BG layers, and import gaps" },
  { id: "debug", label: "Debug", summary: "Runtime actors, ownership, commands, combat, and snapshot facts" },
  { id: "evidence", label: "Evidence", summary: "Compatibility levels, trace artifacts, diagnostics, and QA gates" },
  { id: "modules", label: "Modules", summary: "Engine module graph and runtime contracts" },
  { id: "build", label: "Build", summary: "Exports, reports, local projects, and QA outputs" },
];

export function parseStudioTab(value: string | null | undefined): StudioTab | undefined {
  if (value === "inspect") {
    return "inspector";
  }
  return STUDIO_TABS.find((tab) => tab.id === value)?.id;
}
